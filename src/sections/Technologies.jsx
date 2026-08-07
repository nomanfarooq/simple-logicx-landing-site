import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const technologies = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Go', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'GCP', category: 'Cloud' },
  { name: 'Terraform', category: 'Cloud' },
  { name: 'GraphQL', category: 'API' },
  { name: 'gRPC', category: 'API' },
  { name: 'TensorFlow', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
]

// Infinite marquee row
function MarqueeRow({ items, direction = 'left', speed = 20 }) {
  return (
    <div className="relative overflow-hidden mb-8">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-dark-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-dark-900 to-transparent z-10" />

      <div
        className={`flex gap-6 animate-marquee-${direction}`}
        style={{ '--marquee-speed': `${speed}s` }}
      >
        {[...items, ...items].map((tech, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-6 py-3 rounded-xl border border-dark-600/50 bg-dark-700/30 backdrop-blur-sm hover:border-cyan/40 hover:bg-cyan/5 transition-all group"
          >
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              {tech.name}
            </span>
            <span className="ml-2 text-xs text-gray-600">{tech.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Technologies() {
  const sectionRef = useRef(null)

  return (
    <section ref={sectionRef} className="relative py-32 bg-dark-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" id="tech-header">
          <span className="inline-block px-4 py-1.5 rounded-full border border-lime/30 bg-lime/10 text-lime text-sm font-medium mb-6">
            Stack
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Technologies We{' '}
            <span className="bg-gradient-to-r from-lime to-cyan bg-clip-text text-transparent">Master</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Battle-tested tools. No hype cycles — we pick the right technology for your problem, not the trendiest one.
          </p>
        </div>

        {/* Marquee rows */}
        <MarqueeRow items={technologies.slice(0, 10)} direction="left" speed={25} />
        <MarqueeRow items={technologies.slice(5)} direction="right" speed={30} />
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left var(--marquee-speed) linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right var(--marquee-speed) linear infinite;
        }
      `}</style>
    </section>
  )
}
