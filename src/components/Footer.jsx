import { ArrowUpRight } from 'lucide-react'

const footerLinks = {
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  Services: ['SaaS Development', 'AI & ML', 'Mobile Apps', 'Web Apps', 'Cloud Infrastructure'],
  Resources: ['Case Studies', 'Documentation', 'API Reference', 'Support'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
}

const socialLinks = [
  { name: 'Twitter', url: '#' },
  { name: 'LinkedIn', url: '#' },
  { name: 'GitHub', url: '#' },
  { name: 'Dribbble', url: '#' },
]

export default function Footer() {
  return (
    <footer className="relative bg-dark-900 border-t border-dark-600/50">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-lime flex items-center justify-center">
                <span className="text-dark-900 font-black text-sm">SL</span>
              </div>
              <span className="font-bold text-lg">
                Simple<span className="text-cyan">LogicX</span>
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed mb-6 max-w-sm">
              Engineering digital excellence since 2012. We transform ambitious ideas into world-class software products that move markets.
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="p-2 rounded-lg border border-dark-600 bg-dark-700/30 hover:border-cyan/50 hover:bg-cyan/5 transition-all group"
                  aria-label={social.name}
                >
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-600/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} SimpleLogicX. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Crafted with</span>
            <span className="text-coral">&hearts;</span>
            <span>in San Francisco</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
