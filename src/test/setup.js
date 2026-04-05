import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia — provide a no-op stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
})
