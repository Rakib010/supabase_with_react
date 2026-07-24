import { supabase } from './supabase'

/**
 * Upload image to tasks-banner bucket and return public URL
 * @param {File} image
 * @returns {Promise<string|null>}
 */
export async function uploadBannerImage(image) {
  let imageUrl = null

  if (image) {
    const path = `public/${Date.now()}_${image.name}`

    const { data, error } = await supabase.storage
      .from('tasks-banner')
      .upload(path, image)

    if (error) {
      throw error
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('tasks-banner').getPublicUrl(data.path)

    imageUrl = publicUrl
  }

  return imageUrl
}
