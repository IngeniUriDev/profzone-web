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
    const business = req.body;
    if (!business || !business.name || !business.address) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre o dirección).' });
    }

    // Inserción forzando status = 'pending' en el servidor
    const payload = {
      name: business.name.trim(),
      category_id: business.category_id || null,
      municipality: (business.municipality || 'Santiago Tianguistenco').trim(),
      locality: (business.locality || 'Centro').trim(),
      address: business.address.trim(),
      phone: business.phone || null,
      whatsapp: business.whatsapp || null,
      schedule: business.schedule || null,
      description: business.description || null,
      image_url: business.image_url || null,
      website_url: business.website_url || null,
      facebook_url: business.facebook_url || null,
      instagram_url: business.instagram_url || null,
      tiktok_url: business.tiktok_url || null,
      latitude: business.latitude || null,
      longitude: business.longitude || null,
      submitted_by: business.submitted_by || 'Usuario Registrado',
      user_id: business.user_id || null,
      status: 'pending' // SIEMPRE PENDIENTE
    };

    const { data, error } = await supabase
      .from('pz_businesses')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error interno del servidor.' });
  }
}
