# Pitchvideo – Mur vidéo éphémère façon TikTok/Instagram

## Fonctionnalités principales
- Mur vidéo vertical scrollable, plein écran
- Vidéos éphémères (disparaissent après 24h)
- Chat d’exemple sous chaque vidéo
- Bouton WhatsApp pour contacter le créateur
- Design moderne, sombre, mobile-first

## Structure
- Les vidéos sont dans `public/videos/`
- Les métadonnées sont dans `data/videos.json`

## Déploiement Netlify
1. Poussez ce dossier sur GitHub.
2. Sur Netlify, créez un nouveau site à partir de ce repo.
3. Netlify détectera Next.js automatiquement.
4. Build command : `npm run build`
5. Publish directory : `.next`

## Démarrage local
```bash
npm install
npm run dev
```

---
Pour toute personnalisation, modifiez les fichiers dans `src/` et la config Tailwind dans `tailwind.config.js`.
