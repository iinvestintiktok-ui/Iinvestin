import LegalDocumentLayout, { LegalSection } from '../components/LegalDocumentLayout';

export default function TermsOfUsePage() {
  return (
    <LegalDocumentLayout title="Terms of Use" lastUpdated="September 26, 2026">
      <LegalSection title="1. Agreement to these Terms">
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of KWAÏ.bet
          (the &quot;Platform&quot;), operated by KWAÏ.bet (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;). By creating an account, signing in, or using the Platform in any
          way, you agree to be bound by these Terms and our{' '}
          <a href="/privacy-policy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          If you do not agree to these Terms, you must not access or use the Platform.
        </p>
      </LegalSection>

      <LegalSection title="2. What KWAÏ.bet is">
        <p>
          KWAÏ.bet is an entertainment platform that lets users place simulated bets on the
          viral potential of public TikTok videos. You submit a TikTok video link, allocate
          virtual currency called KWAÏ, and the Platform measures view growth over a fixed
          48-hour window to determine a simulated outcome.
        </p>
        <p>
          <span className="text-white font-medium">KWAÏ is not real money.</span> KWAÏ has no
          cash value, cannot be exchanged for fiat currency or cryptocurrency, and does not
          represent a financial instrument, security, or gambling stake under applicable law.
          The Platform is provided for entertainment and skill-based simulation purposes only.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility">
        <p>You may use the Platform only if:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>you are at least 18 years old, or the age of majority in your jurisdiction;</li>
          <li>you are legally permitted to use online entertainment services where you live;</li>
          <li>you are not barred from using the Platform under any applicable law; and</li>
          <li>you provide accurate account information and keep it up to date.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Accounts and sign-in">
        <p>
          You may sign in using email, Google, TikTok, or other methods we make available.
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activity that occurs under your account.
        </p>
        <p>
          When you submit a TikTok link, we may infer or associate a public creator identity
          from that link to display bets, leaderboards, and profiles. You must only submit
          links to public TikTok content that you are permitted to reference.
        </p>
        <p>
          We may suspend or terminate accounts that are fraudulent, abusive, duplicated, or
          used in violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="5. How bets work">
        <p>When you place a bet on the Platform:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>you select a public TikTok video and allocate an amount of KWAÏ;</li>
          <li>we record the video&apos;s view count and the creator&apos;s follower count at the time of the bet;</li>
          <li>after 48 hours, we measure view growth and calculate a simulated return using our published formula;</li>
          <li>results may be positive, negative, or neutral depending on relative performance.</li>
        </ul>
        <p>
          Payout calculations account for view growth relative to the creator&apos;s audience
          size. We may update formulas, thresholds, or display rules to improve fairness,
          prevent abuse, or maintain platform integrity. Material changes will be reflected
          on the Platform or in updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Virtual currency and balances">
        <p>
          KWAÏ balances, bonuses, leaderboard rankings, and contest rewards are virtual and
          for entertainment only unless we explicitly state otherwise in a separate promotion
          with its own rules.
        </p>
        <p>
          We may grant starting balances, promotional credits, or contest prizes at our
          discretion. We may modify, reset, or revoke virtual balances to correct errors,
          address abuse, or maintain the Platform.
        </p>
      </LegalSection>

      <LegalSection title="7. Contests and leaderboards">
        <p>
          We may run sponsored contests, seasonal leaderboards, or promotional events from
          time to time. Each contest may have additional rules, eligibility requirements,
          prize descriptions, and end dates shown on the Platform.
        </p>
        <p>
          Unless expressly stated in writing for a specific promotion, contest prizes are
          promotional and subject to verification, anti-fraud review, and applicable law.
          We reserve the right to disqualify entries obtained through manipulation, bots,
          duplicate accounts, or other unfair conduct.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>use bots, scripts, scrapers, or automated tools to manipulate bets or rankings;</li>
          <li>create multiple accounts to gain an unfair advantage;</li>
          <li>attempt to reverse engineer, disrupt, or overload the Platform;</li>
          <li>harass other users or impersonate any person or entity;</li>
          <li>submit unlawful, infringing, or non-public TikTok content without authorization;</li>
          <li>use the Platform for money laundering, fraud, or any illegal purpose.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Third-party services and content">
        <p>
          The Platform integrates with or displays content from third parties, including
          TikTok, Google, and other authentication or media providers. Your use of those
          services is also governed by their own terms and policies.
        </p>
        <p>
          We do not own TikTok videos, creator names, thumbnails, or trademarks displayed on
          the Platform. Such content remains the property of its respective owners and is
          shown for identification and entertainment purposes.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          The Platform, including its design, branding, software, text, and original
          features, is owned by us or our licensors and is protected by intellectual property
          laws. You receive a limited, non-exclusive, non-transferable license to use the
          Platform for personal, non-commercial entertainment in accordance with these Terms.
        </p>
        <p>
          You may not copy, modify, distribute, sell, or create derivative works from the
          Platform without our prior written consent.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers">
        <p>
          THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
        <p>
          We do not guarantee uninterrupted access, error-free calculations, accurate TikTok
          metrics, or specific entertainment outcomes. View counts and follower data are
          obtained from third-party sources and may be delayed, incomplete, or corrected
          after publication.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES, OFFICERS, EMPLOYEES,
          AND PARTNERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR
          OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE PLATFORM.
        </p>
        <p>
          Our total liability for any claim relating to the Platform will not exceed the
          greater of (a) the amount you paid us, if any, in the twelve months before the
          claim or (b) one hundred U.S. dollars (USD $100).
        </p>
      </LegalSection>

      <LegalSection title="13. Termination">
        <p>
          You may stop using the Platform at any time. We may suspend or terminate your access
          immediately if we believe you violated these Terms, created risk for other users, or
          if required by law.
        </p>
        <p>
          Upon termination, your right to use the Platform ends. Provisions that by their
          nature should survive termination will remain in effect.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to these Terms">
        <p>
          We may update these Terms from time to time. When we do, we will revise the
          &quot;Last updated&quot; date above and, where appropriate, provide additional
          notice on the Platform. Continued use after changes become effective constitutes
          acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law and disputes">
        <p>
          These Terms are governed by the laws applicable in the jurisdiction where KWAÏ.bet
          is operated, without regard to conflict-of-law principles. Any dispute arising from
          these Terms or the Platform will be resolved in the courts of that jurisdiction,
          unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <p>
          If you have questions about these Terms, contact us at{' '}
          <a href="mailto:legal@kwaibet.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            legal@kwaibet.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
