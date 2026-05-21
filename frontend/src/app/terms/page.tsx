'use client'

import Link from 'next/link'
import { Tractor, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
            <Tractor className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-900">FarmGearConnect</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: May 2025</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using FarmGearConnect ("the Platform"), you agree to be bound by these
                Terms and Conditions. If you do not agree with any part of these terms, you must not
                use the Platform. These terms apply to all users including farmers, equipment owners,
                and administrators.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Platform Description</h2>
              <p>
                FarmGearConnect is an online marketplace that connects farmers seeking agricultural
                equipment with equipment owners who wish to rent out their machinery. The Platform
                facilitates bookings, payments, and communication between parties but does not own,
                operate, or control any equipment listed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must be at least 18 years of age to register and use the Platform.</li>
                <li>Each person may maintain only one account. Duplicate accounts may be suspended.</li>
                <li>
                  You must notify us immediately of any unauthorized use of your account at
                  support@farmgearconnect.com.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Equipment Listings</h2>
              <p>Equipment owners agree that:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>All listed equipment must be roadworthy, safe, and fit for agricultural purpose.</li>
                <li>Listings must contain accurate descriptions, pricing, and availability.</li>
                <li>Equipment must be legally owned or authorized for subletting by the owner.</li>
                <li>
                  The Platform reserves the right to remove listings that violate these terms or
                  applicable laws.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Bookings and Payments</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  A booking request is not confirmed until the equipment owner explicitly approves it.
                </li>
                <li>
                  Payment is processed securely. FarmGearConnect charges a platform fee on each
                  completed transaction.
                </li>
                <li>
                  Cancellation policies are set individually by equipment owners and are clearly
                  displayed on each listing.
                </li>
                <li>
                  Disputes regarding refunds must be raised within 7 days of the booking end date.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Activities</h2>
              <p>Users must not:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use the Platform for any unlawful, fraudulent, or harmful purpose.</li>
                <li>Post false, misleading, or defamatory content.</li>
                <li>Attempt to bypass the Platform to make direct payments to avoid fees.</li>
                <li>Harass, threaten, or abuse other users.</li>
                <li>
                  Scrape, copy, or redistribute Platform content without prior written consent.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Liability Disclaimer</h2>
              <p>
                FarmGearConnect acts solely as an intermediary marketplace. We are not liable for:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Equipment damage, malfunction, or accidents during the rental period.</li>
                <li>Losses arising from the actions or omissions of farmers or equipment owners.</li>
                <li>Delays, cancellations, or disputes between parties.</li>
              </ul>
              <p className="mt-3">
                Users are encouraged to inspect equipment before use and to carry appropriate
                insurance coverage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Privacy Policy</h2>
              <p>
                Your use of the Platform is also governed by our Privacy Policy, which describes
                how we collect, use, and protect your personal information. By using the Platform,
                you consent to our data practices as described therein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Modifications to Terms</h2>
              <p>
                We reserve the right to update these Terms and Conditions at any time. Continued
                use of the Platform after changes are posted constitutes your acceptance of the
                revised terms. We will notify registered users of material changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of
                India. Any disputes arising shall be subject to the exclusive jurisdiction of
                courts in the relevant jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p>
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="font-medium text-gray-900">FarmGearConnect Support</p>
                <p className="text-sm text-gray-600 mt-1">Email: support@farmgearconnect.com</p>
                <p className="text-sm text-gray-600">Phone: 1800-XXX-XXXX (Toll Free)</p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-400">© 2025 FarmGearConnect. All rights reserved.</p>
            <Link
              href="/login"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
