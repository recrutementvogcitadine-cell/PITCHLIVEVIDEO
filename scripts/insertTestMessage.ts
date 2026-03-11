import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertTestMessage() {
  const { data, error } = await supabase.from('messages').insert([
    {
      video_id: '/videos/demo.mp4',
      creator: 'Test Script',
      message: 'Ceci est un message automatique',
      // created_at: laissé vide pour auto-génération
    },
  ]);
  if (error) {
    console.error('Erreur lors de l\'insertion:', error);
  } else {
    console.log('Message inséré avec succès:', data);
  }
}

insertTestMessage();
