import { env } from '../config/env';

export interface LearningCourseVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
}

/**
 * YouTube Data API v3 search. Set YOUTUBE_API_KEY in .env.
 */
export function isYouTubeConfigured(): boolean {
  return Boolean(env.youtubeApiKey && env.youtubeApiKey.trim().length > 0);
}

function getApiKey(): string {
  if (!isYouTubeConfigured()) {
    throw new Error('YOUTUBE_API_KEY is not set. Add it to your .env to fetch learning courses.');
  }
  return env.youtubeApiKey;
}

/**
 * Build a search query from a document summary to find learning/tutorial videos.
 * Uses the summary as context and adds "learn tutorial course" for educational content.
 */
function buildSearchQuery(summary: string, maxTerms = 4): string {
  const cleaned = summary
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, maxTerms);
  const topic = words.join(' ');
  return topic ? `${topic} learn tutorial` : 'learning tutorial';
}

/**
 * Fetch learning-style videos related to the summarized topic.
 * Returns up to 6 videos (title, channel, thumbnail, link).
 */
export async function searchLearningVideos(summary: string): Promise<LearningCourseVideo[]> {
  if (!isYouTubeConfigured()) return [];

  const q = buildSearchQuery(summary);
  const params = new URLSearchParams({
    part: 'snippet',
    q,
    type: 'video',
    maxResults: '6',
    key: getApiKey(),
    safeSearch: 'moderate',
    relevanceLanguage: 'en',
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[YouTube] API error:', res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: { kind?: string; videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };

  const videos: LearningCourseVideo[] = [];
  for (const item of data.items ?? []) {
    if (item.id?.kind !== 'youtube#video' || !item.id.videoId) continue;
    const sn = item.snippet;
    const thumb = sn?.thumbnails?.medium?.url ?? sn?.thumbnails?.default?.url ?? '';
    videos.push({
      videoId: item.id.videoId,
      title: sn?.title ?? 'Video',
      channelTitle: sn?.channelTitle ?? '',
      thumbnailUrl: thumb,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    });
  }
  return videos;
}

/** CSE (Computer Science & Engineering) learning search queries for the Learning section. */
const CSE_SEARCH_QUERIES = [
  'CSE full course computer science engineering',
  'computer science engineering tutorial for beginners',
  'data structures and algorithms course',
  'programming fundamentals full course',
];

/**
 * Fetch CSE-related learning courses from YouTube for the Learning section.
 * Returns a combined list of videos (up to 6 per query, deduplicated by videoId).
 */
export async function searchCseLearningCourses(): Promise<LearningCourseVideo[]> {
  if (!isYouTubeConfigured()) return [];

  const seen = new Set<string>();
  const results: LearningCourseVideo[] = [];

  for (const q of CSE_SEARCH_QUERIES) {
    const params = new URLSearchParams({
      part: 'snippet',
      q,
      type: 'video',
      maxResults: '6',
      key: getApiKey(),
      safeSearch: 'moderate',
      relevanceLanguage: 'en',
    });
    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as {
        items?: Array<{
          id?: { kind?: string; videoId?: string };
          snippet?: {
            title?: string;
            channelTitle?: string;
            thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
          };
        }>;
      };
      for (const item of data.items ?? []) {
        if (item.id?.kind !== 'youtube#video' || !item.id.videoId || seen.has(item.id.videoId))
          continue;
        seen.add(item.id.videoId);
        const sn = item.snippet;
        const thumb = sn?.thumbnails?.medium?.url ?? sn?.thumbnails?.default?.url ?? '';
        results.push({
          videoId: item.id.videoId,
          title: sn?.title ?? 'Video',
          channelTitle: sn?.channelTitle ?? '',
          thumbnailUrl: thumb,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        });
      }
    } catch {
      // skip this query
    }
  }

  return results;
}
