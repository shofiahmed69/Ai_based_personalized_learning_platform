'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { LearningCourseVideo } from '@/lib/types';

export function useLearningCourses() {
  return useQuery({
    queryKey: ['learning', 'courses'],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { courses: LearningCourseVideo[] }; courses?: LearningCourseVideo[] }>(
        '/api/learning/courses'
      );
      return data.data?.courses ?? data.courses ?? [];
    },
  });
}
