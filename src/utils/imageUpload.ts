import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

/**
 * Normaliza enlaces de servicios conocidos (Google Drive, Dropbox, Imgur, etc.)
 * a URLs de imagen directas y limpias.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Enlaces de Google Drive: https://drive.google.com/file/d/ID/view -> uc?export=view&id=ID
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }

  // Enlaces de Dropbox: cambiar ?dl=0 a ?raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[?&]dl=0/, '').replace(/\?dl=1/, '') + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
  }

  return trimmed;
}

/**
 * Comprime y redimensiona una imagen en el navegador a máximo 1080px
 * devolviendo una representación dataUrl y un Blob optimizado.
 */
export async function compressImageFile(file: File, maxDimension = 1080, quality = 0.82): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida o compatible.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el procesador de imágenes.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              resolve({ dataUrl, blob: file });
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Procesa la imagen seleccionada por el usuario.
 * Intenta subir a Supabase Storage (bucket 'pz-business-images') para obtener una URL pública.
 * Si falla o Supabase no tiene el bucket listo, usa de forma transparente el dataUrl comprimido.
 */
export async function processAndUploadBusinessImage(file: File): Promise<string> {
  const { dataUrl, blob } = await compressImageFile(file);

  if (isSupabaseConfigured && supabase) {
    try {
      const ext = 'jpg';
      const fileName = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `businesses/${fileName}`;

      const { data, error } = await supabase.storage
        .from('pz-business-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('pz-business-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Fallback a DataURL optimizado:', err);
    }
  }

  // Almacenamiento directo seguro y optimizado
  return dataUrl;
}
