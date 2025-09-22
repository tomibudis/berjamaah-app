'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type PullToRefreshProps = {
  children: React.ReactNode;
  onRefreshAction: () => Promise<void> | void;
  className?: string;
  thresholdPx?: number;
  maxPullPx?: number;
};

export function PullToRefresh({
  children,
  onRefreshAction,
  className,
  thresholdPx = 60,
  maxPullPx = 100,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startYRef = React.useRef<number | null>(null);
  const canPullRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);

  const handleTouchStart = React.useCallback(
    (e: TouchEvent) => {
      if (isRefreshing) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      canPullRef.current = scrollTop <= 0;
      if (!canPullRef.current) return;
      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      isDraggingRef.current = true;
    },
    [isRefreshing]
  );

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || !canPullRef.current || isRefreshing) return;
      const touch = e.touches[0];
      const startY = startYRef.current ?? touch.clientY;
      const delta = touch.clientY - startY;
      if (delta > 0) {
        const clamped = Math.min(maxPullPx, delta);
        setPullDistance(clamped);
      } else {
        setPullDistance(0);
      }
    },
    [isRefreshing, maxPullPx]
  );

  const endDrag = React.useCallback(async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    canPullRef.current = false;

    if (pullDistance >= thresholdPx && !isRefreshing) {
      try {
        setIsRefreshing(true);
        await onRefreshAction();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    startYRef.current = null;
  }, [onRefreshAction, pullDistance, thresholdPx, isRefreshing]);

  const handleTouchEnd = React.useCallback(() => {
    void endDrag();
  }, [endDrag]);

  React.useEffect(() => {
    // Attach to window to catch touches anywhere on the page
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener(
        'touchend',
        handleTouchEnd as unknown as EventListener
      );
      window.removeEventListener(
        'touchcancel',
        handleTouchEnd as unknown as EventListener
      );
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className={cn('relative', className)}>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className='pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-center'
          style={{
            height: Math.max(0, pullDistance),
            transition: isDraggingRef.current
              ? 'none'
              : 'height 150ms ease-out',
          }}
          aria-hidden={!isRefreshing && pullDistance <= 0}
        >
          <div className='flex items-center gap-2 text-xs text-gray-600'>
            <Loader2
              className={cn('h-4 w-4', isRefreshing ? 'animate-spin' : '')}
            />
            <span>
              {isRefreshing
                ? 'Refreshing…'
                : pullDistance >= thresholdPx
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDraggingRef.current
            ? 'none'
            : 'transform 150ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
