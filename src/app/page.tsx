import { NewsletterForm } from "@/components/NewsletterForm";
import Image from "next/image";
import Link from "next/link";
import { RiShieldCheckLine, RiLockLine, RiUserFollowLine, RiEyeOffLine } from "react-icons/ri";

export const metadata = {
  title: "SealChat - Social media, the way it should be",
  description:
    "A secured, KYC-verified communication platform where every person is real and your data stays yours.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen font-sans">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center px-6 pt-32 pb-24">
        <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
          Secured Communication Platform
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-center text-foreground font-mono">
          SealChat
        </h1>
        <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-muted-foreground">
          Social media was supposed to bring us closer. Somewhere along the way,
          it stopped being about people. We're building a place that puts that right.
        </p>
        <div className="mt-10">
          <NewsletterForm />
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="px-6 py-24 bg-muted">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Something broke along the way.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Open any social app today. Half the accounts are fake. AI-generated
            posts flood your timeline. The algorithm decides what you see, and it
            optimizes for outrage, not connection. Meanwhile, the company behind
            it tracks every tap, every scroll, and sells that portrait of you to
            the highest bidder.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            You didn't sign up for that. Nobody did. The promise was simple:
            stay in touch with the people you care about. That promise got buried
            under ads, bots, and engagement tricks.
          </p>
        </div>
      </section>

      {/* ── How We Fix It ── */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-16">
            How SealChat is different.
          </h2>

          <div className="space-y-16">

            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <RiShieldCheckLine className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Every person is verified.
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We use{" "}
                  <Link
                    href="https://withpersona.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Persona
                  </Link>
                  , a trusted third-party identity verification service used by
                  companies like Square and Coursera, for KYC verification. Every
                  user proves they are who they say they are before they can send
                  a single message. Businesses on SealChat are officially registered
                  entities, not faceless accounts. Scammers don't get through the door.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <RiLockLine className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Your data stays with you.
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We will never sell your data to advertisers, data brokers, or
                  anyone else. Period. You own your information. You control who
                  sees it. Identity verification is handled entirely by Persona.
                  We don't store or access your government ID, selfie, or biometric
                  data. It never touches our servers.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <RiEyeOffLine className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  No algorithm deciding for you.
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Your feed shows posts from people you follow, in the order
                  they were shared. That's it. No engagement tricks, no
                  recommended rage-bait, no endless scroll designed to steal
                  your afternoon. You open the app, see what your people
                  are up to, and get on with your day.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <RiUserFollowLine className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  A small fee keeps it honest.
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Free platforms need to make money somehow, and the answer is
                  always your attention and your data. SealChat charges a small
                  monthly fee. That fee pays for servers, security, and the
                  identity verification process. It also means every user has
                  skin in the game, which keeps the community serious and accountable.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-24 bg-muted">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-base text-muted-foreground mb-12">
            No hidden fees. No upsells. What you pay goes directly toward
            running secure infrastructure and verifying real identities.
            Pricing may adjust as we finalize deployment costs.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-border rounded-xl p-8 bg-background space-y-4">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Individual</p>
              <p className="text-4xl font-bold text-foreground">$5<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>KYC-verified identity</li>
                <li>1 GB storage included</li>
                <li>Chronological feed, no ads</li>
                <li>Full data control and export</li>
              </ul>
            </div>

            <div className="border border-border rounded-xl p-8 bg-background space-y-4">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Family</p>
              <p className="text-4xl font-bold text-foreground">$15<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Up to 5 verified members</li>
                <li>1 GB storage per member</li>
                <li>All individual features included</li>
                <li>Managed from a single account</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Need more space? Upgrade to 100 GB of storage for $10/year.
          </p>
        </div>
      </section>

      {/* ── Early Look ── */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            A look at what we're building.
          </h2>
          <p className="text-base text-muted-foreground mb-12">
            These are screenshots from our early development build. The design
            is a work in progress and everything you see here will change before
            launch. What matters right now is the foundation: a clean feed, real
            profiles, and simple friend management.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/images/preview-feed.png"
                  alt="SealChat feed showing chronological posts from friends"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">Your feed. Posts from friends, in order.</p>
            </div>
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/images/preview-profile.png"
                  alt="SealChat user profile page"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">Profile pages with privacy controls.</p>
            </div>
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/images/preview-friends.png"
                  alt="SealChat friends management page"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">Friends list and requests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Vision ── */}
      <section className="px-6 py-24 bg-muted">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Built to feel like home.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We started SealChat because we missed what social media used to be.
            A place to share photos with family. To catch up with old friends. To
            talk to a small circle of people who actually matter to you, without
            wondering if any of them are bots.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            That's the whole idea. A clean, quiet space for real people. Not a
            megaphone for influencers. Not a surveillance tool for corporations.
            Just a place where you can be yourself with the people you trust.
          </p>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-12">
            Who's building this.
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Image
                src="/images/founder.jpg"
                alt="Anish Wagle, Founder of SealChat"
                width={120}
                height={120}
                className="rounded-full object-cover w-28 h-28"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Anish Wagle</h3>
                <p className="text-sm text-muted-foreground">Founder and CEO</p>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">
                I'm a computer engineer who spent six years in the corporate
                world before returning to my hometown in Nepal. I now split
                my time between software engineering and running an automated
                farm called{" "}
                <Link
                  href="https://www.prayogsala.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Prayogsala
                </Link>
                . SealChat is built by{" "}
                <Link
                  href="https://www.wagleus.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Wagle Universal Solutions
                </Link>
                , the company I founded to work on projects that matter to me
                and the people around me.
              </p>
              <p className="text-sm text-muted-foreground">
                You can follow the development journey on my{" "}
                <Link
                  href="https://www.youtube.com/@AnishWagle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  YouTube channel
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-24 bg-muted">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-12">
            Common questions.
          </h2>
          <div className="space-y-10">

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                How much does SealChat cost?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                $5 per month for individuals. $15 per month for a family of up
                to five. You can add 100 GB of storage for $10 per year. These
                prices may adjust slightly once we finalize our infrastructure
                costs, but we're committed to keeping SealChat affordable.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                What data does KYC verification collect?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Identity verification is handled by{" "}
                <Link
                  href="https://withpersona.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Persona
                </Link>
                , a third-party service. They may ask for a government-issued ID
                and a selfie for a liveness check. SealChat does not collect,
                store, or have access to this information. It stays with Persona
                and is subject to their{" "}
                <Link
                  href="https://withpersona.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  privacy policy
                </Link>
                . We made this decision deliberately: we don't want the
                liability of holding your most sensitive documents.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Can I delete my account?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Yes. You can download all of your data at any time and delete
                your account permanently. No questions, no retention period, no
                dark patterns to make you stay. Your data is yours.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Is my data encrypted?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                All sensitive information is encrypted at rest and in transit.
                Because SealChat is a social platform, some information (like
                your display name and public posts) needs to remain searchable
                and visible to your connections. When we launch direct messaging,
                those conversations will be end-to-end encrypted, meaning not
                even we can read them.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                When does the alpha launch?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                We don't have an exact date yet. We're focused on getting the
                core experience right before opening the doors. Once we're
                ready, everyone on the waitlist will receive a personal invite
                link via email.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            We're building this carefully.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground max-w-md">
            SealChat is in early development. We're inviting people in small
            batches to make sure we get the foundation right. Drop your email
            below if you'd like to be part of the alpha.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            <Link
              href="mailto:support@wagleus.com"
              className="underline underline-offset-2"
            >
              support@wagleus.com
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
