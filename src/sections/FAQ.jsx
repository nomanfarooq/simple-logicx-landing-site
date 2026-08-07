import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How long does a typical project take?',
    answer: 'It depends on scope. An MVP typically takes 8-12 weeks. Full-scale products run 4-6 months with our dedicated pods. We always start with a discovery phase to give you an accurate timeline before committing.',
  },
  {
    question: 'What technologies do you work with?',
    answer: "We're technology-agnostic and pick the best stack for your problem. Our core expertise spans React, Next.js, Node.js, Python, Go, PostgreSQL, AWS, GCP, Kubernetes, TensorFlow, Flutter, and more. We don't push trends — we solve problems.",
  },
  {
    question: 'Do you offer ongoing maintenance and support?',
    answer: 'Absolutely. Every engagement includes post-launch support. Professional plans get 90 days, and Enterprise clients enjoy 24/7 dedicated support with performance SLAs. We stay invested in your product long after launch.',
  },
  {
    question: 'How do you handle project communication?',
    answer: 'We run two-week agile sprints with weekly demos for stakeholders. You get a dedicated Slack channel, daily standup notes, and full visibility into our project board. No black boxes — ever.',
  },
  {
    question: 'Can you work with our existing team?',
    answer: "Yes. We frequently augment in-house teams. Our engineers integrate seamlessly with your workflows, tools, and coding standards. We can embed on-site or collaborate fully remotely across time zones.",
  },
  {
    question: 'What is your pricing model?',
    answer: 'We offer fixed-scope engagements for well-defined projects and time-and-materials for evolving scopes. Every engagement starts transparent — you always know the budget before we begin.',
  },
  {
    question: 'Do you sign NDAs?',
    answer: "Of course. We sign NDAs as a standard part of our onboarding process. Your ideas, code, and intellectual property remain exclusively yours.",
  },
]

function FAQItem({ question, answer, isOpen, onClick }) {
  const contentRef = useRef(null)

  return (
    <div
      className={`border border-dark-600/50 rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'bg-dark-700/40 border-cyan/20' : 'hover:border-dark-500'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="text-lg font-medium pr-4">{question}</span>
        <div className={`p-1 rounded-full transition-all ${isOpen ? 'bg-cyan/20 rotate-45' : ''}`}>
          {isOpen ? (
            <Minus className="w-5 h-5 text-cyan" />
          ) : (
            <Plus className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative py-32 bg-dark-800">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20" id="faq-header">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium mb-6">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Common{' '}
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Questions</span>
          </h2>
        </div>

        {/* FAQ list */}
        <div id="faq-list" className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
