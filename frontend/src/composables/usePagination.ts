import { ref, computed, watch } from 'vue'

interface UsePaginationOptions {
  pageSize?: number
  total?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { pageSize = 20, total = 0 } = options

  const currentPage = ref(1)
  const pageSizeRef = ref(pageSize)
  const totalRef = ref(total)

  const totalPages = computed(() =>
    Math.ceil(totalRef.value / pageSizeRef.value)
  )

  const startIndex = computed(() =>
    (currentPage.value - 1) * pageSizeRef.value
  )

  const endIndex = computed(() =>
    Math.min(startIndex.value + pageSizeRef.value, totalRef.value)
  )

  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  const pageRange = computed(() => {
    const range: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  })

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function previousPage() {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  function firstPage() {
    currentPage.value = 1
  }

  function lastPage() {
    currentPage.value = totalPages.value
  }

  function setPageSize(size: number) {
    pageSizeRef.value = size
    currentPage.value = 1
  }

  function setTotal(count: number) {
    totalRef.value = count
  }

  function reset() {
    currentPage.value = 1
    totalRef.value = 0
  }

  return {
    currentPage,
    pageSize: pageSizeRef,
    total: totalRef,
    totalPages,
    startIndex,
    endIndex,
    hasPreviousPage,
    hasNextPage,
    pageRange,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    setTotal,
    reset
  }
}

export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginationOptions = {}
) {
  const pagination = usePagination(options)
  const data = ref<T[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetch() {
    isLoading.value = true
    error.value = null

    try {
      const result = await fetchFn(pagination.currentPage.value, pagination.pageSize.value)
      data.value = result.items
      pagination.setTotal(result.total)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      isLoading.value = false
    }
  }

  watch(pagination.currentPage, fetch)
  watch(pagination.pageSize, fetch)

  return {
    data,
    isLoading,
    error,
    pagination,
    fetch,
    refresh: fetch
  }
}
