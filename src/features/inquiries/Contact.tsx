export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-8 pt-28 pb-24">
      <h1 className="text-3xl md:text-4xl font-bold text-ink">Contact</h1>
      <p className="mt-4 text-ink/70 leading-7">
        I’m available for commissions, prints, and collaborations. For
        inquiries, feel free to reach out below.
      </p>

      <form className="max-w-xl space-y-6 mt-10">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 bg-white bg-opacity-50 border-b border-accent
                     focus:outline-none focus:border-accentWarm rounded-t-lg"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-white bg-opacity-50 border-b border-accent
                     focus:outline-none focus:border-accentWarm rounded-t-lg"
        />
        <textarea
          placeholder="Message"
          rows={4}
          className="w-full p-3 bg-white bg-opacity-50 border-b border-accent
                     focus:outline-none focus:border-accentWarm rounded-t-lg"
        />
        <button
          type="submit"
          className="px-8 py-3 bg-accent text-primary font-bold hover:bg-accentWarm transition-colors rounded-lg"
        >
          Send Message
        </button>
      </form>

      <div className="mt-10 space-y-2">
        <a
          href="mailto:avidphotography27@gmail.com"
          className="link-minimal block"
        >
          avidphotography27@gmail.com
        </a>
        <a
          href="https://instagram.com/_avid.photography_"
          target="_blank"
          rel="noreferrer"
          className="link-minimal block"
        >
          Instagram
        </a>
      </div>
    </main>
  );
}
