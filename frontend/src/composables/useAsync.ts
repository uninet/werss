import { ref, computed } from 'vue'

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, immediate = false } = options

  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  const isReady = computed(() => !isLoading.value && data.value !== null)
  const isError = computed(() => error.value !== null)

  async function execute(): Promise<T | null> {
    isLoading.value = true
    error.value = null

    try {
      const result = await asyncFn()
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      onError?.(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    isLoading,
    isReady,
    isError,
    execute,
    reset
  }
}

export function useAsyncWithParams<T, P extends any[]>(
  asyncFn: (...params: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError } = options

  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  const isReady = computed(() => !isLoading.value && data.value !== null)
  const isError = computed(() => error.value !== null)

  async function execute(...params: P): Promise<T | null> {
    isLoading.value = true
    error.value = null

    try {
      const result = await asyncFn(...params)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      onError?.(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    data,
    error,
    isLoading,
    isReady,
    isError,
    execute,
    reset
  }
}
