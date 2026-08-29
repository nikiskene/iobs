import { supabase } from './supabase';
import type { MomentumDocument } from './momentumTypes';

export async function uploadMomentumDocument(itemId: string, file: File, title: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
  const storagePath = `${itemId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from('momentum-documents').upload(storagePath, file, {
    cacheControl: '3600', upsert: false, contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;

  const { data, error: recordError } = await supabase.from('momentum_documents').insert({
    momentum_item_id: itemId,
    title: title.trim() || file.name,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type || null,
    file_size: file.size,
  }).select('*').single();
  if (recordError) {
    await supabase.storage.from('momentum-documents').remove([storagePath]);
    throw recordError;
  }
  return data as MomentumDocument;
}

export async function openMomentumDocument(document: MomentumDocument) {
  const { data, error } = await supabase.storage.from('momentum-documents').createSignedUrl(document.storage_path, 60);
  if (error) throw error;
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

export function formatFileSize(size: number | null) {
  if (size == null) return '';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
