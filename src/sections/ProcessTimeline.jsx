import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Lightbulb, Search, Code, Rocket, TrendingUp } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Lightbulb,
    title: 'Discovery',
    description: 'We dive deep into your vision, market, users, and technical requirements. Outcome: a clear product blueprint.',
  },
  {
    step: '02',
    icon: Search,
    title: 'Design & Architecture',
    description: 'UX wireframes, system architecture, and technology stack selection. Every decision is intentional.',
  },
  {
    step: '03',
    icon: Code,
    title: 'Development',
    description: 'Two-week agile sprints with continuous integration. You see progress every iteration — no black boxes.',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Launch',
    description: 'Production deployment with monitoring, performance optimization, and zero-downtime strategies.',
  },
  {
    step: '05',
    icon: TrendingUp,
    title: 'Growth & Iteration',
    description: 'Data-driven feature development, A/B testing, and infrastructure scaling as your user base grows.',
  },
]

export default function ProcessTimeline() {
  const sectionRef = useRef(null)

  return (
    <section ref={sectionRef} className="relative py-32 bg-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" id="process-header">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium mb-6">
            Our Process
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            From Idea to{' '}
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Impact</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            A battle-tested process refined over 150+ projects. Predictable delivery, exceptional quality.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan via-lime to-gold opacity-30" />

          {steps.map((step, i) => (
            <div
              key={i}
              id={`process-step-${i}`}
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 ${
                i % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content card */}
              <div className="ml-20 md:ml-0 md:w-[calc(50%-2rem)]">
                <div className={`p-8 rounded-2xl border border-dark-600/50 bg-dark-700/30 backdrop-blur-sm hover:border-cyan/20 transition-all ${
                  i % 2 === 0 ? 'md:text-right' : 'md:text-left'
                }`}>
                  <div className={`flex items-center gap-4 mb-4 ${
                    i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                  }`}>
                    <span className="text-xs font-mono text-cyan">STEP {step.step}</span>
                    <step.icon className="w-5 h-5 text-cyan" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan border-4 border-dark-900 z-10" />
            </div>
          ))}
        </div>
      </div>

      {/* GSAP animations injected via useEffect in App */}
    </section>
  )
}
