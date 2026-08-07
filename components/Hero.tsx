"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import PlanetCanvas from "./PlanetCanvas";
import GetStartedButton from "./GetStartedButton";
import { EASE } from "./motion";

const LINE1 = ["AI", "Coding", "Agent."];
const LINE2 = "Powered by your wallet.";

export default function Hero() {
  const sec = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sec,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={sec} className="hero">
      <div className="orb orb-accent" aria-hidden="true" />

      <div className="hero-inner hero--split">
      <motion.div className="hero-content" style={{ y: yText, opacity }}>
        <h1 className="hero-title">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            {LINE1.map((word, i) => (
              <motion.span
                key={`l1-${word}`}
                className="hero-word"
                initial={{ opacity: 0, y: "0.6em", rotateX: 45 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.12, ease: EASE }}
              >
                {word}
                {i < LINE1.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </motion.span>
          <motion.span
            className="hero-l2 block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          >
            {LINE2}
          </motion.span>
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        >
          Tell Frank what to build, and watch it write, run, and ship real
          code—in an isolated sandbox you control. Download your project,
          keep your key. No subscriptions, ever.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: EASE }}
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <GetStartedButton className="btn-aurora" />
          </motion.div>
          <Link href="#features" className="btn-ghost">
            See How It Works
          </Link>
        </motion.div>
      </motion.div>

      <div className="hero-model" aria-hidden="true">
        <PlanetCanvas className="hero-model-canvas" size={1.1} offsetY={0} />
      </div>
      </div>
    </section>
  );
}