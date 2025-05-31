import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'API Docs', href: '#docs' },
      { label: 'Changelog', href: '#changelog' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#help' },
      { label: 'Community', href: '#community' },
      { label: 'Tutorials', href: '#tutorials' },
      { label: 'Examples', href: '#examples' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Security', href: '#security' },
      { label: 'Cookies', href: '#cookies' }
    ]
  }
];

const socialLinks = [
  { icon: Github, href: '#github', label: 'GitHub' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
  { icon: Mail, href: '#email', label: 'Email' }
];

const BrutalFooter = () => {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="px-[clamp(1.5rem,6vw,4rem)] py-16">
        <div className="max-w-7xl mx-auto">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#FFE37B] mb-4">
                  Maha Wrapper
                </h3>
                <p className="text-gray-300 font-medium leading-relaxed">
                  The ultimate AI toolkit for creators, developers, and innovators. 
                  Unleash the power of artificial intelligence.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 bg-[#7C82FF] hover:bg-[#FF5484] border-3 border-white flex items-center justify-center transition-colors duration-200 transform hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon size={20} className="text-white" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="lg:col-span-1">
                <h4 className="text-lg font-black uppercase tracking-tight text-[#FF5484] mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-[#FFE37B] font-medium transition-colors duration-200 hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Newsletter Section */}
          <div className="bg-[#7C82FF] border-4 border-white p-8 mb-12 transform -rotate-1">
            <div className="text-center">
              <h4 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
                Stay in the Loop!
              </h4>
              <p className="text-white font-medium mb-6">
                Get the latest updates, tips, and AI insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 border-3 border-black font-medium text-black placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-[#FFE37B]"
                />
                <button className="bg-[#FF5484] hover:bg-[#FFE37B] border-3 border-black text-black font-black px-6 py-3 uppercase tracking-tight transition-colors duration-200 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t-4 border-[#7C82FF] bg-black">
        <div className="px-[clamp(1.5rem,6vw,4rem)] py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-300 font-medium">
              <span>© 2024 Maha Wrapper. Made with</span>
              <Heart size={16} className="text-[#FF5484] fill-current" />
              <span>and lots of coffee.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-400">v2.1.0</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-300 font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Bottom Elements */}
      <div className="bg-[#FFE37B] h-2" />
      <div className="bg-[#FF5484] h-2" />
      <div className="bg-[#7C82FF] h-2" />
    </footer>
  );
};

export default BrutalFooter; 