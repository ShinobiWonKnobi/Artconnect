import { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  loading: boolean
) {
  const { ref, inView } = useInView();
  const throttleTimeout = useRef<NodeJS.Timeout>();

  const throttledLoadMore = useCallback(() => {
    if (throttleTimeout.current) return;

    throttleTimeout.current = setTimeout(() => {
      loadMore();
      throttleTimeout.current = undefined;
    }, 500);
  }, [loadMore]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      throttledLoadMore();
    }
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [inView, loading, hasMore, throttledLoadMore]);

  return { ref };
}