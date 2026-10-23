# Architecture — Voice Simple

## Structure monorepo
```
voice-simple/
├── client/          # React app
├── server/          # signalisation Node
├── shared/          # types TS partagés
├── docs/
└── docker-compose.yml
```

## Flux de connexion à un salon
1. Client s'authentifie → JWT
2. Client ouvre WebSocket (socket.io) avec JWT
3. Client émet `join-room {roomId}`
4. Serveur notifie les pairs présents (`peer-joined`)
5. Négociation WebRTC (offer/answer) via signalisation (`signal`)
6. Échange ICE candidates
7. Connexion P2P établie → audio direct

## Événements socket (contrat)
- `join-room(roomId)`
- `leave-room(roomId)`
- `peer-joined({peerId, username})`
- `peer-left({peerId})`
- `signal({to, data})`  // SDP/ICE relayé
- `mute-state({peerId, muted})`

## Modèle de données (minimal)
- User(id, username, passwordHash, createdAt)
- Server(id, name, ownerId)
- Room(id, name, serverId, type: 'voice')
- Membership(userId, serverId)

## Sécurité
- JWT court (15min) + refresh
- HTTPS obligatoire (getUserMedia)
- Validation des payloads (zod)
- Rate limiting sur auth et join
- Pas de stockage audio

## Évolutions prévues
- V2: SFU pour >6 participants
- V2: chat texte
- V3: rôles/permissions
