import { useRef, useCallback } from "react";
import { getSocket } from "../lib/socket";
import { useRoomStore } from "../store/useRoomStore";
import { SOCKET_EVENTS } from "@voice-simple/shared";

interface VADHandle {
  ctx: AudioContext;
  raf: number;
}

export function useVoiceRoom() {
  const store = useRoomStore();
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const vadsRef = useRef<Map<string, VADHandle>>(new Map());
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const startVAD = useCallback((id: string, stream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const loop = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const rms = sum / data.length;
      useRoomStore.getState().updatePeer(id, { speaking: rms > 12 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    vadsRef.current.set(id, { ctx, raf });
  }, []);

  const stopVAD = useCallback((id: string) => {
    const h = vadsRef.current.get(id);
    if (h) {
      cancelAnimationFrame(h.raf);
      h.ctx.close();
      vadsRef.current.delete(id);
    }
  }, []);

  const createPC = useCallback((peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcsRef.current.set(peerId, pc);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        if (localStreamRef.current) pc.addTrack(t, localStreamRef.current);
      });
    }
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.SIGNAL, {
          to: peerId,
          data: { type: "ice", candidate: e.candidate },
        });
      }
    };
    pc.ontrack = (e) => {
      const stream = e.streams[0];
      useRoomStore.getState().updatePeer(peerId, { stream });
      startVAD(peerId, stream);
    };
    return pc;
  }, [startVAD]);

  const start = useCallback(async () => {
    try {
      useRoomStore.getState().setError(null);
      const socket = getSocket();
      socketRef.current = socket;
      socket.connect();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      startVAD("local", stream);

      socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: useRoomStore.getState().roomId });

    socket.on("room-peers", async (peers: string[]) => {
      for (const peerId of peers) {
        useRoomStore.getState().addPeer({ id: peerId, username: peerId, muted: false, speaking: false });
        const pc = createPC(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(SOCKET_EVENTS.SIGNAL, {
          to: peerId,
          data: { type: "sdp", sdp: offer },
        });
      }
    });

    socket.on(SOCKET_EVENTS.PEER_JOINED, ({ peerId, username }: { peerId: string; username: string }) => {
      useRoomStore.getState().addPeer({ id: peerId, username, muted: false, speaking: false });
    });

    socket.on(SOCKET_EVENTS.PEER_LEFT, ({ peerId }: { peerId: string }) => {
      useRoomStore.getState().removePeer(peerId);
      pcsRef.current.get(peerId)?.close();
      pcsRef.current.delete(peerId);
      stopVAD(peerId);
    });

    socket.on(SOCKET_EVENTS.SIGNAL, async ({ from, data }: { from: string; data: any }) => {
      let pc = pcsRef.current.get(from);
      if (!pc) {
        if (!useRoomStore.getState().peers[from]) {
          useRoomStore.getState().addPeer({ id: from, username: from, muted: false, speaking: false });
        }
        pc = createPC(from);
      }
      if (data.type === "sdp") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit(SOCKET_EVENTS.SIGNAL, {
            to: from,
            data: { type: "sdp", sdp: answer },
          });
        }
      } else if (data.type === "ice") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          // ignore
        }
      }
    });

    socket.on(SOCKET_EVENTS.MUTE_STATE, ({ peerId, muted }: { peerId: string; muted: boolean }) => {
      useRoomStore.getState().updatePeer(peerId, { muted });
    });

    useRoomStore.getState().setJoined(true);
    } catch (e) {
      useRoomStore.getState().setError(e instanceof Error ? e.message : "Erreur micro/signalisation");
    }
  }, [createPC, startVAD, stopVAD]);

  const stop = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId: useRoomStore.getState().roomId });
      socket.disconnect();
    }
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    vadsRef.current.forEach((_, id) => stopVAD(id));
    useRoomStore.getState().reset();
  }, [stopVAD]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    const newMuted = !useRoomStore.getState().localMuted;
    track.enabled = !newMuted;
    useRoomStore.getState().setLocalMuted(newMuted);
    socketRef.current?.emit(SOCKET_EVENTS.MUTE_STATE, { muted: newMuted });
  }, []);

  return { start, stop, toggleMute };
}
