"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE } from "./motion";

function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration, ease: EASE });
      return () => controls.stop();
    }
  }, [inView, to, duration, mv]);

  return (
    <motion.p
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {text}
    </motion.p>
  );
}

export default function Stats() {
  return (
    <section className="stats">
      <div className="stat">
        <Counter to={0} prefix="$" className="stat-num" />
        <p className="stat-label">Subscription cost</p>
      </div>
      <div className="stat">
        <Counter to={100} suffix="%" className="stat-num" />
        <p className="stat-label">Code ownership</p>
      </div>
      <div className="stat">
        <motion.p
          className="stat-num"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          ∞
        </motion.p>
        <p className="stat-label">Unlimited sessions</p>
      </div>
      <div className="stat">
        <Counter to={4} className="stat-num" />
        <p className="stat-label">Steps to ship</p>
      </div>
    </section>
  );
}