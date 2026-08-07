import { useEffect, useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Zap, Globe, Cpu } from 'lucide-react'

const stats = [
  { value: '150', suffix: '+', label: 'Projects Delivered' },
  { value: '98', suffix: '%', label: 'Client Satisfaction' },
  { value: '40+', suffix: '', label: 'Team Members' },
  { value: '12', suffix: '', label: 'Years Experience' },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const gridRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    function handleMouseMove(e) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    section.addEventListener('mousemove', handleMouseMove)
    return () => section.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animated counter logic with GSAP
  useEffect(() => {
    const counters = document.querySelectorAll('[data-counter]')
    counters.forEach((counter) => {
      const target = parseFloat(counter.dataset.counter)
      const suffix = counter.dataset.suffix || ''
      const obj = { val: 0 }

      const st = ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              counter.textContent = Math.round(obj.val) + suffix
            },
          })
        },
      })
    })
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-900">
      {/* Animated grid background */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(68,197,216,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(68,197,216,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Mouse-follow glow */}
      <motion.div
        className="pointer-events-none fixed w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{
          background: useMotionTemplate`radial-gradient(circle, #44C5D8 0%, transparent 70%)`,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Floating aurora gradients */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan/20 rounded-full blur-[128px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-lime/10 rounded-full blur-[128px]"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-500 bg-dark-700/50 backdrop-blur-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime"></span>
          </span>
          <span className="text-sm text-gray-400">Engineering the future, one line at a time</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
        >
          <span className="block">We Build</span>
          <span className="block mt-2 bg-gradient-to-r from-cyan via-lime to-gold bg-clip-text text-transparent">
            Digital Excellence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          SimpleLogicX transforms ambitious ideas into world-class software products. 
          From AI-driven platforms to enterprise cloud systems — we engineer solutions 
          that move markets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              const target = document.querySelector('#contact')
              if (target) {
                const offset = 80
                const top = target.getBoundingClientRect().top + window.scrollY - offset
                window.scrollTo({ top, behavior: 'smooth' })
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan to-lime text-dark-900 font-semibold rounded-full overflow-hidden"
          >
            <span className="relative z-10">Start Your Project</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-lime to-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>

          <motion.a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault()
              const target = document.querySelector('#portfolio')
              if (target) {
                const offset = 80
                const top = target.getBoundingClientRect().top + window.scrollY - offset
                window.scrollTo({ top, behavior: 'smooth' })
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 border border-dark-500 rounded-full hover:border-cyan/50 hover:bg-cyan/5 transition-all"
          >
            View Our Work
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                data-counter={stat.value}
                data-suffix={stat.suffix}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan to-lime bg-clip-text text-transparent"
              >
                0{stat.suffix}
              </div>
              <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tech icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-gray-600"
        >
          {[Zap, Globe, Cpu].map((Icon, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2, color: '#44C5D8' }}
              className="p-3 rounded-xl border border-dark-600 bg-dark-700/30 backdrop-blur-sm"
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-cyan to-transparent"
        />
      </motion.div>
    </section>
  )
}
