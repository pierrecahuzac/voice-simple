import { useEffect } from "react";
import { useRoomStore } from "./store/useRoomStore";
import { useVoiceRoom } from "./hooks/useVoiceRoom";

export default function App() {
  const username = useRoomStore((s) => s.username);
  const roomId = useRoomStore((s) => s.roomId);
  const joined = useRoomStore((s) => s.joined);
  const localMuted = useRoomStore((s) => s.localMuted);
  const peers = useRoomStore((s) => s.peers);
  const setUsername = useRoomStore((s) => s.setUsername);
  const setRoomId = useRoomStore((s) => s.setRoomId);
  const { start, stop, toggleMute } = useVoiceRoom();

  useEffect(() => {
    return () => {
      if (useRoomStore.getState().joined) stop();
    };
  }, [stop]);

  const peerList = Object.values(peers);

  if (!joined) {
    return (
      <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 420, margin: "0 auto" }}>
        <h1>Voice Simple</h1>
        <label style={{ display: "block", marginBottom: 8 }}>
          Pseudo
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Salon
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <button onClick={start} disabled={!username.trim()} style={{ padding: "8px 16px" }}>
          Rejoindre
        </button>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Salon: {roomId}</h1>
        <div>
          <button onClick={toggleMute} style={{ marginRight: 8, padding: "8px 16px" }}>
            {localMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={stop} style={{ padding: "8px 16px" }}>
            Quitter
          </button>
        </div>
      </header>
      <section style={{ marginTop: 24 }}>
        <h2>Participants ({peerList.length + 1})</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ padding: 8, background: "#f2f2f2", marginBottom: 4, borderRadius: 4 }}>
            {username} (vous) {localMuted ? "🔇" : "🎤"}
          </li>
          {peerList.map((p) => (
            <li key={p.id} style={{ padding: 8, background: p.speaking ? "#d4f5d4" : "#f2f2f2", marginBottom: 4, borderRadius: 4 }}>
              {p.username} {p.muted ? "🔇" : "🎤"} {p.speaking ? "🔊" : ""}
              {p.stream && (
                <audio
                  autoPlay
                  ref={(el) => {
                    if (el) el.srcObject = p.stream!;
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
