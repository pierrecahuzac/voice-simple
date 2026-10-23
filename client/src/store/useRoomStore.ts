import { create } from "zustand";

export interface Peer {
  id: string;
  username: string;
  muted: boolean;
  speaking: boolean;
  stream?: MediaStream;
}

interface RoomState {
  username: string;
  roomId: string;
  joined: boolean;
  localMuted: boolean;
  error: string | null;
  peers: Record<string, Peer>;
  setUsername: (v: string) => void;
  setRoomId: (v: string) => void;
  setJoined: (v: boolean) => void;
  setLocalMuted: (v: boolean) => void;
  setError: (v: string | null) => void;
  addPeer: (peer: Peer) => void;
  removePeer: (id: string) => void;
  updatePeer: (id: string, patch: Partial<Peer>) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  username: "",
  roomId: "general",
  joined: false,
  localMuted: false,
  error: null,
  peers: {},
  setUsername: (username) => set({ username }),
  setRoomId: (roomId) => set({ roomId }),
  setJoined: (joined) => set({ joined }),
  setLocalMuted: (localMuted) => set({ localMuted }),
  setError: (error) => set({ error }),
  addPeer: (peer) =>
    set((s) => ({ peers: { ...s.peers, [peer.id]: peer } })),
  removePeer: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.peers;
      return { peers: rest };
    }),
  updatePeer: (id, patch) =>
    set((s) => {
      const p = s.peers[id];
      if (!p) return s;
      return { peers: { ...s.peers, [id]: { ...p, ...patch } } };
    }),
  reset: () => set({ joined: false, peers: {}, localMuted: false, error: null }),
}));
