// Script Node.js pour envoyer une notification push à tous les abonnés enregistrés dans Supabase
// Nécessite les modules: web-push, @supabase/supabase-js

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jxhgmetivgnsphyowjcw.supabase.co';
const SUPABASE_KEY = '<SERVICE_ROLE_KEY>'; // Remplacez par votre clé service_role
const VAPID_PUBLIC_KEY = '<VAPID_PUBLIC_KEY>';
const VAPID_PRIVATE_KEY = '<VAPID_PRIVATE_KEY>';

webpush.setVapidDetails(
  'mailto:admin@pitchlive.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendNotificationToAllSubscribers(payload) {
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
  if (error) throw error;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
    } catch (err) {
      // Gérer les erreurs (désabonnement, etc.)
      console.error('Erreur notification', err);
    }
  }
}

// Exemple d'appel
sendNotificationToAllSubscribers({
  title: 'Nouvelle vidéo sur Pitch Live!',
  body: 'Un créateur que vous suivez vient de publier une nouvelle vidéo.',
  url: 'https://pitchlive.com/'
});
