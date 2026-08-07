"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { EASE, Reveal, staggerContainer, staggerItem } from "./motion";

const FAQS = [
  {
    q: "Is my code private?",
    a: "Yes. Every session runs in its own isolated microVM—no shared filesystems, no cross-user access. Your code never leaves your session.",
  },
  {
    q: "What if the agent fails mid-project?",
    a: "No problem. Session history is auto-saved, so you can continue where it stopped, rewind to an earlier checkpoint, or inspect the logs and fix it yourself.",
  },
  {
    q: "Does this replace developers?",
    a: "No—it's a force multiplier. Frank handles the repetitive work: scaffolding, boilerplate, and glue code. You review, you decide, you stay in control of everything.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div className={`faq-card${open ? " is-open" : ""}`} variants={staggerItem}>
      <button
        className="faq-q"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {q}
        <motion.span
          className="faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          aria-hidden="true"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="section">
      <div className="container">
        <div className="faq-wrap">
          <div className="faq-side">
            <Reveal>
              <p className="label">FAQ</p>
              <h2 className="faq-title">Questions, answered.</h2>
              <p className="faq-intro">
                Everything you need to know before you start building with
                Frank.
              </p>
            </Reveal>
          </div>

          <motion.div
            className="faq-list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}