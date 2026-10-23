export type RoomId = string;
export type PeerId = string;

export interface JoinRoomPayload {
  roomId: RoomId;
}

export interface PeerJoinedPayload {
  peerId: PeerId;
  username: string;
}

export interface PeerLeftPayload {
  peerId: PeerId;
}

export interface SignalPayload {
  to: PeerId;
  data: unknown;
}

export interface MuteStatePayload {
  peerId: PeerId;
  muted: boolean;
}

export const SOCKET_EVENTS = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  PEER_JOINED: "peer-joined",
  PEER_LEFT: "peer-left",
  SIGNAL: "signal",
  MUTE_STATE: "mute-state",
} as const;
