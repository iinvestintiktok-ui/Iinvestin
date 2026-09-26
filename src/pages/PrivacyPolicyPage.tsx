import LegalDocumentLayout, { LegalSection } from '../components/LegalDocumentLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy" lastUpdated="September 26, 2026">
      <LegalSection title="1. Introduction">
        <p>
          This Privacy Policy explains how KWAÏ.bet (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) collects, uses, shares, and protects information when you use our
          website, applications, and related services (collectively, the &quot;Platform&quot;).
        </p>
        <p>
          By signing in or using the Platform, you acknowledge that you have read this Privacy
          Policy and our{' '}
          <a href="/terms-of-use" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Terms of Use
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We may collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-gray-300">Account information:</span> email address,
            authentication provider identifiers, display name, and profile image when you sign
            in with Google, TikTok, email, or other supported methods.
          </li>
          <li>
            <span className="text-gray-300">Betting activity:</span> TikTok video URLs you
            submit, timestamps, virtual KWAÏ amounts, calculated outcomes, leaderboard
            rankings, and related gameplay metadata.
          </li>
          <li>
            <span className="text-gray-300">Public TikTok metadata:</span> video titles,
            thumbnails, creator handles, view counts, follower counts, and other public data
            associated with links you provide.
          </li>
          <li>
            <span className="text-gray-300">Technical data:</span> IP address, browser type,
            device information, operating system, pages viewed, referral URLs, and diagnostic
            logs.
          </li>
          <li>
            <span className="text-gray-300">Communications:</span> messages you send to
            support and records of our responses.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <p>We use information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>create and manage your account;</li>
          <li>process bets, calculate 48-hour outcomes, and display results;</li>
          <li>operate leaderboards, profiles, contests, and promotional features;</li>
          <li>prevent fraud, abuse, and unauthorized access;</li>
          <li>improve performance, reliability, and user experience;</li>
          <li>communicate with you about the Platform, security, and policy updates;</li>
          <li>comply with legal obligations and enforce our Terms.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal bases for processing">
        <p>
          Where required by applicable law, including the GDPR, we process personal data on
          the following bases:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-gray-300">Contract:</span> to provide the Platform and
            features you request.
          </li>
          <li>
            <span className="text-gray-300">Legitimate interests:</span> to secure the
            Platform, prevent abuse, analyze usage, and improve our services.
          </li>
          <li>
            <span className="text-gray-300">Consent:</span> where you choose optional
            features or marketing communications, when applicable.
          </li>
          <li>
            <span className="text-gray-300">Legal obligation:</span> where we must retain or
            disclose information to comply with law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. How we share information">
        <p>We may share information with:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-gray-300">Authentication providers</span> such as Google
            and TikTok when you choose to sign in through them.
          </li>
          <li>
            <span className="text-gray-300">Infrastructure and analytics providers</span>
            that help us host, monitor, and improve the Platform.
          </li>
          <li>
            <span className="text-gray-300">Contest sponsors or partners</span> when you
            participate in a promotion governed by separate rules.
          </li>
          <li>
            <span className="text-gray-300">Authorities or advisers</span> when required by
            law, court order, or to protect rights, safety, and security.
          </li>
          <li>
            <span className="text-gray-300">Successors</span> in connection with a merger,
            acquisition, or asset sale, subject to this Privacy Policy.
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="6. Public and social features">
        <p>
          Certain activity on KWAÏ.bet is public by design. Bets, usernames, rankings,
          creator associations, and performance statistics may be visible to other users on
          leaderboards, feeds, and profile pages.
        </p>
        <p>
          Do not submit information through the Platform that you do not want displayed
          publicly in connection with your activity.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies and similar technologies">
        <p>
          We use cookies, local storage, and similar technologies to keep you signed in,
          remember preferences, measure usage, and protect against abuse.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling some cookies may
          limit certain Platform features, including authentication.
        </p>
      </LegalSection>

      <LegalSection title="8. Data retention">
        <p>
          We retain information for as long as needed to provide the Platform, comply with
          legal obligations, resolve disputes, and enforce our agreements.
        </p>
        <p>
          When information is no longer required, we delete or anonymize it unless a longer
          retention period is required or permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use administrative, technical, and organizational measures designed to protect
          information against unauthorized access, loss, misuse, or alteration. No method of
          transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          We may process and store information in countries other than where you live. When
          we transfer personal data internationally, we use appropriate safeguards where
          required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. Your rights and choices">
        <p>
          Depending on your location, you may have rights to access, correct, delete, restrict,
          or object to certain processing of your personal data, and to receive a portable
          copy of information you provided.
        </p>
        <p>
          You may also withdraw consent where processing is based on consent, without
          affecting the lawfulness of processing before withdrawal.
        </p>
        <p>
          To exercise your rights, contact us at{' '}
          <a href="mailto:privacy@kwaibet.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            privacy@kwaibet.com
          </a>
          . We may need to verify your identity before responding. If you are in the European
          Economic Area or United Kingdom, you may also lodge a complaint with your local data
          protection authority.
        </p>
      </LegalSection>

      <LegalSection title="12. Children">
        <p>
          The Platform is not intended for anyone under 18 years of age. We do not knowingly
          collect personal information from children. If you believe a child has provided us
          personal information, contact us and we will take appropriate steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="13. Third-party links and services">
        <p>
          The Platform may link to or display content from third-party websites and services,
          including TikTok. Their privacy practices are governed by their own policies, not
          this one.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to this Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          &quot;Last updated&quot; date above and, where appropriate, provide additional
          notice on the Platform. Continued use after changes become effective means you
          accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>
          For privacy questions or requests, contact us at{' '}
          <a href="mailto:privacy@kwaibet.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            privacy@kwaibet.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
