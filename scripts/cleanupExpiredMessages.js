// Script Node.js pour supprimer les messages Supabase de plus de 24h
// À lancer via `node scripts/cleanupExpiredMessages.js`

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupMessages() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('messages')
    .delete()
    .lt('created_at', cutoff);
  if (error) {
    console.error('Erreur suppression messages :', error.message);
  } else {
    console.log('Messages supprimés :', data ? data.length : 0);
  }
}

cleanupMessages();
