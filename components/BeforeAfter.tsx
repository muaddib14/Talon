"use client";

import { motion } from "framer-motion";
import { Reveal } from "./motion";

const TOOLS = ["Claude", "GPT", "Gemini", "Llama", "DeepSeek"];

export default function BeforeAfter() {
  return (
    <section className="section">
      <div className="container container-narrow">
        <Reveal>
          <div className="section-head">
            <p className="label">Before / after</p>
            <h2 className="section-title">
              From five accounts and five bills to one Talon key.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="ba-panel">
            <div className="ba-before">
              <div className="ba-before-icons">
                {TOOLS.map((t) => (
                  <span key={t} className="ba-before-icon">
                    {t[0]}
                  </span>
                ))}
              </div>
              <div className="ba-tags">
                <span className="ba-tag">5 accounts</span>
                <span className="ba-tag">5 bills</span>
              </div>
            </div>

            <motion.div
              className="ba-arrow"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 60 24" fill="none">
                <path
                  d="M2 12h50m0 0-10-9m10 9-10 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <div className="ba-after">
              <span className="ba-after-badge">Up to 90% cheaper</span>
              <div className="ba-after-card">
                <span className="ba-after-logo">Talon</span>
                <p className="ba-after-title">One key. Every AI model.</p>
                <p className="ba-after-sub">
                  Claude, GPT, Gemini, Llama &amp; more
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
