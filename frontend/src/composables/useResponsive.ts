import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 响应式布局 Composable
 * 提供移动端、平板、桌面的断点检测
 */
export function useResponsive() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

  // 断点定义（与 Tailwind 一致）
  const breakpoints = {
    sm: 640,   // 小平板
    md: 768,   // 平板
    lg: 1024,  // 小桌面
    xl: 1280,  // 桌面
    '2xl': 1536 // 大桌面
  }

  // 响应式状态
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
  const isLargeDesktop = computed(() => windowWidth.value >= breakpoints.xl)

  // 方向检测
  const isPortrait = computed(() => windowHeight.value > windowWidth.value)
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)

  // 更新窗口尺寸
  const updateDimensions = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
    // 初始值
    updateDimensions()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return {
    // 尺寸
    windowWidth,
    windowHeight,
    
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // 方向
    isPortrait,
    isLandscape,
    
    // 断点值
    breakpoints
  }
}

export default useResponsive
