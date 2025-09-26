import executeQuery from "@/db";
import { PostType } from "@/types/post";

const getLinksFromString = (str:string):string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return str.replace(
      urlRegex,
      '<a href="$1" class="post-link" target="_blank" rel="noopener noreferrer">$1</a>'
    );
};

const getEmbedSection = (str:string):string => {

    let embedSection = "";

    // Define regex patterns
    const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/@[\w\.]+\/video\/(\d+)/;
    const facebookRegex = /https?:\/\/(www\.)?facebook\.com\/.*\/videos\/(\d+)/;

    // Extract and create embeds first
    const youtubeMatch = str.match(youtubeRegex);
    const tiktokMatch = str.match(tiktokRegex);
    const facebookMatch = str.match(facebookRegex);

    if (youtubeMatch) {
      embedSection += `<div class="video-container youtube-embed">
        <iframe src="https://www.youtube.com/embed/${youtubeMatch[2]}" frameborder="0" allowfullscreen></iframe>
      </div>`;
    }
    if (tiktokMatch) {
      embedSection += `<div class="video-container tiktok-embed">
        <iframe src="https://www.tiktok.com/embed/v2/${tiktokMatch[2]}" frameborder="0" allowfullscreen></iframe>
      </div>`;
    }
    if (facebookMatch) {
      embedSection += `<div class="video-container facebook-embed">
        <iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          facebookMatch[0]
        )}" frameborder="0" allowfullscreen></iframe>
      </div>`;
    }
    return embedSection;
};

const getMentionAndIdForString = async (str:string) =>{
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(str.matchAll(mentionRegex));
    const uniqueUsernames = Array.from(new Set(mentions.map((m) => m[1])));
    // Fetch user ids for usernames
    const usernameToId: { [key: string]: string } = {};
    if (uniqueUsernames.length > 0) {
      const placeholders = uniqueUsernames.map(() => "?").join(",");
      const results = await executeQuery(
        `SELECT id, username FROM users WHERE username IN (${placeholders})`,
        uniqueUsernames
      );
      (results as any[]).forEach((user) => {
        usernameToId[user.username] = user.id;
      });
    }
    return {mentions,usernameToId}

}

const convertMentionsIntoLinks = async (str:string,currentUserId:string,type:PostType):Promise<string> => {
    const {mentions,usernameToId} = await getMentionAndIdForString(str);

    // Replace mentions with styled anchor tags
    for (const mention of mentions) {
      const fullMatch = mention[0];
      const username = mention[1];
      const userIdMentioned = usernameToId[username];
      if (!userIdMentioned) continue; // no user, skip
      
      if (type === "friend_post") {
        const friendResults = await executeQuery(
          "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)",
          [currentUserId, userIdMentioned, userIdMentioned, currentUserId]
        );
        if (!(friendResults as any[])[0]) continue; // not a friend, skip
      }

      const styledMention = `<a href="/profile/${username}" class="user-mention">@${username}</a>`;
      str = str.split(fullMatch).join(styledMention);
      
    }
    return str;
}
export {
    getLinksFromString,
    getEmbedSection,
    convertMentionsIntoLinks,
    getMentionAndIdForString
}