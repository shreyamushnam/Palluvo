import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin, Sparkles } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Concierge | Client Services & Inquiries | PALLUVO",
  description:
    "Connect with the PALLUVO private concierge for bridal consultations, styling advice, and order assistance. Available Mon - Sat, 10 AM to 7 PM IST.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-16">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#541920] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
            <span>Client Services</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-neutral-900 leading-tight">
            PALLUVO Concierge Desk
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans max-w-xl mx-auto leading-relaxed">
            Personalized saree consultations, custom blouse coordination, and dedicated order care.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E2D9] space-y-6">
            <h2 className="font-serif text-xl text-neutral-900 border-b border-[#E8E2D9] pb-3">
              Direct Inquiries
            </h2>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-semibold">WhatsApp & Phone Care</strong>
                  <div className="space-y-2 mt-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-neutral-800">+91 84988 54323</span>
                      <span className="text-neutral-300">|</span>
                      <a
                        href="tel:+918498854323"
                        className="min-h-[44px] px-2 py-1 text-[#541920] hover:underline inline-flex items-center font-medium focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                      >
                        Call
                      </a>
                      <span className="text-neutral-300">·</span>
                      <a
                        href="https://wa.me/918498854323"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-2 py-1 text-[#128C7E] hover:underline inline-flex items-center font-medium focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:outline-none"
                      >
                        WhatsApp
                      </a>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-neutral-800">+91 81067 89789</span>
                      <span className="text-neutral-300">|</span>
                      <a
                        href="tel:+918106789789"
                        className="min-h-[44px] px-2 py-1 text-[#541920] hover:underline inline-flex items-center font-medium focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                      >
                        Call
                      </a>
                      <span className="text-neutral-300">·</span>
                      <a
                        href="https://wa.me/918106789789"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-2 py-1 text-[#128C7E] hover:underline inline-flex items-center font-medium focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:outline-none"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-semibold">Operating Hours</strong>
                  <p className="text-neutral-600 mt-0.5">Mon - Sat, 10 AM to 7 PM IST</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Response typically within 4 business hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-semibold">Written Correspondence</strong>
                  <a href="mailto:contact@palluvo.com" className="text-[#541920] hover:underline block font-medium mt-0.5">
                    contact@palluvo.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-semibold">Flagship Atelier</strong>
                  <p className="text-neutral-600 mt-0.5">
                    PALLUVO Textile Studio, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="bg-[#F4EFE6] p-6 sm:p-8 rounded-sm border border-[#E8E2D9] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-neutral-900 border-b border-[#E8E2D9] pb-3">
                Virtual Drape Consultation
              </h2>
              <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                Planning a wedding trousseau or looking for the ideal drape? Our stylists offer one-on-one video appointments to present saree falls, border details, and blouse recommendations in natural light.
              </p>
              <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] text-xs text-neutral-700 space-y-1">
                <strong className="text-neutral-900 block font-semibold">What We Assist With:</strong>
                <p>• Pure Silk Mark authentication and weave provenance</p>
                <p>• Custom unstitched blouse styling and zari coordination</p>
                <p>• Insured express domestic and international courier tracking</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/shop"
                className="w-full min-h-[44px] py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                Explore Saree Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
