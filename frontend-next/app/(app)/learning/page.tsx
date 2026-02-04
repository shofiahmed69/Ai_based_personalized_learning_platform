'use client';

import { useLearningCourses } from '@/hooks/useLearning';
import { GraduationCap, ExternalLink } from 'lucide-react';

export default function LearningPage() {
  const { data: courses, isLoading, error } = useLearningCourses();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-9 w-64 animate-pulse rounded bg-gray-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Failed to load learning courses. Try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-violet-400">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Learning</h1>
          <p className="text-sm text-gray-400">
            CSE (Computer Science &amp; Engineering) courses and tutorials from YouTube
          </p>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          No courses available right now. Make sure the YouTube API key is configured on the server.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((v) => (
            <li key={v.videoId}>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition hover:border-violet-500/50 hover:bg-gray-800/50"
              >
                <div className="relative aspect-video w-full bg-gray-800">
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-600">
                      <GraduationCap className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-gray-300">
                    <ExternalLink className="inline h-3 w-3" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <span className="line-clamp-2 text-sm font-medium text-gray-200">{v.title}</span>
                  {v.channelTitle && (
                    <p className="mt-1 text-xs text-gray-500">{v.channelTitle}</p>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
