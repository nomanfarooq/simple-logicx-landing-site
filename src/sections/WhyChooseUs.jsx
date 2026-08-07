import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, X } from 'lucide-react'

const comparisons = [
  { feature: 'Dedicated engineering team', competitor: false, us: true },
  { feature: 'Transparent milestone tracking', competitor: false, us: true },
  { feature: 'Post-launch support & maintenance', competitor: false, us: true },
  { feature: 'Custom architecture per project', competitor: false, us: true },
  { feature: 'AI-first design approach', competitor: false, us: true },
  { feature: 'Generic templates', competitor: true, us: false },
  { feature: 'Hidden costs & scope creep', competitor: true, us: false },
  { feature: 'No post-delivery support', competitor: true, us: false },
]

export default function WhyChooseUs() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const anims = []

    // Reveal header
    const reveal = document.querySelector('[data-reveal]')
    if (reveal) {
      anims.push(
        gsap.fromTo(reveal, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: reveal, start: 'top 80%', once: true }
        })
      )
    }

    // Stagger rows
    const table = document.querySelector('[data-comparison-table]')
    if (table) {
      anims.push(
        gsap.fromTo('[data-comparison-row]', { opacity: 0, x: -20 }, {
          opacity: 1, x: 0, stagger: 0.08, duration: 0.5,
          scrollTrigger: { trigger: table, start: 'top 75%', once: true }
        })
      )
    }

    // Value props
    anims.push(
      gsap.fromTo('[data-value-prop]', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.6,
        scrollTrigger: { trigger: '[data-value-prop]', start: 'top 85%', once: true }
      })
    )

    return () => anims.forEach((a) => a.kill())
  }, [])

  return (
    <section ref={sectionRef} className="relative py-32 bg-dark-800 overflow-hidden">
      {/* Aurora gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/10 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" data-reveal>
          <span className="inline-block px-4 py-1.5 rounded-full border border-lime/30 bg-lime/10 text-lime text-sm font-medium mb-6">
            The Difference
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Why{' '}
            <span className="bg-gradient-to-r from-lime to-cyan bg-clip-text text-transparent">SimpleLogicX</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            We don't just write code — we engineer competitive advantages. Here's how we stack up.
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-3xl mx-auto" data-comparison-table>
          {/* Table headers */}
          <div className="grid grid-cols-3 items-center gap-4 mb-6 px-8">
            <div />
            <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">Others</p>
            <p className="text-center text-sm font-semibold text-lime uppercase tracking-wider">SimpleLogicX</p>
          </div>

          {comparisons.map((item, i) => (
            <div
              key={i}
              data-comparison-row
              className="grid grid-cols-3 items-center gap-4 py-5 px-8 border-t border-dark-600/50 hover:bg-dark-700/20 transition-colors"
            >
              <span className="text-gray-300">{item.feature}</span>
              <div className="flex justify-center">
                {item.competitor ? (
                  <X className="w-5 h-5 text-coral" />
                ) : (
                  <X className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <div className="flex justify-center">
                {item.us ? (
                  <div className="p-1 rounded-full bg-lime/20">
                    <Check className="w-4 h-4 text-lime" />
                  </div>
                ) : (
                  <X className="w-5 h-5 text-gray-700" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Value props */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Speed to Market', desc: 'We ship MVPs in weeks, not months. Our agile process delivers working software every sprint.' },
            { num: '02', title: 'Engineering Rigor', desc: 'Clean architecture, comprehensive testing, and code reviews ensure your product scales without tech debt.' },
            { num: '03', title: 'Long-term Partnership', desc: 'We stay invested after launch with maintenance, iteration, and strategic guidance as your product evolves.' },
          ].map((prop, i) => (
            <div key={i} data-value-prop className="relative p-8 rounded-2xl border border-dark-600/50 bg-dark-700/30">
              <span className="text-6xl font-black text-dark-500 absolute top-4 right-6">{prop.num}</span>
              <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
              <p className="text-gray-400 leading-relaxed">{prop.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
