import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import TrustedCompanies from './sections/TrustedCompanies'
import Services from './sections/Services'
import WhyChooseUs from './sections/WhyChooseUs'
import ProcessTimeline from './sections/ProcessTimeline'
import Portfolio from './sections/Portfolio'
import Technologies from './sections/Technologies'
import Testimonials from './sections/Testimonials'
import Pricing from './sections/Pricing'
import FAQ from './sections/FAQ'
import CTA from './sections/CTA'
import { useLenis } from './hooks/useLenis'

gsap.registerPlugin(ScrollTrigger)

function App() {
  // Initialize Lenis smooth scrolling
  useLenis()

  // Global GSAP scroll-triggered animations for sections that don't have their own
  useEffect(() => {
    const anims = []

    // Section headers general reveal pattern
    const headers = ['#services-heading', '#process-header', '#tech-header', '#testimonials-header', '#pricing-header', '#faq-header']
    headers.forEach((selector) => {
      const el = document.querySelector(selector)
      if (el) {
        anims.push(
          gsap.fromTo(el, 
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 80%', once: true },
            }
          )
        )
      }
    })

    // Process timeline steps
    for (let i = 0; i < 5; i++) {
      const step = document.getElementById(`process-step-${i}`)
      if (step) {
        anims.push(
          gsap.fromTo(step,
            { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
            {
              opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
              scrollTrigger: { trigger: step, start: 'top 85%', once: true },
            }
          )
        )
      }
    }

    // Testimonials stagger
    const testimonialsGrid = document.getElementById('testimonials-grid')
    if (testimonialsGrid) {
      anims.push(
        gsap.fromTo(testimonialsGrid.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: testimonialsGrid, start: 'top 80%', once: true },
          }
        )
      )
    }

    // Pricing cards stagger
    const pricingCards = document.getElementById('pricing-cards')
    if (pricingCards) {
      anims.push(
        gsap.fromTo(pricingCards.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: pricingCards, start: 'top 75%', once: true },
          }
        )
      )
    }

    // FAQ items stagger
    const faqList = document.getElementById('faq-list')
    if (faqList) {
      anims.push(
        gsap.fromTo(faqList.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out',
            scrollTrigger: { trigger: faqList, start: 'top 75%', once: true },
          }
        )
      )
    }

    // Tech header
    const techHeader = document.getElementById('tech-header')
    if (techHeader) {
      anims.push(
        gsap.fromTo(techHeader,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: techHeader, start: 'top 80%', once: true },
          }
        )
      )
    }

    return () => {
      anims.forEach((a) => a.kill())
    }
  }, [])

  return (
    <div className="relative">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      <Navbar />

      <main>
        <Hero />
        <TrustedCompanies />
        <Services />
        <WhyChooseUs />
        <div id="process">
          <ProcessTimeline />
        </div>
        <Portfolio />
        <Technologies />
        <Testimonials />
        <div id="pricing">
          <Pricing />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <CTA />
      </main>

      <Footer />
    </div>
  )
}

export default App
