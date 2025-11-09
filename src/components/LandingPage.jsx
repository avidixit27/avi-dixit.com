export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary text-light">
      <main className="max-w-6xl mx-auto px-6 pt-36 pb-20">
        {/* Hero */}
        <section className="text-center mb-28">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-ink">
            Capture Your Moments
          </h2>
          <p className="mt-4 text-[18px] md:text-[20px] text-ink/60">
            Professional photography services for unforgettable memories
          </p>
        </section>

        {/* About */}
        <section className="mb-28">
          <h3 className="text-2xl md:text-3xl font-bold text-ink">About Us</h3>
          <p className="mt-4 text-[15px] md:text-[16px] leading-7 text-ink/70 max-w-2xl">
            We specialize in capturing life&apos;s precious moments with artistic vision
            and technical excellence. Our team of professional photographers delivers
            stunning imagery for weddings, events, and commercial projects.
          </p>
        </section>

        {/* Contact — keep your semi-transparent boxed inputs */}
        <section>
          <h3 className="text-2xl md:text-3xl font-bold text-ink">Get in Touch</h3>
          <form className="max-w-xl mx-auto space-y-6 mt-6">
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
              rows="4"
              className="w-full p-3 bg-white bg-opacity-50 border-b border-accent
                         focus:outline-none focus:border-accentWarm rounded-t-lg"
            ></textarea>
            <button className="px-8 py-3 bg-accent text-primary font-bold hover:bg-accentWarm transition-colors rounded-lg">
              Send Message
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
