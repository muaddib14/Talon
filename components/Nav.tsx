"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "./motion";
import GetStartedButton from "./GetStartedButton";
import Logo from "./Logo";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#free", label: "Free" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className={`nav${scrolled ? " scrolled" : ""}`}
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="nav-inner">
        <a href="#" className="logo" aria-label="Talon">
          <Logo height={26} />
        </a>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <GetStartedButton className="btn-aurora btn-aurora--sm" />
        </motion.div>
      </div>
    </motion.nav>
  );
}