import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const companies = [
  'TechVentures',
  'CloudNova',
  'DataStream',
  'NeuralPath',
  'QuantumBit',
  'ScaleForce',
  'InnoSphere',
  'PixelForge',
]

export default function TrustedCompanies() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    gsap.fromTo(container.children, { opacity: 0.2 }, {
      opacity: 1,
      stagger: 0.15,
      duration: 0.6,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    })
  }, [])

  return (
    <section className="relative py-20 bg-dark-900 border-y border-dark-600/50">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm uppercase tracking-[0.3em] text-gray-600 mb-12">
          Trusted by industry leaders
        </p>

        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {companies.map((company, i) => (
            <div
              key={i}
              className="flex items-center justify-center py-6 px-8 rounded-xl border border-transparent hover:border-dark-500 bg-dark-700/20 hover:bg-dark-700/40 transition-all group"
            >
              <span className="text-xl font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite marquee */}
      <div className="mt-16 overflow-hidden">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...companies, ...companies].map((company, i) => (
            <span key={i} className="text-2xl font-bold text-gray-600">
              {company}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  )
}
