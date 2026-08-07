"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "./motion";

const MILESTONES = [
  {
    num: "01",
    title: "Launch",
    text: "Frank goes live. Wallet auth, BYOK chat, and real sandbox execution—free from day one.",
  },
  {
    num: "02",
    title: "Grow & strengthen",
    text: "More tools, multi-provider models, and checkpoints—continuous updates as the agent loop matures.",
  },
  {
    num: "03",
    title: "Built for everyone",
    text: "Specialized tooling for Solana and crypto auditing—not just a generic coding agent.",
  },
  {
    num: "04",
    title: "Full ecosystem",
    text: "Team sessions, live preview, and a marketplace of skills. Frank becomes the default agent for builders.",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <p className="label">Roadmap</p>
            <h2 className="section-title">Where Frank is headed.</h2>
            <p className="section-sub">
              From launch to the full ecosystem—here&apos;s what&apos;s next.
            </p>
          </div>
        </Reveal>

        <div className="roadmap-grid">
          <motion.ol
            className="roadmap-list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {MILESTONES.map((m) => (
              <motion.li
                key={m.num}
                className="roadmap-item"
                variants={staggerItem}
              >
                <span className="roadmap-num">{m.num}</span>
                <div className="roadmap-body">
                  <h3 className="roadmap-title">{m.title}</h3>
                  <p className="roadmap-text">{m.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>

          <Reveal className="roadmap-viz" delay={0.2}>
            <Image
              src="/illustrations/telescope-vision.webp"
              alt=""
              width={1536}
              height={1024}
              sizes="(max-width: 1024px) 100vw, 440px"
              style={{ width: "100%", height: "auto" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
