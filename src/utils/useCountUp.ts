import { useEffect } from 'react'

export const useCountUp = () => {
  useEffect(() => {
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    const activeAnimations = new Set<number>()

    const animateCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.countTo || '0')
      const suffix = el.dataset.countSuffix || ''

      if (isNaN(target)) return

      if (!motionOk) {
        el.textContent = `${target}${suffix}`
        el.setAttribute('data-counted', 'true')
        return
      }

      el.setAttribute('data-counted', 'true')
      const duration = 1200 // 1.2s duration
      const startTime = performance.now()

      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(target * ease)
        el.textContent = `${current}${suffix}`

        if (progress < 1) {
          const rafId = requestAnimationFrame(tick)
          activeAnimations.add(rafId)
        } else {
          el.textContent = `${target}${suffix}`
        }
      }

      const rafId = requestAnimationFrame(tick)
      activeAnimations.add(rafId)
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            io.unobserve(el)
            animateCount(el)
          }
        })
      },
      { threshold: 0.2 }
    )

    const scanAndObserve = (root: Element | Document = document) => {
      const elements = root.querySelectorAll<HTMLElement>('[data-count-to]:not([data-counted])')
      elements.forEach(el => {
        if (!motionOk) {
          animateCount(el)
        } else {
          io.observe(el)
        }
      })
    }

    // Initial scan
    scanAndObserve()

    // MutationObserver to watch for asynchronously loaded items (e.g. from Firebase)
    const mo = new MutationObserver(() => {
      scanAndObserve()
    })

    const targetNode = document.querySelector('main') || document.body
    mo.observe(targetNode, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      activeAnimations.forEach(id => cancelAnimationFrame(id))
      activeAnimations.clear()
    }
  }, [])
}
