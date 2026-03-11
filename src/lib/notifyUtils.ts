// Utilitaire pour envoyer une notification push via le navigateur
// Nécessite l'abonnement du client au service worker
export async function subscribeToPush(userId: string) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.register('/sw.js');
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: '<VAPID_PUBLIC_KEY>' // À remplacer par votre clé VAPID publique
    });
    // Enregistrez l'abonnement côté serveur (Supabase)
    await fetch('/api/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription: sub }),
    });
    return sub;
  }
  throw new Error('Push non supporté');
}

export async function showLocalNotification(title, options) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(function(reg) {
      if (reg) reg.showNotification(title, options);
    });
  }
}
