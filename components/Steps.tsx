"use client";

import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "./motion";

const STEPS = [
  {
    num: "01",
    title: "Connect Your Wallet",
    text: "No email, no password. Connect your Phantom wallet and sign a message—you're in, in seconds.",
  },
  {
    num: "02",
    title: "Describe Your Project",
    text: 'Type what you want to build: "A dark-mode Next.js landing page." Just describe it—Talon handles the rest.',
  },
  {
    num: "03",
    title: "Watch It Work",
    text: "Files created, commands run, tests pass—everything live in front of you, in real time.",
  },
  {
    num: "04",
    title: "Ship It",
    text: "Download the finished project, push to GitHub, deploy anywhere. Your code, your call—zero lock-in.",
  },
];

export default function Steps() {
  return (
    <section id="how" className="section">
      <div className="container container-narrow">
        <Reveal>
          <div className="section-head">
            <p className="label">Workflow</p>
            <h2 className="section-title">From idea to production in four steps.</h2>
          </div>
        </Reveal>

        <motion.ol
          className="steps"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {STEPS.map((s) => (
            <motion.li key={s.num} className="step" variants={staggerItem}>
              <motion.span
                className="step-num"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {s.num}
              </motion.span>
              <div className="step-body">
                <h3 className="step-title">{s.title}</h3>
                <p className="step-text">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}