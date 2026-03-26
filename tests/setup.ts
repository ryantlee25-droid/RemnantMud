import '@testing-library/jest-dom'
import { vi } from 'vitest'

// localStorage mock
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key] }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]) }),
  get length() { return Object.keys(localStorageStore).length },
  key: vi.fn((i: number) => Object.keys(localStorageStore)[i] ?? null),
}

vi.stubGlobal('localStorage', localStorageMock)

// Reset between tests
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})
