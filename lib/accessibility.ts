/**
 * 접근성(a11y) 관련 유틸리티 함수들
 */

/**
 * 스크린 리더 전용 텍스트 클래스
 */
export const srOnly = "sr-only"

/**
 * 포커스가 가능한 요소들의 셀렉터
 */
export const FOCUSABLE_ELEMENTS = [
  'button',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'details > summary',
].join(', ')

/**
 * 요소의 포커스 트랩을 구현
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS) as NodeListOf<HTMLElement>
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)

  // 초기 포커스 설정
  firstElement?.focus()

  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * 키보드 네비게이션을 위한 방향키 핸들러
 */
export function createArrowKeyNavigation(
  elements: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
    onSelect?: (element: HTMLElement, index: number) => void
  } = {}
) {
  const { orientation = 'both', loop = true, onSelect } = options
  let currentIndex = 0

  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowUp':
        if (orientation === 'horizontal') return
        newIndex = currentIndex - 1
        break
      case 'ArrowDown':
        if (orientation === 'horizontal') return
        newIndex = currentIndex + 1
        break
      case 'ArrowLeft':
        if (orientation === 'vertical') return
        newIndex = currentIndex - 1
        break
      case 'ArrowRight':
        if (orientation === 'vertical') return
        newIndex = currentIndex + 1
        break
      case 'Home':
        newIndex = 0
        e.preventDefault()
        break
      case 'End':
        newIndex = elements.length - 1
        e.preventDefault()
        break
      case 'Enter':
      case ' ':
        onSelect?.(elements[currentIndex], currentIndex)
        e.preventDefault()
        return
      default:
        return
    }

    if (loop) {
      newIndex = (newIndex + elements.length) % elements.length
    } else {
      newIndex = Math.max(0, Math.min(elements.length - 1, newIndex))
    }

    if (newIndex !== currentIndex) {
      currentIndex = newIndex
      elements[currentIndex]?.focus()
      e.preventDefault()
    }
  }

  const cleanup = () => {
    elements.forEach(element => {
      element.removeEventListener('keydown', handleKeyDown)
    })
  }

  elements.forEach((element, index) => {
    element.addEventListener('keydown', handleKeyDown)
    element.addEventListener('focus', () => {
      currentIndex = index
    })
  })

  return cleanup
}

/**
 * 고대비 모드 감지
 */
export function detectHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false

  // Windows 고대비 모드 감지
  if (window.matchMedia) {
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches
  }

  return false
}

/**
 * 축소된 모션 선호도 감지
 */
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * 색상 대비율 계산 (WCAG 기준)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * ARIA 상태 관리를 위한 헬퍼
 */
export const ariaHelpers = {
  /**
   * 요소에 ARIA 속성 설정
   */
  setAttributes(element: HTMLElement, attributes: Record<string, string | boolean | null>) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null) {
        element.removeAttribute(key)
      } else {
        element.setAttribute(key, String(value))
      }
    })
  },

  /**
   * 스크린 리더에 메시지 공지
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return

    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  /**
   * 고유한 ID 생성
   */
  generateId(prefix = 'id'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 접근성 검증을 위한 체크리스트
 */
export const a11yChecklist = {
  /**
   * 색상 대비 검증
   */
  checkColorContrast(foreground: string, background: string): {
    ratio: number
    wcagAA: boolean
    wcagAAA: boolean
  } {
    const ratio = calculateContrastRatio(foreground, background)
    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    }
  },

  /**
   * 키보드 네비게이션 검증
   */
  validateKeyboardNavigation(container: HTMLElement): string[] {
    const issues: string[] = []
    const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS)

    if (focusableElements.length === 0) {
      issues.push('포커스 가능한 요소가 없습니다')
    }

    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement

      if (htmlElement.tabIndex < 0 && !htmlElement.hasAttribute('aria-hidden')) {
        issues.push(`요소 ${index + 1}: 탭 인덱스가 음수입니다`)
      }

      if (!htmlElement.hasAttribute('aria-label') &&
          !htmlElement.hasAttribute('aria-labelledby') &&
          !htmlElement.textContent?.trim()) {
        issues.push(`요소 ${index + 1}: 접근 가능한 이름이 없습니다`)
      }
    })

    return issues
  },

  /**
   * ARIA 속성 검증
   */
  validateAriaAttributes(element: HTMLElement): string[] {
    const issues: string[] = []
    const attributes = element.attributes

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i]
      if (attr.name.startsWith('aria-')) {
        // aria-expanded 검증
        if (attr.name === 'aria-expanded' &&
            !['true', 'false'].includes(attr.value)) {
          issues.push(`aria-expanded 값이 올바르지 않습니다: ${attr.value}`)
        }

        // aria-hidden 검증
        if (attr.name === 'aria-hidden' && attr.value === 'true') {
          const focusableChildren = element.querySelectorAll(FOCUSABLE_ELEMENTS)
          if (focusableChildren.length > 0) {
            issues.push('aria-hidden="true" 요소에 포커스 가능한 하위 요소가 있습니다')
          }
        }
      }
    }

    return issues
  }
}