import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "SimpleLogicX didn't just build our platform — they reimagined it. The AI features they designed tripled our user engagement in the first quarter.",
    name: 'Sarah Chen',
    role: 'CTO, FinVault',
    rating: 5,
  },
  {
    quote: 'Working with SimpleLogicX felt like having a world-class engineering team in-house. Their communication and delivery speed are unmatched.',
    name: 'Marcus Rivera',
    role: 'Founder, NeuralCare',
    rating: 5,
  },
  {
    quote: "They took our scattered microservices and built a unified platform that handles 10x the traffic at 40% lower cost. Incredible work.",
    name: 'Priya Sharma',
    role: 'VP Engineering, CloudScale Corp',
    rating: 5,
  },
  {
    quote: "The mobile app they built for us has a 4.8-star rating and processes more orders on launch day than our entire website did in a month.",
    name: 'James Walker',
    role: 'CEO, SwiftCommerce',
    rating: 5,
  },
]

export default function Testimonials() {
  const sectionRef = useRef(null)

  return (
    <section ref={sectionRef} className="relative py-32 bg-dark-800">
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" id="testimonials-header">
          <span className="inline-block px-4 py-1.5 rounded-full border border-amber/30 bg-amber/10 text-amber text-sm font-medium mb-6">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            What Our{' '}
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Clients Say</span>
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-2 gap-8" id="testimonials-grid">
          {testimonials.map((item, i) => (
            <div
              key={i}
              id={`testimonial-${i}`}
              className="group relative p-8 rounded-2xl border border-dark-600/50 bg-dark-700/30 backdrop-blur-sm hover:border-cyan/20 transition-all"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-cyan/30 mb-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">"{item.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-lime flex items-center justify-center text-dark-900 font-bold text-sm">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
