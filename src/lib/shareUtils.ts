// Utilitaire pour récupérer le nombre de partages d'une vidéo
import { supabase } from "../lib/supabaseClient";

export async function getShareCount(video_id: string): Promise<number> {
  const { data, error } = await supabase
    .from('video_share_counts')
    .select('share_count')
    .eq('video_id', video_id)
    .single();
  if (error || !data) return 0;
  return Number(data.share_count) || 0;
}

// Utilitaire pour enregistrer un partage
export async function recordShare(video_id: string, user_id: string) {
  await supabase.from('shares').insert({ video_id, user_id });
}
