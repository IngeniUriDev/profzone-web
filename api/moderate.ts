import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase seguro con SERVICE_ROLE_KEY en el servidor (nunca expuesta al cliente)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

const MASTER_PIN = process.env.VITE_ADMIN_PIN || 'Ipoduri5s';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase no está configurado en el servidor.' });
  }

  const { action, businessId, status, adminPin } = req.body || {};

  // Validación de seguridad para acciones administrativas
  if (action === 'update_status' || action === 'approve' || action === 'reject') {
    if (adminPin !== MASTER_PIN) {
      return res.status(403).json({ error: 'Acceso no autorizado: PIN de Superadministrador inválido.' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Falta businessId.' });
    }

    const targetStatus = action === 'approve' ? 'approved' : (action === 'reject' ? 'rejected' : status);

    const { data, error } = await supabase
      .from('pz_businesses')
      .update({ status: targetStatus })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  }

  return res.status(400).json({ error: 'Acción no reconocida.' });
}
