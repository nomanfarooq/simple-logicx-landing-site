import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, Sparkles, Crown, Rocket } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '15,000',
    description: 'Perfect for MVPs and proof-of-concept projects.',
    icon: Rocket,
    features: [
      'Up to 3 months delivery',
      'Single platform (Web or Mobile)',
      'Dedicated project manager',
      'Agile sprint reviews',
      '30-day post-launch support',
      'Basic analytics integration',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '50,000',
    description: 'Full-scale product development with dedicated team.',
    icon: Sparkles,
    features: [
      '6-month development cycle',
      'Multi-platform architecture',
      'Dedicated engineering pod',
      'Weekly stakeholder demos',
      '90-day post-launch support',
      'Advanced analytics & A/B testing',
      'CI/CD pipeline setup',
      'Security audit included',
    ],
    cta: 'Start Building',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'End-to-end transformation with long-term partnership.',
    icon: Crown,
    features: [
      'Unlimited scope & timeline',
      'Full engineering department',
      'On-site & remote team options',
      'Architecture governance',
      '24/7 dedicated support',
      'Performance optimization SLA',
      'Knowledge transfer program',
      'Strategic technology advisory',
    ],
    cta: 'Talk to Us',
    popular: false,
  },
]

export default function Pricing() {
  const sectionRef = useRef(null)
  const [annual, setAnnual] = useState(true)

  return (
    <section ref={sectionRef} className="relative py-32 bg-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" id="pricing-header">
          <span className="inline-block px-4 py-1.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-sm font-medium mb-6">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Transparent{' '}
            <span className="bg-gradient-to-r from-cyan to-lime bg-clip-text text-transparent">Investment</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Clear pricing, no surprises. Every engagement starts with a fixed-scope discovery phase so you know exactly what you're getting.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto" id="pricing-cards">
          {plans.map((plan, i) => (
            <div
              key={i}
              id={`pricing-card-${i}`}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'border-cyan/50 bg-gradient-to-b from-cyan/10 to-dark-700/50 md:-mt-4 md:mb-[-1rem] shadow-lg shadow-cyan/5'
                  : 'border-dark-600/50 bg-dark-700/20 hover:border-dark-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan text-dark-900 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <plan.icon className={`w-8 h-8 mb-4 ${plan.popular ? 'text-cyan' : 'text-gray-500'}`} />

              {/* Name & price */}
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price !== 'Custom' && (
                  <span className="text-gray-500 ml-2">starting</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-cyan' : 'text-lime'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
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
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan to-lime text-dark-900 hover:opacity-90'
                    : 'border border-dark-500 hover:border-cyan/50 hover:bg-cyan/5'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
