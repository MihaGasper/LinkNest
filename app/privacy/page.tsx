import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - LinkNest',
  description: 'LinkNest Privacy Policy (EU/GDPR compliant)'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">LinkNest</h1>
          <Link href="/" className="px-3 py-1.5 rounded border border-white/30 hover:bg-white hover:text-black transition">Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
        <p className="text-black/70 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

        <div className="prose prose-neutral max-w-none">
          <h3>1. Controller and Contact</h3>
          <p>
            LinkNest ("we", "us", "our") is the controller of your personal data when you use our services. If you
            have questions, contact us via the details provided in the app or on our website.
          </p>

          <h3>2. What Data We Collect</h3>
          <ul>
            <li>Account data: email address, user ID (from authentication provider)</li>
            <li>Usage data: saved links, tags, AI-generated descriptions and group titles</li>
            <li>Technical data: IP address, device information, approximate location (from standard HTTP logs)</li>
          </ul>

          <h3>3. Purposes and Legal Bases (GDPR Art. 6)</h3>
          <ul>
            <li>Providing the service (performance of a contract, Art. 6(1)(b))</li>
            <li>Account security and fraud prevention (legitimate interests, Art. 6(1)(f))</li>
            <li>Improving features and troubleshooting (legitimate interests, Art. 6(1)(f))</li>
            <li>Where required, consent for specific optional features (Art. 6(1)(a))</li>
          </ul>

          <h3>4. Data Sources</h3>
          <p>
            We collect data directly from you (when you sign in and use the app) and from our authentication provider.
          </p>

          <h3>5. Sharing and Processors</h3>
          <p>
            We use trusted processors to operate the service, such as cloud hosting, authentication, and AI providers.
            These processors act on our instructions and are bound by contracts that protect your data.
          </p>
          <ul>
            <li>Supabase (authentication and database)</li>
            <li>OpenAI (AI descriptions and grouping)</li>
            <li>Hosting and analytics providers (as applicable)</li>
          </ul>

        
          <h3>6. International Transfers</h3>
          <p>
            If data is transferred outside the EEA/UK, we use appropriate safeguards such as Standard Contractual
            Clauses (SCCs) or rely on adequacy decisions where available.
          </p>

          <h3>7. Retention</h3>
          <p>
            We keep personal data only as long as necessary for the purposes described above. You may request deletion of
            your account and associated data at any time.
          </p>

          <h3>8. Your Rights (GDPR Arts. 15–22)</h3>
          <ul>
            <li>Access, rectification, and erasure</li>
            <li>Restriction of processing and objection</li>
            <li>Data portability</li>
            <li>Right to withdraw consent (where processing is based on consent)</li>
            <li>Right to lodge a complaint with your local supervisory authority</li>
          </ul>

          <h3>9. Security</h3>
          <p>
            We implement technical and organizational measures to protect your data. No system is completely secure; we
            encourage you to use strong, unique passwords and safeguard your account.
          </p>

          <h3>10. Cookies and Similar Technologies</h3>
          <p>
            We may use cookies or similar technologies for authentication, preferences, and performance. Where required,
            we will obtain your consent.
          </p>

          <h3>11. Children</h3>
          <p>
            The service is not intended for children under the age required by local law. If we learn that we processed
            data of a child without proper consent, we will take steps to delete such data.
          </p>

          <h3>12. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. If changes are material, we will provide reasonable
            notice where required by law.
          </p>
        </div>
      </main>
    </div>
  )
}


