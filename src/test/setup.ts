import "@testing-library/jest-dom/vitest";

// Node 22+ ships its own native, file-backed `localStorage`/`sessionStorage`
// globals. That native accessor wins over jsdom's the moment Vitest projects
// jsdom's `window` onto the global object, by the time this file runs,
// `window.localStorage` *is* `globalThis.localStorage`, already pointing at
// Node's unconfigured (non-functional) implementation, not jsdom's. There's
// no way to recover jsdom's real Storage instance at this point, so swap in
// a small in-memory polyfill whenever the current one is missing methods
// real code relies on (e.g. `.clear()`).
function installMemoryStorage(key: "localStorage" | "sessionStorage") {
  if (typeof globalThis[key]?.clear === "function") return;
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (k: string) => void store.delete(k),
    setItem: (k: string, value: string) => void store.set(k, String(value)),
  };
  Object.defineProperty(globalThis, key, { configurable: true, value: storage });
}
installMemoryStorage("localStorage");
installMemoryStorage("sessionStorage");

// jsdom lacks these APIs that motion/scroll-reveal components rely on.
if (!("IntersectionObserver" in globalThis)) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
}

if (!globalThis.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

globalThis.scrollTo = globalThis.scrollTo ?? (() => {});
