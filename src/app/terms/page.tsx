import Link from 'next/link';

const LAST_UPDATED = 'June 2026';
const ZVEC_EMAIL = 'info@zveconlinestore.com';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800">
          By placing an order on ZVEC Online Store, you agree to these terms. Please read them before purchasing.
        </div>

        {[
          {
            title: '1. About ZVEC Online Store',
            body: 'ZVEC Online Store is operated by the ZVEC brand, a Zambian business based in Lusaka, Zambia. We sell household electronics and goods for delivery across Zambia. These terms govern your use of our website and purchase of products from us.',
          },
          {
            title: '2. Orders & Acceptance',
            body: 'Placing an order is an offer to purchase — it is not a confirmed sale until we contact you to confirm. We reserve the right to decline any order (for example, if a product is out of stock, if we cannot verify your delivery details, or if we reasonably suspect fraud). You will be notified promptly if we cannot fulfil your order.',
          },
          {
            title: '3. Pricing & Payment',
            body: 'All prices are displayed in Zambian Kwacha (ZMW). Prices are inclusive of all charges except where delivery fees apply (currently free on all orders). We accept Cash on Delivery only. Payment is due at the time of delivery. We reserve the right to update prices without prior notice, but the price at the time of your confirmed order will be honoured.',
          },
          {
            title: '4. Delivery',
            body: 'We deliver across all 10 provinces of Zambia. Estimated delivery times are: Lusaka 1–2 business days, Copperbelt 2–3 business days, all other provinces 3–5 business days. These are estimates only — delays may occur due to circumstances beyond our control. Our delivery team will contact you before arriving.',
          },
          {
            title: '5. Returns & Refunds',
            body: 'We operate a 7-day returns policy for eligible items. Full details, including what qualifies for return and the process, are set out on our Returns & Exchanges page. Refunds are processed within 3–5 business days of receiving the returned item.',
          },
          {
            title: '6. Product Information',
            body: 'We make every effort to ensure product descriptions, images, and specifications are accurate. However, we do not warrant that all information is complete or error-free. If you receive a product that is materially different from its description, you are entitled to a return under our returns policy.',
          },
          {
            title: '7. Warranty',
            body: 'Products carry the manufacturer\'s warranty as stated on the packaging. Warranty claims should be directed to us in the first instance, and we will assist in liaising with the manufacturer. Warranty does not cover damage caused by misuse, accidental damage, or unauthorised repair.',
          },
          {
            title: '8. Promo Codes',
            body: 'Promo codes are issued at our discretion and are subject to individual terms (minimum order value, expiry, usage limits). Codes cannot be combined unless explicitly stated. We reserve the right to withdraw or invalidate any code at any time.',
          },
          {
            title: '9. Limitation of Liability',
            body: 'To the maximum extent permitted by Zambian law, ZVEC Online Store is not liable for any indirect, incidental, or consequential losses arising from your use of this website or purchase of products. Our total liability for any claim is limited to the purchase price of the product in question.',
          },
          {
            title: '10. Governing Law',
            body: 'These terms are governed by the laws of the Republic of Zambia. Any disputes shall be subject to the exclusive jurisdiction of the courts of Zambia.',
          },
          {
            title: '11. Changes to These Terms',
            body: 'We may update these terms at any time. The updated version will be posted on this page with a revised date. Continued use of the website after changes constitutes acceptance of the new terms.',
          },
          {
            title: '12. Contact',
            body: `If you have any questions about these terms, contact us at ${ZVEC_EMAIL} or on WhatsApp at +260 973 804 982.`,
          },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-2">{section.title}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 space-x-4 text-sm">
        <Link href="/privacy" className="text-teal-600 hover:text-teal-700 font-medium">Privacy Policy</Link>
        <span className="text-gray-300">·</span>
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">← Home</Link>
      </div>
    </div>
  );
}
