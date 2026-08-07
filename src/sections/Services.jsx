import { useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Rocket, Brain, Smartphone, Monitor, Cloud, Wifi, Building2 } from 'lucide-react'

const services = [
  {
    icon: Rocket,
    title: 'SaaS Development',
    description: 'Scalable multi-tenant platforms with subscription billing, analytics dashboards, and enterprise-grade security.',
    color: 'from-cyan to-blue-500',
  },
  {
    icon: Brain,
    title: 'AI & Machine Learning',
    description: 'Intelligent systems powered by deep learning, NLP, computer vision, and custom model training pipelines.',
    color: 'from-lime to-emerald-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile experiences built with React Native and Flutter for iOS and Android.',
    color: 'from-coral to-pink-500',
  },
  {
    icon: Monitor,
    title: 'Web Applications',
    description: 'Performant, accessible web applications with modern frameworks, SSR, and real-time capabilities.',
    color: 'from-gold to-amber-500',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description: 'Resilient cloud architecture on AWS, GCP, and Azure with Kubernetes, serverless, and DevOps automation.',
    color: 'from-amber to-orange-500',
  },
  {
    icon: Wifi,
    title: 'IoT Solutions',
    description: 'Connected device ecosystems with real-time telemetry, edge computing, and industrial-grade protocols.',
    color: 'from-blue-400 to-cyan',
  },
  {
    icon: Building2,
    title: 'Enterprise Software',
    description: 'Mission-critical systems for large organizations — ERP, CRM, data warehouses, and integration platforms.',
    color: 'from-purple-500 to-violet-500',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function Services() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)

  // GSAP heading animation
  const st = ScrollTrigger.create({
    trigger: '#services-heading',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo('#services-heading', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
    },
  })

  return (
    <section id="services" ref={sectionRef} className="relative py-32 bg-dark-900">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div id="services-heading" ref={headingRef} className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-sm font-medium mb-6">
            What We Do
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Services That Drive{' '}
            <span className="bg-gradient-to-r from-cyan to-lime bg-clip-text text-transparent">Results</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            End-to-end software engineering across every layer of your stack. We partner with you from concept to production and beyond.
          </p>
        </div>

        {/* Services grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center"
        >
          {services.map((service, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`group relative p-8 rounded-2xl border border-dark-600/50 bg-dark-700/30 backdrop-blur-sm hover:border-cyan/30 transition-all duration-300 ${
                services.length % 3 === 1 && i === services.length - 1 ? 'lg:col-start-2' : ''
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} mb-6`}>
                <service.icon className="w-6 h-6 text-dark-900" />
              </div>

              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.description}</p>

              {/* Arrow indicator */}
              <div className="mt-6 flex items-center gap-2 text-sm text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
