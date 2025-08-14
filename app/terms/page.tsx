import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - LinkNest',
  description: 'LinkNest Terms of Service (EU-compliant)',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">LinkNest</h1>
          <Link href="/" className="px-3 py-1.5 rounded border border-white/30 hover:bg-white hover:text-black transition">Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
        <p className="text-black/70 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

        <div className="prose prose-neutral max-w-none">
          <h3>1. About LinkNest</h3>
          <p>
            LinkNest is a bookmarking and organization tool that lets you save, group, and search links. Some features
            use AI services to generate descriptions and group titles. These Terms apply to your access to and use of the
            service.
          </p>

          <h3>2. Eligibility</h3>
          <p>
            You must be at least 16 years old or have parental/guardian consent if required by the laws of your country.
            By using the service, you confirm you have the legal capacity to enter into these Terms.
          </p>

          <h3>3. Accounts and Security</h3>
          <p>
            You are responsible for the activity on your account and for maintaining the security of your login
            credentials. If you believe your account is compromised, notify us promptly.
          </p>

          <h3>4. User Content</h3>
          <p>
            You own the links and content you add. You grant LinkNest a non-exclusive license to host, store, and process
            that content solely to provide and improve the service. Do not upload content that infringes rights of others
            or violates applicable law.
          </p>

          <h3>5. Acceptable Use</h3>
          <p>
            You agree not to misuse the service, including by: (a) attempting to access accounts or data without
            authorization; (b) introducing malware or disrupting the service; (c) using the service for unlawful
            purposes; or (d) scraping, harvesting, or excessive automated access beyond normal usage.
          </p>

          <h3>6. AI Features and Third-Party Services</h3>
          <p>
            AI-generated descriptions and groups may be inaccurate or incomplete. Verify important information before
            relying on it. The service may integrate third-party services (e.g., authentication, hosting, AI APIs). Your
            use of such services is subject to their terms and policies.
          </p>

          <h3>7. Availability, Changes, and Discontinuation</h3>
          <p>
            We may modify, suspend, or discontinue the service (in whole or in part) at any time, including without
            prior notice. To the maximum extent permitted by applicable law, we shall not be liable for any loss or
            damage arising from any such modification, suspension, or discontinuation. We recommend exporting your data
            regularly.
          </p>

          <h3>8. Fees</h3>
          <p>
            Some features may be offered under paid plans. Prices and features may change. Where required by law, you
            will be informed in advance and may cancel before changes take effect.
          </p>

          <h3>9. Privacy</h3>
          <p>
            We process personal data in accordance with our Privacy Policy and applicable EU/EEA data protection law
            (including the GDPR). By using the service, you consent to such processing. Where required, we rely on your
            consent for specific features.
          </p>

          <h3>10. Intellectual Property</h3>
          <p>
            The service, its design, and software are protected by intellectual property laws. These Terms do not grant
            you any rights to trademarks or other brand features.
          </p>

          <h3>11. Warranty Disclaimer</h3>
          <p>
            The service is provided on an “as is” and “as available” basis. To the extent permitted by applicable law,
            we disclaim all warranties, express or implied, including fitness for a particular purpose and
            non-infringement. This does not affect mandatory consumer rights under EU law.
          </p>

          <h3>12. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by applicable law, LinkNest and its owners shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, data, or
            goodwill, arising out of or related to your use of the service. Nothing in these Terms excludes liability
            that cannot be excluded under applicable law (including liability for death or personal injury caused by
            negligence, or for intentional misconduct or gross negligence).
          </p>

          <h3>13. Termination</h3>
          <p>
            You may stop using the service at any time. We may suspend or terminate access if you materially breach
            these Terms or if required by law.
          </p>

          <h3>14. Changes to These Terms</h3>
          <p>
            We may update these Terms from time to time. If we make material changes, we will provide reasonable notice
            where required by law. Your continued use of the service after changes take effect constitutes acceptance of
            the updated Terms.
          </p>

          <h3>15. Governing Law and Jurisdiction</h3>
          <p>
            These Terms are governed by the laws of the European Union member state where you reside, without regard to
            conflict-of-law principles. Disputes may be brought before the competent courts of your habitual residence
            in the EU. Mandatory consumer protection rules remain unaffected.
          </p>

          <h3>16. Contact</h3>
          <p>
            If you have questions about these Terms, please contact us via the contact details provided in the app or
            on our website.
          </p>
        </div>
      </main>
    </div>
  )
}


