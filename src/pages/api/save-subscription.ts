// API route Next.js pour enregistrer l'abonnement push dans Supabase
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://jxhgmetivgnsphyowjcw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, subscription } = req.body;
  if (!userId || !subscription) return res.status(400).json({ error: 'Missing userId or subscription' });
  const { error } = await supabase.from('push_subscriptions').insert({ user_id: userId, subscription });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
}
