"use client";

import { KeyRound } from "lucide-react";
import { Reveal } from "./motion";
import PlanetCanvas from "./PlanetCanvas";
import GetStartedButton from "./GetStartedButton";

export default function Cta() {
  return (
    <section className="cta">
      <div className="container">
        <Reveal>
          <div className="cta-panel">
            <PlanetCanvas size={1.7} offsetY={-1.15} />
            <span className="cta-skip-badge">
              <KeyRound size={14} />
              Skip the setup
            </span>
            <span className="cta-chip">
              <span className="cta-chip-dot" aria-hidden="true" />
              No subscription · BYOK · Free forever
            </span>
            <h2 className="cta-title">Build something great—free.</h2>
            <p className="cta-sub">
              Start in minutes. Bring your own key, own your code, and ship
              without limits.
            </p>
            <GetStartedButton
              className="btn-aurora btn-aurora--lg"
              magnetic
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}