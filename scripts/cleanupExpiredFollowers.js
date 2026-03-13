// scripts/cleanupExpiredFollowers.js
// Supprime les suivis de plus de 24h dans la table followers (éphémère)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanupExpiredFollowers() {
  const { error } = await supabase.rpc('delete_expired_followers');
  if (error) {
    console.error('Erreur suppression followers éphémères:', error);
    process.exit(1);
  }
  console.log('Suppression des followers éphémères >24h : OK');
}

cleanupExpiredFollowers();
