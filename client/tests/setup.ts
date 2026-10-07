import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill window.scrollTo
window.scrollTo = window.scrollTo || (() => {});

// Polyfill ResizeObserver for jsdom
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// In JSDOM, elements have 0 height/width. Provide a mock for @tanstack/react-virtual
// so virtualized rows are properly rendered in test assertions.
vi.mock('@tanstack/react-virtual', () => {
  return {
    useVirtualizer: (options: any) => {
      const count = options.count || 0;
      const estimateSize = options.estimateSize ? options.estimateSize() : 64;
      return {
        getTotalSize: () => count * estimateSize,
        getVirtualItems: () =>
          Array.from({ length: count }, (_, index) => ({
            index,
            start: index * estimateSize,
            size: estimateSize,
            key: index,
          })),
        scrollToOffset: vi.fn(),
        scrollToIndex: vi.fn(),
      };
    },
  };
});
