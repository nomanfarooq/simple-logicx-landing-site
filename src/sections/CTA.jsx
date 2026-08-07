import { useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'

export default function CTA() {
  const sectionRef = useRef(null)

  return (
    <section id="contact" ref={sectionRef} className="relative py-32 bg-dark-900 overflow-hidden">
      {/* Massive gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-lime/10 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[300px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(68,197,216,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(68,197,216,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          id="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-sm font-medium mb-8">
            Ready to Build?
          </span>

          {/* Headline */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Let's Engineer Your{' '}
            <span className="bg-gradient-to-r from-cyan via-lime to-gold bg-clip-text text-transparent">
              Next Big Thing
            </span>
          </h2>

          <p className="mt-8 text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Every great product starts with a conversation. Tell us about your vision, and we'll show you exactly how to get there.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="mailto:hello@simplelogicx.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan to-lime text-dark-900 font-bold rounded-full text-lg overflow-hidden"
            >
              <span className="relative z-10">Start Your Project</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-lime to-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>

            <motion.a
              href="mailto:hello@simplelogicx.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-5 border border-dark-500 rounded-full hover:border-cyan/50 hover:bg-cyan/5 transition-all text-lg"
            >
              <Mail className="w-5 h-5" />
              Schedule a Call
            </motion.a>
          </div>

          {/* Contact info */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan" />
              <span>hello@simplelogicx.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan" />
              <span>+1 (555) 000-0000</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
