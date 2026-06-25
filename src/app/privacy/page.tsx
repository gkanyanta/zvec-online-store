import Link from 'next/link';

const LAST_UPDATED = 'June 2026';
const ZVEC_EMAIL = 'info@zveconlinestore.com';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">1. Who We Are</h2>
          <p>ZVEC Online Store (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a Zambian e-commerce business operating at <strong>store-five-kohl.vercel.app</strong> and associated domains. We are the data controller for personal information collected through this website.</p>
          <p>Contact us at: <a href={`mailto:${ZVEC_EMAIL}`} className="text-teal-600 hover:underline">{ZVEC_EMAIL}</a></p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">2. Information We Collect</h2>
          <p>When you place an order, we collect:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your name, phone number, and email address (optional)</li>
            <li>Your delivery address (street, city, province)</li>
            <li>Order details (products, quantities, total amount)</li>
            <li>Special delivery instructions you choose to provide</li>
          </ul>
          <p>We do not collect payment card numbers. All orders are cash on delivery.</p>
          <p>We may also collect anonymous usage data (pages visited, browser type) through standard web server logs.</p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">3. How We Use Your Information</h2>
          <p>We use your personal information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Process and fulfil your order</li>
            <li>Contact you to confirm your order and delivery details</li>
            <li>Arrange delivery to your address</li>
            <li>Handle any returns or after-sales enquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not use your information for unsolicited marketing without your consent.</p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">4. Who We Share Your Information With</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Delivery partners</strong> — to fulfil your delivery (name, address, phone number only)</li>
            <li><strong>Technology providers</strong> — our website is hosted on Vercel and uses Neon (PostgreSQL) for data storage, both operating under appropriate data agreements</li>
            <li><strong>Legal authorities</strong> — if required by Zambian law</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">5. Data Retention</h2>
          <p>We retain order records for up to <strong>5 years</strong> for accounting and legal purposes. You may request deletion of your personal data by contacting us — we will action this where we are not legally required to retain it.</p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Request a copy of the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal obligations)</li>
            <li>Withdraw consent for marketing communications at any time</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href={`mailto:${ZVEC_EMAIL}`} className="text-teal-600 hover:underline">{ZVEC_EMAIL}</a>.</p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">7. Cookies</h2>
          <p>This website uses minimal cookies necessary for the shopping cart and session functionality. We do not use third-party advertising or tracking cookies.</p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. The date at the top of this page shows when it was last revised. Continued use of the website after changes constitutes acceptance of the updated policy.</p>
        </section>

      </div>

      <div className="text-center mt-8 space-x-4 text-sm">
        <Link href="/terms" className="text-teal-600 hover:text-teal-700 font-medium">Terms of Service</Link>
        <span className="text-gray-300">·</span>
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">← Home</Link>
      </div>
    </div>
  );
}
