import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    value,
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): {
  run: (...args: Parameters<T>) => void
  cancel: () => void
  flush: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  const run = (...args: Parameters<T>) => {
    pendingArgs = args
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...pendingArgs!)
      pendingArgs = null
    }, delay)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      pendingArgs = null
    }
  }

  const flush = () => {
    if (timeoutId && pendingArgs) {
      clearTimeout(timeoutId)
      fn(...pendingArgs)
      timeoutId = null
      pendingArgs = null
    }
  }

  return {
    run,
    cancel,
    flush
  }
}
