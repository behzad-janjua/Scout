"use client";

import { useState } from "react";

export interface ScenarioFormValue {
  title: string;
  goal: string;
  customer_persona: string;
  questions_to_ask: string;
}

const EMPTY: ScenarioFormValue = {
  title: "",
  goal: "",
  customer_persona: "",
  questions_to_ask: "",
};

export default function ScenarioForm({
  value,
  onChange,
}: {
  value?: ScenarioFormValue;
  onChange?: (v: ScenarioFormValue) => void;
}) {
  const [local, setLocal] = useState<ScenarioFormValue>(value ?? EMPTY);

  function update(patch: Partial<ScenarioFormValue>) {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange?.(next);
  }

  return (
    <div className="card">
      <div className="panel-label">Scenario</div>
      <h2>What should the AI shopper ask about?</h2>
      <div className="field">
        <label>Scenario title</label>
        <input
          value={local.title}
          placeholder="Angry recent-purchase complaint"
          onChange={(e) => update({ title: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Goal (what conversion are we testing?)</label>
        <input
          value={local.goal}
          placeholder="See whether staff de-escalate and book a clear next step"
          onChange={(e) => update({ goal: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Customer persona</label>
        <input
          value={local.customer_persona}
          placeholder="Alex, a recent buyer upset about a flat tire"
          onChange={(e) => update({ customer_persona: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Questions to ask (one per line)</label>
        <textarea
          value={local.questions_to_ask}
          placeholder={
            "What are you going to do about the flat tire?\nAm I going to have to pay for this?\nCan someone look at it tomorrow?"
          }
          onChange={(e) => update({ questions_to_ask: e.target.value })}
        />
      </div>
    </div>
  );
}
