"use client";

import Nav from "./Nav";
import Hero from "./Hero";
import KineticBand from "./KineticBand";
import Stats from "./Stats";
import Features from "./Features";
import Steps from "./Steps";
import Roadmap from "./Roadmap";
import Free from "./Free";
import Faq from "./Faq";
import Cta from "./Cta";
import Footer from "./Footer";

export default function Landing() {
  return (
    <>
      <Nav />
      <Hero />
      <KineticBand />
      <Stats />
      <Features />
      <Steps />
      <Roadmap />
      <Free />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}