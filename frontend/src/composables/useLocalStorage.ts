import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {}
): Ref<T> {
  const { serializer } = options

  const read = (): T => {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }

    try {
      return serializer ? serializer.read(item) : JSON.parse(item)
    } catch {
      return defaultValue
    }
  }

  const storedValue = ref<T>(read()) as Ref<T>

  const write = (value: T) => {
    try {
      const serialized = serializer ? serializer.write(value) : JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (e) {
      console.error(`Error writing to localStorage key "${key}":`, e)
    }
  }

  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  // Listen for changes from other tabs
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      try {
        storedValue.value = serializer
          ? serializer.read(event.newValue)
          : JSON.parse(event.newValue)
      } catch {
        // Ignore parse errors
      }
    }
  }

  window.addEventListener('storage', handleStorage)

  return storedValue
}

export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {}
): Ref<T> {
  const { serializer } = options

  const read = (): T => {
    const item = sessionStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }

    try {
      return serializer ? serializer.read(item) : JSON.parse(item)
    } catch {
      return defaultValue
    }
  }

  const storedValue = ref<T>(read()) as Ref<T>

  const write = (value: T) => {
    try {
      const serialized = serializer ? serializer.write(value) : JSON.stringify(value)
      sessionStorage.setItem(key, serialized)
    } catch (e) {
      console.error(`Error writing to sessionStorage key "${key}":`, e)
    }
  }

  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  return storedValue
}
