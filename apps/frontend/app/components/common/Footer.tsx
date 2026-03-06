import {
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "lucide-react";
export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#2e2e2e]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <div className="font-serif text-2xl font-bold tracking-[0.15em] text-[#f5f0eb]">
                SUIT MASTERS
              </div>
              <div className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mt-0.5">
                Bespoke Tailoring
              </div>
            </div>
            <p className="text-[#9a9490] text-sm leading-relaxed mb-6 max-w-xs font-light">
              Crafting exceptional suits for the modern gentleman since 1987.
              Where tradition meets contemporary elegance.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <TwitterIcon size={18} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <YoutubeIcon size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <LinkedinIcon size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[#f5f0eb] text-[10px] tracking-[0.3em] uppercase font-semibold mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Suits
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Blazers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Shirts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Trousers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Accessories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#c9a96e] hover:text-[#dfc08a] text-sm transition-colors duration-200 font-medium"
                >
                  Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#f5f0eb] text-[10px] tracking-[0.3em] uppercase font-semibold mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Made to Measure
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Book a Fitting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Style Consultation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Alterations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Corporate Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[#f5f0eb] text-[10px] tracking-[0.3em] uppercase font-semibold mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Care Instructions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#9a9490] hover:text-[#c9a96e] text-sm transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#6b6560] text-xs">
            © 2026 Suit Masters Bespoke Tailoring. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-[#6b6560] hover:text-[#9a9490] text-xs transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#6b6560] hover:text-[#9a9490] text-xs transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[#6b6560] hover:text-[#9a9490] text-xs transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
