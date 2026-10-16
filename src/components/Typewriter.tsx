import React, { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
  text: string
  active?: boolean
  speed?: number
  className?: string
  style?: React.CSSProperties
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  active = true,
  speed = 60,
  className,
  style,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [showCaret, setShowCaret] = useState(true)
  const [blinkingDone, setBlinkingDone] = useState(false)
  const timerRef = useRef<number | null>(null)
  const blinkTimerRef = useRef<number | null>(null)

  useEffect(() => {
    // If reduced motion is preferred, immediately show full text and hide caret
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    if (!motionOk) {
      setDisplayedText(text)
      setShowCaret(false)
      return
    }

    if (!active) {
      setDisplayedText('')
      setShowCaret(true)
      setBlinkingDone(false)
      return
    }

    let currentIndex = 0
    setDisplayedText('')
    setShowCaret(true)
    setBlinkingDone(false)

    // Type character by character
    const typeNextChar = () => {
      currentIndex++
      setDisplayedText(text.slice(0, currentIndex))

      if (currentIndex < text.length) {
        timerRef.current = window.setTimeout(typeNextChar, speed)
      } else {
        // Typing finished: let caret blink 3 times (each cycle ~500ms = 1500ms total) then disappear
        setBlinkingDone(true)
        blinkTimerRef.current = window.setTimeout(() => {
          setShowCaret(false)
        }, 1500)
      }
    }

    // Small delay before typing starts for natural feel
    timerRef.current = window.setTimeout(typeNextChar, 100)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    }
  }, [text, active, speed])

  return (
    <span
      className={className}
      style={{
        display: 'inline-grid',
        verticalAlign: 'bottom',
        ...style,
      }}
    >
      {/* Invisible placeholder measuring full width so layout never jumps */}
      <span
        aria-hidden="true"
        style={{
          gridArea: '1 / 1',
          visibility: 'hidden',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </span>

      {/* Visible typed text with blinking caret */}
      <span
        style={{
          gridArea: '1 / 1',
          whiteSpace: 'pre-wrap',
        }}
      >
        {displayedText}
        {showCaret && (
          <span
            className={`typewriter-caret ${blinkingDone ? 'caret-finish-blink' : ''}`}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              marginLeft: '2px',
              color: 'var(--accent)',
              fontWeight: 300,
              animation: 'typewriter-blink 0.5s infinite',
            }}
          >
            |
          </span>
        )}
      </span>
    </span>
  )
}

export default Typewriter
