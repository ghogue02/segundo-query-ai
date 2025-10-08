'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useSlideOverState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const taskId = searchParams.get('task');
  const builderId = searchParams.get('builder');

  const openTask = useCallback((id: number) => {
    const params = new URLSearchParams();
    params.set('task', id.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  const openBuilder = useCallback((id: number) => {
    const params = new URLSearchParams();
    params.set('builder', id.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  const close = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    taskId: taskId ? parseInt(taskId) : null,
    builderId: builderId ? parseInt(builderId) : null,
    openTask,
    openBuilder,
    close,
    isOpen: !!(taskId || builderId),
    hasTask: !!taskId,
    hasBuilder: !!builderId
  };
}
