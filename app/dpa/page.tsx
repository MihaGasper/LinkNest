import Link from 'next/link'

export const metadata = {
  title: 'Data Processing Addendum (DPA) - LinkNest',
  description: 'LinkNest Data Processing Addendum (EU/GDPR compliant)'
}

export default function DpaPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">LinkNest</h1>
          <Link href="/" className="px-3 py-1.5 rounded border border-white/30 hover:bg-white hover:text-black transition">Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Data Processing Addendum (DPA)</h2>
        <p className="text-black/70 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

        <div className="prose prose-neutral max-w-none">
          <h3>1. Parties and Scope</h3>
          <p>
            This DPA forms part of the Terms of Service between LinkNest (the “Processor”) and the customer (the
            “Controller”) and governs the processing of personal data subject to Regulation (EU) 2016/679 (GDPR) and, where
            applicable, the UK GDPR.
          </p>

          <h3>2. Roles</h3>
          <p>
            Controller determines the purposes and means of processing. Processor processes personal data on behalf of the
            Controller strictly in accordance with the Controller’s documented instructions, the Terms, and this DPA.
          </p>

          <h3>3. Nature and Purpose</h3>
          <p>
            Processor provides link bookmarking, organization, and AI-powered features. Processing includes collection,
            storage, organization, and retrieval of personal data to provide and improve the service.
          </p>

          <h3>4. Categories of Data Subjects and Data</h3>
          <ul>
            <li>Data subjects: end users of the Controller</li>
            <li>Personal data: account identifiers (e.g., email, user ID), usage metadata, saved content metadata
              (e.g., link titles/tags), and technical logs necessary to provide the service</li>
            <li>Special categories: not intended to be processed. Controller shall not submit special-category data.</li>
          </ul>

          <h3>5. Sub-processors</h3>
          <p>
            Processor uses sub-processors to provide hosting, authentication, and AI capabilities (e.g., Supabase, OpenAI).
            A current list is available in the Privacy Policy. Processor shall impose GDPR-compliant obligations on
            sub-processors and remains responsible for their performance.
          </p>

          <h3>6. International Transfers</h3>
          <p>
            Where personal data is transferred outside the EEA/UK, Processor implements appropriate safeguards such as
            Standard Contractual Clauses (SCCs) or relies on adequacy decisions, as applicable.
          </p>

          <h3>7. Security Measures</h3>
          <p>
            Processor implements technical and organizational measures appropriate to the risk, including access controls,
            encryption in transit where applicable, audit logging, and separation of environments.
          </p>

          <h3>8. Confidentiality</h3>
          <p>
            Processor ensures persons authorized to process personal data are subject to confidentiality obligations and
            receive appropriate data protection training.
          </p>

          <h3>9. Data Subject Rights Assistance</h3>
          <p>
            Taking into account the nature of processing, Processor assists Controller by appropriate technical and
            organizational measures, insofar as possible, to respond to requests to exercise data subject rights under
            GDPR (Arts. 15–22).
          </p>

          <h3>10. Personal Data Breach</h3>
          <p>
            Processor will notify Controller without undue delay upon becoming aware of a personal data breach and provide
            information reasonably required for Controller’s compliance obligations.
          </p>

          <h3>11. Assistance with DPIAs and Prior Consultation</h3>
          <p>
            Processor shall assist Controller with data protection impact assessments and prior consultations with
            supervisory authorities where required by law.
          </p>

          <h3>12. Deletion or Return of Data</h3>
          <p>
            Upon termination of the services, Processor will, at Controller’s choice and subject to applicable law, delete
            or return personal data and delete existing copies unless storage is required by law.
          </p>

          <h3>13. Audits</h3>
          <p>
            Processor shall make available to Controller information necessary to demonstrate compliance with this DPA and
            allow for and contribute to audits conducted by Controller or an independent auditor mandated by Controller,
            subject to reasonable notice, frequency, and confidentiality obligations.
          </p>

          <h3>14. Liability</h3>
          <p>
            Liability shall be determined in accordance with the Terms and applicable law. Nothing in this DPA limits or
            excludes liability where such limitation or exclusion is prohibited by law.
          </p>

          <h3>15. Conflict</h3>
          <p>
            In case of conflict between this DPA and the Terms, this DPA shall prevail with respect to processing of
            personal data.
          </p>
        </div>
      </main>
    </div>
  )
}


