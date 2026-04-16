import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - SealChat",
  description: "How SealChat handles your data, what we collect, and what we don't.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen font-sans px-6 py-24">
      <article className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-4">
          <Link href="/" className="text-sm text-muted-foreground underline underline-offset-2">
            Back to home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: April 16, 2026
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">The short version</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            SealChat is built on a simple idea: your data belongs to you. We
            don't sell it. We don't share it with advertisers. We don't use it
            to train models or build profiles for third parties. Our revenue
            comes from your subscription fee, not your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What we collect</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            When you create an account on SealChat, we collect the minimum
            information needed to provide the service:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
            <li>Your name and email address</li>
            <li>Profile information you choose to share (bio, location, profile photo)</li>
            <li>Content you post, share, or upload to SealChat</li>
            <li>Your friends list and connection activity</li>
            <li>Basic usage data (login timestamps, device type) for security purposes</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What we don't collect</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We do not collect or store any data related to your identity
            verification. That process is handled entirely by{" "}
            <Link
              href="https://withpersona.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Persona
            </Link>
            , a third-party identity verification provider. Your government ID,
            selfie, and biometric data are processed and stored by Persona under
            their own{" "}
            <Link
              href="https://withpersona.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              privacy policy
            </Link>
            . This information never touches SealChat's servers. We made this
            choice intentionally to minimize risk and protect your most
            sensitive documents.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">How we use your data</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Your data is used solely to provide the SealChat service:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
            <li>Displaying your profile and posts to your connections</li>
            <li>Delivering notifications about activity relevant to you</li>
            <li>Processing your subscription payment</li>
            <li>Maintaining the security and integrity of the platform</li>
          </ul>
          <p className="text-base leading-relaxed text-muted-foreground">
            We do not use your data for advertising, behavioral profiling,
            algorithmic content ranking, or any purpose other than running the
            service you signed up for.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Data sharing</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We do not sell, rent, or share your personal data with third parties.
            The only exception is Persona for identity verification, as described
            above, and any payment processor used to handle your subscription.
            In both cases, these services receive only the data strictly necessary
            to perform their function.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Encryption and security</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            All sensitive data is encrypted at rest and in transit. Public-facing
            content (your display name, public posts) remains unencrypted so it
            can be searched and displayed to your connections. When we introduce
            direct messaging, those conversations will use end-to-end encryption,
            which means no one, including us, will be able to read them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Your rights</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            You can download all of your data at any time from your account
            settings. You can delete your account permanently whenever you
            choose. When you delete your account, your data is removed from
            our servers. There are no retention tricks, no waiting periods,
            and no hoops to jump through.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Waitlist (pre-launch)</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            If you sign up for our alpha waitlist, we collect only your email
            address. We use it exclusively to send you an invite when a spot
            opens up. We will never sell your email or send unsolicited
            marketing. You can request removal from the waitlist at any time by
            emailing{" "}
            <Link
              href="mailto:support@wagleus.com"
              className="underline underline-offset-2"
            >
              support@wagleus.com
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Questions about this policy or how your data is handled? Reach out
            to us at{" "}
            <Link
              href="mailto:support@wagleus.com"
              className="underline underline-offset-2"
            >
              support@wagleus.com
            </Link>
            .
          </p>
        </section>

        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SealChat by{" "}
            <Link
              href="https://www.wagleus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Wagle Universal Solutions
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
