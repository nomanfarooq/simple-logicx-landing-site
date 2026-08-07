import { useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Users, TrendingUp, Zap } from 'lucide-react'

const projects = [
  {
    title: 'FinVault',
    category: 'Fintech SaaS',
    description: 'A real-time payment processing platform handling $2B+ in annual transactions. Built with microservices architecture and sub-50ms latency.',
    metrics: [
      { icon: Users, value: '2M+', label: 'Active Users' },
      { icon: TrendingUp, value: '$2B', label: 'Annual Volume' },
      { icon: Zap, value: '<50ms', label: 'Latency' },
    ],
    gradient: 'from-cyan to-blue-600',
  },
  {
    title: 'NeuralCare',
    category: 'Healthcare AI',
    description: 'AI-powered diagnostic assistant that analyzes medical imaging with 97.3% accuracy. Deployed across 45 hospitals in three countries.',
    metrics: [
      { icon: Users, value: '45', label: 'Hospitals' },
      { icon: TrendingUp, value: '97.3%', label: 'Accuracy' },
      { icon: Zap, value: '3x', label: 'Faster Diagnosis' },
    ],
    gradient: 'from-lime to-emerald-600',
  },
  {
    title: 'CloudScale',
    category: 'Enterprise Platform',
    description: 'Multi-cloud management platform that unified infrastructure across AWS, GCP, and Azure for a Fortune 500 enterprise.',
    metrics: [
      { icon: Users, value: '50K+', label: 'Managed Nodes' },
      { icon: TrendingUp, value: '40%', label: 'Cost Reduction' },
      { icon: Zap, value: '99.99%', label: 'Uptime SLA' },
    ],
    gradient: 'from-gold to-amber-600',
  },
  {
    title: 'SwiftCommerce',
    category: 'E-Commerce Mobile',
    description: 'Cross-platform mobile commerce app with AR product preview, processing 50K orders daily during peak seasons.',
    metrics: [
      { icon: Users, value: '3.2M', label: 'Downloads' },
      { icon: TrendingUp, value: '50K', label: 'Daily Orders' },
      { icon: Zap, value: '4.8★', label: 'App Rating' },
    ],
    gradient: 'from-coral to-pink-600',
  },
]

export default function Portfolio() {
  const sectionRef = useRef(null)

  return (
    <section id="portfolio" ref={sectionRef} className="relative py-32 bg-dark-800">
      {/* Background effect */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-coral/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full border border-coral/30 bg-coral/10 text-coral text-sm font-medium mb-6">
            Portfolio
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Projects That{' '}
            <span className="bg-gradient-to-r from-coral to-gold bg-clip-text text-transparent">Moved Needles</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Real results from real partnerships. These case studies represent the kind of impact we deliver consistently.
          </p>
        </div>

        {/* Project cards */}
        <div className="space-y-16">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              id={`portfolio-item-${i}`}
              className={`group relative rounded-3xl border border-dark-600/50 bg-dark-700/20 overflow-hidden hover:border-cyan/20 transition-all duration-500 flex md:flex-row ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Visual side */}
              <div className={`relative h-64 md:h-auto md:min-h-[320px] md:w-1/2 bg-gradient-to-br ${project.gradient} p-12 flex items-end`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '30px 30px',
                }} />
                <ArrowUpRight className="absolute top-6 right-6 w-8 h-8 text-white/50 group-hover:text-white group-hover:rotate-45 transition-all" />

                <div className="relative z-10">
                  <span className="text-sm font-medium text-white/70 uppercase tracking-wider">{project.category}</span>
                  <h3 className="text-3xl font-bold mt-2">{project.title}</h3>
                </div>
              </div>

              {/* Content side */}
              <div className="p-10 md:p-12 flex flex-col justify-center md:w-1/2">
                <p className="text-gray-400 text-lg leading-relaxed mb-8">{project.description}</p>

                <div className="grid grid-cols-3 gap-6">
                  {project.metrics.map((metric, j) => (
                    <div key={j} className="text-center">
                      <metric.icon className="w-5 h-5 mx-auto mb-2 text-cyan" />
                      <div className="text-xl font-bold">{metric.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
