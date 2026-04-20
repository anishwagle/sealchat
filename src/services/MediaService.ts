import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Logger } from "@/lib/logger";

const COMPONENT = "MediaService";

export class MediaService {
  async recordMediaUpload(
    userId: string,
    storagePath: string,
    url: string,
    mediaType: string = "image"
  ): Promise<string> {
    const FUNCTION = "recordMediaUpload";
    Logger.log(COMPONENT, FUNCTION, "debug", "Recording media upload", { userId, storagePath });

    const { data, error } = await supabaseAdmin
      .from("post_media")
      .insert({
        user_id: userId,
        storage_path: storagePath,
        url: url,
        media_type: mediaType,
      })
      .select("id")
      .single();

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to record media", { error });
      throw new Error("Failed to record media: " + error.message);
    }

    return data.id;
  }

  async linkMediaToPost(postId: string, mediaIds: string[]): Promise<void> {
    const FUNCTION = "linkMediaToPost";
    if (!mediaIds.length) return;

    Logger.log(COMPONENT, FUNCTION, "debug", "Linking media to post", { postId, mediaIds });

    const { error } = await supabaseAdmin
      .from("post_media")
      .update({ post_id: postId })
      .in("id", mediaIds);

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to link media", { error });
      throw new Error("Failed to link media: " + error.message);
    }
  }

  async deleteMediaFromStorage(storagePaths: string[]): Promise<void> {
    const FUNCTION = "deleteMediaFromStorage";
    if (!storagePaths.length) return;

    Logger.log(COMPONENT, FUNCTION, "debug", "Deleting media from storage", { storagePaths });

    const { error } = await supabaseAdmin.storage
      .from("post-media")
      .remove(storagePaths);

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to delete storage files", { error });
    }
  }
}

export const mediaService = new MediaService();
