import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zdaidjheoipyxknfwjxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWlkamhlb2lweXhrbmZ3anhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcyMTQsImV4cCI6MjA4ODcyMzIxNH0.eQ1Ew6RQ5WlcNmRZDtvQC-0zedNOHDD4Glr0ltDZlDk";

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
