"use client";

import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "./motion";

const FEATURES = [
  {
    title: "Real Code Execution",
    text: "Talon writes code and runs it in a secure sandbox. Live output, real results—and the finished project ready to download.",
  },
  {
    title: "Any LLM Model",
    text: "Use your own Claude API key. No subscriptions, no metered tiers—just transparent token costs you fully control.",
  },
  {
    title: "Fully Isolated",
    text: "Every session runs in its own microVM. No shared filesystems, no cross-user access. Your code stays yours.",
  },
  {
    title: "Live Chat Interface",
    text: "Direct, real-time chat. Watch commands execute, files change, and tests pass—exactly as they happen.",
  },
  {
    title: "Full Terminal Access",
    text: "npm, git, bash—anything you'd run locally. Build, test, lint, and deploy straight from the conversation.",
  },
  {
    title: "Download Projects",
    text: "Export your project as .tar.gz and take it anywhere. Local dev, production, or your team's repo—zero lock-in.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function Molecule() {
  const lineGroups = [
    "M90 150 190 70 M90 150 255 160 M90 150 125 265 M190 70 300 35 M190 70 330 115 M330 115 255 160 M255 160 295 255 M125 265 65 330 M125 265 195 335 M65 330 75 445 M195 335 295 255 M195 335 325 365 M295 255 360 205 M360 205 325 365 M325 365 255 430 M325 365 150 405 M150 405 255 430 M150 405 75 445",
    "M340 115 365 90 M340 115 355 140 M90 150 70 120 M90 150 115 110 M325 365 350 340 M325 365 350 385 M125 265 145 300 M125 265 95 285",
  ];
  return (
    <svg className="mol-svg" viewBox="0 0 420 480" xmlns="http://www.w3.org/2000/svg">
      <motion.g
        className="mol-line"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {lineGroups[0].split(" M").map((d, i) => (
          <motion.path
            key={i}
            d={"M" + d}
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } } }}
          />
        ))}
      </motion.g>
      <motion.g
        className="mol-line mol-line--bright"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {lineGroups[1].split(" M").map((d, i) => (
          <motion.path
            key={i}
            d={"M" + d}
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1.1, ease: "easeOut" } } }}
          />
        ))}
      </motion.g>
      <motion.circle
        className="mol-node mol-node--ring"
        cx="330" cy="115" r="14"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ transformOrigin: "330px 115px" }}
      />
      <motion.circle
        className="mol-node mol-node--ring"
        cx="195" cy="335" r="8"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ transformOrigin: "195px 335px" }}
      />
      <motion.circle
        className="mol-node mol-node--ring"
        cx="75" cy="445" r="7"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.7 }}
        style={{ transformOrigin: "75px 445px" }}
      />
      <motion.circle
        className="mol-node mol-node--accent"
        cx="125" cy="265" r="12"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
        style={{ transformOrigin: "125px 265px" }}
      />
      {[
        [90, 150, 10], [190, 70, 6], [255, 160, 7], [295, 255, 6], [325, 365, 9], [65, 330, 5], [150, 405, 4],
      ].map(([cx, cy, r], i) => (
        <motion.circle
          key={`n${i}`}
          className="mol-node"
          cx={cx} cy={cy} r={r}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.35 + i * 0.06 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      {[
        [300, 35, 4], [360, 205, 5], [255, 430, 6], [70, 120, 2], [115, 110, 2], [365, 90, 2], [355, 140, 2], [350, 340, 2], [350, 385, 2], [145, 300, 2], [95, 285, 2],
      ].map(([cx, cy, r], i) => (
        <circle key={`d${i}`} className="mol-node mol-node--dim" cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <p className="label">Capabilities</p>
            <h2 className="section-title">Built for real development.</h2>
            <p className="section-sub">
              Not a chatbot. A full coding agent that writes, runs, and ships
              real software inside an isolated environment—live, on your own
              key.
            </p>
          </div>
        </Reveal>

        <div className="explore-grid">
          <motion.div
            className="explore-features"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {FEATURES.map((f) => (
              <motion.article key={f.title} className="feature-row" variants={staggerItem}>
                <motion.button
                  className="arrow-btn"
                  aria-label="Learn more"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <ArrowIcon />
                </motion.button>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </motion.article>
            ))}
          </motion.div>

          <Reveal className="explore-viz" delay={0.2}>
            <Molecule />
          </Reveal>
        </div>
      </div>
    </section>
  );
}