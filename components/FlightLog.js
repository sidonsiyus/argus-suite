"use client";

import { useEffect, useState } from "react";
import { FACTS, TERMS, onThisDay } from "@/lib/flightlog";

function dayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}

export default function FlightLog() {
  const [factI, setFactI] = useState(null);
  const [termI, setTermI] = useState(null);
  const [otd, setOtd] = useState(null);

  useEffect(() => {
    const now = new Date();
    const doy = dayOfYear(now);
    setFactI((doy * 3) % FACTS.length);
    setTermI(doy % TERMS.length);
    setOtd(onThisDay(now));
  }, []);

  const fact = factI == null ? null : FACTS[factI];
  const term = termI == null ? null : TERMS[termI];

  return (
    <section className="group" id="flight-log">
      <div className="group-head">
        <div className="group-eyebrow">
          <span>From the flight log</span>
          <span className="rule" />
          <span className="count">rotates daily</span>
        </div>
        <div className="group-title">Did you know<span className="blurb">a fact, a moment in history, and a term — each day</span></div>
      </div>

      <div className="fl-row">
        {/* Did you know */}
        <div className="fl-card fact">
          <div className="fl-tag">
            <span className="fl-plane">✈</span> Did you know
            <span className="fl-index mono">{factI == null ? "" : `FACT ${factI + 1} / ${FACTS.length}`}</span>
          </div>
          <p className="fl-fact serif">
            {fact ? `“${fact}”` : "Loading from the flight log…"}
          </p>
          <button className="fl-shuffle" onClick={() => setFactI((i) => (i + 1) % FACTS.length)} disabled={factI == null}>
            ↻ Another fact
          </button>
        </div>

        <div className="fl-col">
          {/* On this day in aviation */}
          <div className="fl-card otd">
            <div className="fl-tag">
              <span className="fl-wing">✦</span> On this day
              <span className="fl-index mono" suppressHydrationWarning>{otd ? (otd.exact ? otd.label.toUpperCase() : `NEAR ${otd.label.toUpperCase()}`) : ""}</span>
            </div>
            {otd ? (
              <>
                <div className="fl-otd-year serif">{otd.year}</div>
                <div className="fl-otd-text">{otd.text}</div>
              </>
            ) : (
              <div className="fl-otd-text">Consulting the logbook…</div>
            )}
          </div>

          {/* Term of the day */}
          <div className="fl-card term">
            <div className="fl-tag">
              <span className="fl-dot" /> Term of the day
              <span className="fl-index mono">GLOSSARY</span>
            </div>
            {term ? (
              <>
                <div className="fl-term-word serif">{term[0]}</div>
                <div className="fl-term-full">{term[1]}</div>
                <div className="fl-term-def">{term[2]}</div>
              </>
            ) : (
              <div className="fl-term-def">Loading term…</div>
            )}
            <button className="fl-shuffle" onClick={() => setTermI((i) => (i + 1) % TERMS.length)} disabled={termI == null}>
              ↻ Next term
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
