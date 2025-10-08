import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Mock Gun.js
vi.mock('gun', () => ({
  default: vi.fn(() => ({
    get: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    map: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis()
  }))
}))

// Mock Gun SEA
vi.mock('gun/sea', () => ({
  default: {
    pair: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

beforeAll(() => {
  console.log('🧪 Test setup complete')
})

afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
})

afterAll(() => {
  console.log('✅ All tests complete')
})
