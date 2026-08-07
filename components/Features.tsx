"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "./motion";

const BRAND = {
  openai: {
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
    cls: "fi-brand--openai",
  },
  anthropic: {
    path: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z",
    cls: "fi-brand--anthropic",
  },
  gemini: {
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
    cls: "fi-brand--gemini",
  },
  meta: {
    path: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z",
    cls: "fi-brand--meta",
  },
  cursor: {
    path: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23",
    cls: "fi-brand--cursor",
  },
  cline: {
    path: "m23.365 13.556-1.442-2.895V8.994c0-2.764-2.218-5.002-4.954-5.002h-2.464c.178-.367.276-.779.276-1.213A2.77 2.77 0 0 0 12.018 0a2.77 2.77 0 0 0-2.763 2.779c0 .434.098.846.276 1.213H7.067c-2.736 0-4.954 2.238-4.954 5.002v1.667L.64 13.549c-.149.29-.149.636 0 .927l1.472 2.855v1.667C2.113 21.762 4.33 24 7.067 24h9.902c2.736 0 4.954-2.238 4.954-5.002V17.33l1.44-2.865c.143-.286.143-.622.002-.91m-12.854 2.36a2.27 2.27 0 0 1-2.261 2.273 2.27 2.27 0 0 1-2.261-2.273v-4.042A2.27 2.27 0 0 1 8.249 9.6a2.267 2.267 0 0 1 2.262 2.274zm7.285 0a2.27 2.27 0 0 1-2.26 2.273 2.27 2.27 0 0 1-2.262-2.273v-4.042A2.267 2.267 0 0 1 15.535 9.6a2.267 2.267 0 0 1 2.261 2.274z",
    cls: "fi-brand--cline",
  },
};

function BrandIcon({ brand, size = 36 }: { brand: keyof typeof BRAND; size?: number }) {
  const b = BRAND[brand];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`fi-brand ${b.cls}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={b.path} />
    </svg>
  );
}

function GaugeIllustration() {
  const cx = 75;
  const cy = 70;
  const r = 44;
  const pathLen = Math.PI * r;
  const fillLen = pathLen * 0.55;
  return (
    <div className="feature-illustration fi-gauge" aria-hidden="true">
      <svg width="150" height="100" viewBox="0 0 150 100">
        <defs>
          <linearGradient id="fi-gauge-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7fe8df" />
            <stop offset="100%" stopColor="#cbfffc" />
          </linearGradient>
        </defs>
        <path
          d="M31 70 A44 44 0 0 1 119 70"
          stroke="rgba(112, 119, 119, 0.25)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${pathLen} ${pathLen * 2}`}
        />
        <path
          d="M31 70 A44 44 0 0 1 119 70"
          stroke="url(#fi-gauge-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${fillLen} ${pathLen * 2}`}
        />
        <line
          x1={cx}
          y1={cy}
          x2="80.2"
          y2="37.4"
          stroke="#edfffe"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4.5" fill="#edfffe" />
      </svg>
    </div>
  );
}

function IconRowIllustration() {
  return (
    <div className="feature-illustration fi-icons" aria-hidden="true">
      <span className="fi-icon fi-icon--md" title="OpenAI">
        <BrandIcon brand="openai" size={20} />
      </span>
      <span className="fi-icon fi-icon--active" title="Claude">
        <BrandIcon brand="anthropic" size={24} />
      </span>
      <span className="fi-icon fi-icon--md" title="Gemini">
        <BrandIcon brand="gemini" size={20} />
      </span>
      <span className="fi-icon fi-icon--md" title="Llama">
        <BrandIcon brand="meta" size={20} />
      </span>
    </div>
  );
}

function NodeDiagramIllustration() {
  return (
    <div className="feature-illustration fi-nodes" aria-hidden="true">
      <div className="fi-node-lines">
        <svg viewBox="0 0 240 90" preserveAspectRatio="none">
          <path d="M40 45 L120 15" />
          <path d="M40 45 L130 45" />
          <path d="M40 45 L120 75" />
        </svg>
      </div>
      <span className="fi-node-center" title="Claude Code">
        <BrandIcon brand="anthropic" size={22} />
      </span>
      <span className="fi-node-pill" style={{ left: 118, top: 3 }}>
        <BrandIcon brand="anthropic" size={12} />
        Claude Code
      </span>
      <span className="fi-node-pill" style={{ left: 128, top: 33 }}>
        <BrandIcon brand="cursor" size={12} />
        Cursor
      </span>
      <span className="fi-node-pill" style={{ left: 118, top: 63 }}>
        <BrandIcon brand="cline" size={12} />
        Cline
      </span>
    </div>
  );
}

const FEATURES = [
  {
    title: "Real Code Execution",
    text: "Talon writes code and runs it in a secure sandbox. Live output, real results—and the finished project ready to download.",
    illustration: GaugeIllustration,
  },
  {
    title: "Any LLM Model",
    text: "Use your own Claude API key. No subscriptions, no metered tiers—just transparent token costs you fully control.",
    illustration: IconRowIllustration,
  },
  {
    title: "Fully Isolated",
    text: "Every session runs in its own microVM. No shared filesystems, no cross-user access. Your code stays yours.",
  },
  {
    title: "Live Chat Interface",
    text: "Direct, real-time chat. Watch commands execute, files change, and tests pass—exactly as they happen.",
  },
  {
    title: "Full Terminal Access",
    text: "npm, git, bash—anything you'd run locally. Build, test, lint, and deploy straight from the conversation.",
    illustration: NodeDiagramIllustration,
  },
  {
    title: "Download Projects",
    text: "Export your project as .tar.gz and take it anywhere. Local dev, production, or your team's repo—zero lock-in.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <p className="label">Capabilities</p>
            <h2 className="section-title">Built for real development.</h2>
            <p className="section-sub">
              Not a chatbot. A full coding agent that writes, runs, and ships
              real software inside an isolated environment—live, on your own
              key.
            </p>
          </div>
        </Reveal>

        <div className="explore-grid">
          <motion.div
            className="explore-features"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {FEATURES.map((f) => (
              <motion.article key={f.title} className="feature-row" variants={staggerItem}>
                <motion.button
                  className="arrow-btn"
                  aria-label="Learn more"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <ArrowIcon />
                </motion.button>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
                {f.illustration ? <f.illustration /> : null}
              </motion.article>
            ))}
          </motion.div>

          <Reveal className="explore-viz explore-viz--flow" delay={0.2}>
            <Image
              src="/illustrations/feature-flow.webp"
              alt=""
              width={724}
              height={2172}
              sizes="(max-width: 1024px) 100vw, 420px"
              style={{ width: "100%", height: "auto" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}