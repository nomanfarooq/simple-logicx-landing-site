import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Reveal elements on scroll with stagger.
 */
export function useScrollReveal(selector, options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const items = selector ? el.querySelectorAll(selector) : [el]

    ScrollTrigger.create({
      trigger: el,
      start: options.start || 'top 80%',
      onEnter: () => {
        gsap.fromTo(
          items,
          { opacity: 0, y: options.yOffset ?? 40 },
          {
            opacity: 1,
            y: 0,
            duration: options.duration ?? 0.8,
            stagger: options.stagger ?? 0.1,
            ease: options.ease || 'power3.out',
          }
        )
      },
      once: true,
    })
  }, [selector])

  return ref
}

/**
 * Animate a counter from 0 to target.
 */
export function useCounterAnimation(target, suffix = '') {
  const ref = useRef(null)
  const animated = useRef(false)

  useEffect(() => {
    if (!ref.current || animated.current) return

    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      onEnter: () => {
        animated.current = true
        gsap.to(ref.current, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          ease: 'power2.out',
          onUpdate: function () {
            ref.current.innerText = Math.round(parseFloat(ref.current.innerText)) + suffix
          },
        })
      },
      once: true,
    })
  }, [target, suffix])

  return ref
}
