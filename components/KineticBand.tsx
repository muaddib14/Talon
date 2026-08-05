"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function Row({ text, alt }: { text: string; alt?: boolean }) {
  return (
    <div className={`kinetic-line${alt ? " kinetic-line--alt" : ""}`}>
      <div className="kinetic-track">
        {[0, 1].map((half) => (
          <div className="kinetic-group" key={half}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="kinetic-text">
                {text}
              </span>
            ))}
            {[0, 1, 2].map((i) => (
              <span key={i} className="kinetic-dot" aria-hidden="true">
                .
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KineticBand() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} className="kinetic" aria-hidden="true">
      <motion.div style={{ y: y1 }}>
        <Row text="We Ship" />
      </motion.div>
      <motion.div style={{ y: y2 }}>
        <Row text="Faster" alt />
      </motion.div>
    </section>
  );
}