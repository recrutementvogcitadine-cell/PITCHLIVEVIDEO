// Script Node.js pour supprimer les likes Supabase de plus de 24h
// À lancer via `node scripts/cleanupExpiredLikes.js`

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupLikes() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('likes')
    .delete()
    .lt('created_at', cutoff);
  if (error) {
    console.error('Erreur suppression likes :', error.message);
  } else {
    console.log('Likes supprimés :', data ? data.length : 0);
  }
}

cleanupLikes();
