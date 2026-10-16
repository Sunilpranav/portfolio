import { useEffect } from 'react'

export const useCardTilt = () => {
  useEffect(() => {
    // Only run on desktop devices with fine pointer (mouse)
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    // Respect reduced motion
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches

    if (!finePointer || !motionOk) return

    const mainEl = document.querySelector('main')
    if (!mainEl) return

    let currentCard: HTMLElement | null = null

    const resetCard = (card: HTMLElement) => {
      card.classList.remove('tilting')
      card.style.transform = ''
      card.style.removeProperty('--mx')
      card.style.removeProperty('--my')
    }

    const handlePointerMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const card = target?.closest('.card') as HTMLElement | null

      // If pointer is not over a valid card in <main>
      if (!card || !mainEl.contains(card)) {
        if (currentCard) {
          resetCard(currentCard)
          currentCard = null
        }
        return
      }

      // Skip cards containing form, input, textarea, or select
      if (card.querySelector('form, input, textarea, select')) {
        if (currentCard && currentCard !== card) {
          resetCard(currentCard)
          currentCard = null
        }
        return
      }

      if (currentCard && currentCard !== card) {
        resetCard(currentCard)
      }
      currentCard = card

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const xRatio = Math.max(0, Math.min(1, x / rect.width))
      const yRatio = Math.max(0, Math.min(1, y / rect.height))

      // Max ~3 degrees tilt with 900px perspective
      const rotX = ((yRatio - 0.5) * -6).toFixed(2)
      const rotY = ((xRatio - 0.5) * 6).toFixed(2)

      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`
      card.style.setProperty('--mx', `${(xRatio * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(yRatio * 100).toFixed(1)}%`)
      card.classList.add('tilting')
    }

    const handlePointerLeave = () => {
      if (currentCard) {
        resetCard(currentCard)
        currentCard = null
      }
    }

    mainEl.addEventListener('mousemove', handlePointerMove, { passive: true })
    mainEl.addEventListener('mouseleave', handlePointerLeave)
    window.addEventListener('blur', handlePointerLeave)

    return () => {
      mainEl.removeEventListener('mousemove', handlePointerMove)
      mainEl.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('blur', handlePointerLeave)
      if (currentCard) {
        resetCard(currentCard)
      }
    }
  }, [])
}
