// Script Node.js pour supprimer les vidéos expirées (plus de 24h)
// À lancer via `node scripts/cleanupExpiredVideos.js`

const fs = require('fs');
const path = require('path');

const videosJsonPath = path.join(__dirname, '../data/videos.json');
const videosDir = path.join(__dirname, '../public/videos/');
const now = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

let videos = [];
if (fs.existsSync(videosJsonPath)) {
  videos = JSON.parse(fs.readFileSync(videosJsonPath, 'utf-8'));
}

const validVideos = [];
for (const video of videos) {
  const ts = typeof video.timestamp === 'string' ? Date.parse(video.timestamp) : video.timestamp;
  if (ts && now - ts < DAY_MS) {
    validVideos.push(video);
  } else {
    // Supprimer le fichier vidéo
    if (video.src) {
      const filePath = path.join(videosDir, path.basename(video.src));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Supprimé :', filePath);
      }
    }
  }
}

// Réécrire videos.json avec les vidéos valides
fs.writeFileSync(videosJsonPath, JSON.stringify(validVideos, null, 2));
console.log('Nettoyage terminé.');
