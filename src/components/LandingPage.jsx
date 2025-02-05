export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary text-light">
      <main className="max-w-6xl mx-auto px-6 pt-36 pb-20">
        <section className="text-center mb-28">
          <h2 className="text-6xl font-bold mb-6 text-accent">Capture Your Moments</h2>
          <p className="text-slate text-xl mb-8">Professional photography services for unforgettable memories</p>
        </section>

        <section className="mb-28">
          <h3 className="text-3xl font-bold mb-8 text-accent">About Us</h3>
          <p className="text-slate max-w-2xl text-lg">
            We specialize in capturing life's precious moments with artistic vision and technical excellence. 
            Our team of professional photographers delivers stunning imagery for weddings, events, and commercial projects.
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold mb-8 text-accent">Get in Touch</h3>
          <form className="max-w-xl mx-auto space-y-6">
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full p-3 bg-white bg-opacity-50 border-b border-accent focus:outline-none focus:border-accentWarm rounded-t-lg"
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 bg-white bg-opacity-50 border-b border-accent focus:outline-none focus:border-accentWarm rounded-t-lg"
            />
            <textarea 
              placeholder="Message" 
              rows="4"
              className="w-full p-3 bg-white bg-opacity-50 border-b border-accent focus:outline-none focus:border-accentWarm rounded-t-lg"
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