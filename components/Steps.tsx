"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "./motion";

const MODEL_PILLS = [
  { name: "Claude", cls: "pill--claude" },
  { name: "GPT-4o", cls: "pill--gpt" },
  { name: "Gemini", cls: "pill--gemini" },
  { name: "Llama", cls: "pill--llama" },
  { name: "DeepSeek", cls: "pill--deepseek" },
];

export default function Steps() {
  return (
    <section id="how" className="section">
      <div className="container container-narrow">
        <Reveal>
          <div className="section-head">
            <p className="label">How it works</p>
            <h2 className="section-title">One key. Every model.</h2>
            <p className="section-sub">
              Plug it into any tool, chat right here, and pay in crypto—for
              far less than each provider.
            </p>
          </div>
        </Reveal>

        <motion.div
          className="how-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Card 1 — real illustration */}
          <motion.div className="how-card how-card--wide" variants={staggerItem}>
            <div className="how-card-media">
              <Image
                src="/illustrations/one-key-every-model.webp"
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="how-card-body">
              <h3 className="how-card-title">One key, every model</h3>
              <p className="how-card-text">
                Grab a single Talon key and instantly unlock Claude, GPT,
                Gemini and more.
              </p>
            </div>
          </motion.div>

          {/* Card 2 — CSS arc / ripple */}
          <motion.div className="how-card" variants={staggerItem}>
            <div className="how-card-media how-card-media--flat">
              <div className="how-arc">
                <span className="how-arc-ring how-arc-ring--1" />
                <span className="how-arc-ring how-arc-ring--2" />
                <span className="how-arc-ring how-arc-ring--3" />
                <span className="how-arc-core" />
              </div>
            </div>
            <div className="how-card-body">
              <h3 className="how-card-title">Plug it in anywhere</h3>
              <p className="how-card-text">
                Drop your key into Claude Code, Codex, Cursor—any tool you
                already use. It just works.
              </p>
            </div>
          </motion.div>

          {/* Card 3 — CSS browser/chat mockup */}
          <motion.div className="how-card" variants={staggerItem}>
            <div className="how-card-media how-card-media--flat">
              <div className="how-browser">
                <div className="how-browser-bar">
                  <span className="how-browser-dot how-browser-dot--r" />
                  <span className="how-browser-dot how-browser-dot--y" />
                  <span className="how-browser-dot how-browser-dot--g" />
                </div>
                <div className="how-browser-head">
                  <span className="how-browser-avatar">T</span>
                  <div>
                    <span className="how-browser-name">Talon</span>
                    <span className="how-browser-status">Online</span>
                  </div>
                </div>
                <div className="how-browser-lines">
                  <span style={{ width: "78%" }} />
                  <span style={{ width: "52%" }} />
                </div>
              </div>
            </div>
            <div className="how-card-body">
              <h3 className="how-card-title">Chat right here</h3>
              <p className="how-card-text">
                No setup needed. Talk to any model directly inside Talon.
              </p>
            </div>
          </motion.div>

          {/* Card 4 — CSS model pills cluster */}
          <motion.div className="how-card how-card--wide" variants={staggerItem}>
            <div className="how-card-media how-card-media--flat how-card-media--pills">
              <div className="how-pills">
                {MODEL_PILLS.map((p) => (
                  <span key={p.name} className={`how-pill ${p.cls}`}>
                    {p.name}
                  </span>
                ))}
                <div className="how-pill-center">
                  <span className="how-pill-center-title">One Talon Key</span>
                  <span className="how-pill-center-sub">
                    Unlocks every model
                  </span>
                </div>
              </div>
            </div>
            <div className="how-card-body">
              <h3 className="how-card-title">All models, one balance</h3>
              <p className="how-card-text">
                Top up once with crypto and spend across every model—no
                juggling accounts or bills.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
