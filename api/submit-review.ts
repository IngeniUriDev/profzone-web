import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se acepta método POST.' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase no configurado en servidor.' });
  }

  try {
    const { businessId, rating, comment, staffId, userName, userPhone, userProvider, userId } = req.body || {};

    if (!businessId || !rating || !comment) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5.' });
    }

    const payload = {
      business_id: businessId,
      staff_id: staffId || null,
      rating,
      comment: comment.trim(),
      user_id: userId || null,
      user_name: userName || 'Usuario Registrado',
      user_phone: userPhone || null,
      user_provider: userProvider || null
    };

    const { data, error } = await supabase
      .from('pz_reviews')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Recalcular promedios en el servidor
    const { data: revList } = await supabase
      .from('pz_reviews')
      .select('rating')
      .eq('business_id', businessId);

    if (revList && revList.length > 0) {
      const total = revList.reduce((acc, r) => acc + r.rating, 0);
      const avg = Math.round((total / revList.length) * 10) / 10;
      await supabase
        .from('pz_businesses')
        .update({ rating_avg: avg, rating_count: revList.length })
        .eq('id', businessId);
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error interno del servidor.' });
  }
}
