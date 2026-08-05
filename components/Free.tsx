"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, DownloadCloud, Infinity as InfinityIcon, KeyRound } from "lucide-react";
import { Reveal, staggerContainer, staggerItem } from "./motion";
import GetStartedButton from "./GetStartedButton";

const PERKS = [
  {
    icon: KeyRound,
    title: "BYOK",
    text: "Your key, your cost. Pricing stays transparent and fully under your control.",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited",
    text: "Unlimited sessions and projects, forever. Download and keep everything you build.",
  },
  {
    icon: DownloadCloud,
    title: "Yours to keep",
    text: "No subscription, no lock-in. You only pay for the API tokens your sessions actually use.",
  },
];

export default function Free() {
  return (
    <section id="free" className="section">
      <div className="container container-narrow">
        <Reveal>
          <div className="section-head">
            <p className="label">Free forever</p>
            <h2 className="section-title">
              Talon is free. Own everything you build.
            </h2>
            <p className="section-sub">
              No subscriptions, no metered plans. Bring your own Claude key
              and pay only for the tokens you use—nothing else, ever.
            </p>
          </div>
        </Reveal>

        <motion.div
          className="free-billboard"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div className="free-billboard-top" variants={staggerItem}>
            <p className="free-hero-num">$0</p>
            <p className="free-hero-note">
              The only number that matters. Pay for the tokens you use—and
              nothing else, ever.
            </p>
          </motion.div>

          <div className="free-divider" />

          <div className="free-grid">
            {PERKS.map((p) => (
              <motion.article
                key={p.title}
                className="free-card"
                variants={staggerItem}
              >
                <span className="free-icon">
                  <p.icon />
                </span>
                <h3 className="free-title">{p.title}</h3>
                <p className="free-text">{p.text}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <div className="free-cta">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <GetStartedButton className="btn-aurora">
              Get Started Free
              <ArrowUpRight />
            </GetStartedButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}