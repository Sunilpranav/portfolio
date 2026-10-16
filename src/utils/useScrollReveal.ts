import { useEffect } from 'react'

/**
 * Attaches IntersectionObserver-based scroll-reveal to:
 *   • .section-title
 *   • .section-subtitle
 *   • .card
 * inside every <section> except the Hero (#home).
 *
 * Cards inside the same grid parent get staggered --reveal-i (0-7).
 * A MutationObserver catches cards injected after async data loads.
 * After the reveal transition ends, all helper classes/vars are removed
 * so the existing card :hover (lift + glow) keeps working.
 *
 * Everything is skipped when prefers-reduced-motion: reduce.
 */
export function useScrollReveal() {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    if (!motionOk) return

    const SELECTOR = '.section-title, .section-subtitle, .card'
    const HERO_ID = 'home'

    /* ── helpers ─────────────────────────────────────────── */

    /** Check whether a node lives inside the hero section */
    const insideHero = (el: Element) => !!el.closest(`#${HERO_ID}`)

    /** Mark an element for scroll-reveal if not already marked */
    const prepare = (el: Element) => {
      if (el.classList.contains('sr') || el.classList.contains('sr-visible')) return
      if (insideHero(el)) return
      el.classList.add('sr')
    }

    /** Assign stagger indices to .card children of a common grid parent */
    const assignStagger = (parent: Element) => {
      const cards = parent.querySelectorAll(':scope > .card.sr')
      cards.forEach((card, i) => {
        ;(card as HTMLElement).style.setProperty('--reveal-i', String(Math.min(i, 7)))
      })
    }

    /** Re-assign stagger for every grid that contains at least one .sr card */
    const refreshStagger = () => {
      const grids = new Set<Element>()
      document.querySelectorAll('.card.sr').forEach(c => {
        if (c.parentElement) grids.add(c.parentElement)
      })
      grids.forEach(g => assignStagger(g))
    }

    /* ── initial scan ───────────────────────────────────── */

    document.querySelectorAll(SELECTOR).forEach(prepare)
    refreshStagger()

    /* ── IntersectionObserver ───────────────────────────── */

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.classList.remove('sr')
          el.classList.add('sr-visible')
          io.unobserve(el)

          // After transition ends, clean up so hover effects work unimpeded
          const cleanup = () => {
            el.classList.remove('sr-visible')
            el.style.removeProperty('--reveal-i')
          }
          el.addEventListener('transitionend', cleanup, { once: true })
          // Fallback in case transitionend never fires (e.g. display:none)
          setTimeout(cleanup, 1200)
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('.sr').forEach(el => io.observe(el))

    /* ── MutationObserver (async data loads) ─────────────── */

    const mo = new MutationObserver(mutations => {
      let changed = false
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          // The node itself might match
          if (node.matches?.(SELECTOR)) {
            prepare(node)
            changed = true
          }
          // Or it may contain matching descendants
          node.querySelectorAll?.(SELECTOR).forEach(child => {
            prepare(child)
            changed = true
          })
        })
      }
      if (changed) {
        refreshStagger()
        document.querySelectorAll('.sr').forEach(el => io.observe(el))
      }
    })

    mo.observe(document.body, { childList: true, subtree: true })

    /* ── cleanup ─────────────────────────────────────────── */

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
