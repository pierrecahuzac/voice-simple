# Cahier des charges — Voice Simple

## Vision
Système vocal simple type "salon vocal" (inspiré de Discord), sans ambitions de plateforme complète. Objectif: permettre à un petit groupe d'utilisateurs de parler en temps réel dans des salons audio, avec présence et statuts.

## Périmètre (MVP)
- Authentification simple (pseudo + mot de passe, ou lien magique)
- Liste de serveurs / salons audio
- Rejoindre/quitter un salon vocal
- Transmission audio bidirectionnelle (WebRTC)
- Indicateur de qui parle (voice activity)
- Mute / unmute micro
- Liste des participants présents dans le salon
- Statut en ligne / hors ligne

## Hors périmètre (MVP)
- Vidéo, partage d'écran
- Chat texte avancé (optionnel V2)
- Rôles/permissions complexes
- Bots, intégrations
- Enregistrement
- Mobile natif (web responsive suffit)

## Utilisateurs cibles
- Petits groupes (2 à ~15 personnes par salon)
- Usage occasionnel, faible latence souhaitée

## Contraintes
- Web-first (navigateur)
- Pas d'infra lourde: un seul serveur de signalisation
- Audio P2P quand possible, fallback SFU si > N participants
- Coût minimal

## Critères de succès
- Connexion audio stable à 4 participants sur réseau domestique
- Latence < 200ms perçue
- Rejoindre un salon en < 3s
- Aucune installation client
