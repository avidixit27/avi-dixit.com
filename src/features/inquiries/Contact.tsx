import { SITE_DETAILS } from "../../resources/site";

export default function Contact() {
  return (
    <main className="reading-container pt-32 pb-20 sm:pt-36 sm:pb-24">
      <p className="text-sm font-semibold tracking-[0.18em] text-brand-warm uppercase">
        Inquiries
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-5xl">
        Contact
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
        I’m available for commissions, prints, and collaborations. For
        inquiries, feel free to reach out below.
      </p>

      <form className="mt-10 max-w-xl space-y-6">
        <label className="sr-only" htmlFor="contact-name">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Name"
          className="w-full rounded-control border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted
                     transition-colors hover:border-border-strong focus:border-focus focus:outline-none"
        />
        <label className="sr-only" htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-control border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted
                     transition-colors hover:border-border-strong focus:border-focus focus:outline-none"
        />
        <label className="sr-only" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Message"
          rows={4}
          className="w-full resize-y rounded-control border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted
                     transition-colors hover:border-border-strong focus:border-focus focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-control bg-brand-warm px-8 py-3 font-semibold text-canvas transition-colors hover:bg-focus"
        >
          Send Message
        </button>
      </form>

      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-text-muted sm:flex-row sm:gap-8">
        <a
          href={`mailto:${SITE_DETAILS.email}`}
          className="rounded-sm transition-colors hover:text-brand-warm"
        >
          {SITE_DETAILS.email}
        </a>
        <a
          href={SITE_DETAILS.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm transition-colors hover:text-brand-vivid"
        >
          Instagram
        </a>
      </div>
    </main>
  );
}
