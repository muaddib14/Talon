"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useTalonAuth } from "@/hooks/useTalonAuth";

interface GetStartedButtonProps {
  className?: string;
  children?: ReactNode;
  magnetic?: boolean;
}

export default function GetStartedButton({
  className = "btn-aurora",
  children = "Get Started",
  magnetic = false,
}: GetStartedButtonProps) {
  const { openWalletModal, isLoading } = useTalonAuth();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.5 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={openWalletModal}
      disabled={isLoading}
      className={className}
      style={magnetic ? { x: sx, y: sy } : undefined}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={
        magnetic
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
              y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
            }
          : undefined
      }
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {isLoading ? "Connecting…" : children}
    </motion.button>
  );
}