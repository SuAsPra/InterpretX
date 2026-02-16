import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <main className="min-h-screen px-6 py-12 md:px-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <section>
          <p className="badge-theme mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
            Narrative Portfolio
          </p>
          <h1 className="text-main text-4xl font-bold leading-tight md:text-5xl">
            Turn achievements into a story
          </h1>
          <p className="text-muted mt-4 max-w-xl">
            Build a connected dashboard of achievements, visualize your growth, and generate a compelling professional narrative.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/auth"
              className="btn-primary px-6 py-3 text-sm"
            >
              Get Started
            </Link>
            <Link
              to="/achievements"
              className="btn-outline px-6 py-3 text-sm"
            >
              Explore Achievements
            </Link>
            <Link to="/dashboard" className="btn-secondary px-6 py-3 text-sm">
              View App
            </Link>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-3xl p-6 backdrop-blur"
        >
          <h2 className="text-main mb-4 text-lg font-semibold">Connected Growth Graph</h2>
          <div className="bg-surface relative h-72 rounded-2xl">
            <div className="absolute left-8 top-10 h-14 w-14 rounded-full bg-primary" />
            <div className="absolute left-36 top-20 h-16 w-16 rounded-full bg-accent" />
            <div className="absolute left-64 top-12 h-14 w-14 rounded-full bg-primary" />
            <div className="absolute left-24 top-36 h-16 w-16 rounded-full bg-accent" />
            <div className="absolute left-52 top-44 h-14 w-14 rounded-full bg-primary" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 350 260" fill="none">
              <path d="M56 50C90 78 110 90 150 104" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M164 112C200 90 230 80 270 62" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M150 120C130 150 120 158 102 184" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M183 140C202 168 216 176 248 188" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default LandingPage;
