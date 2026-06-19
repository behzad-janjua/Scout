"use client";

import { useState } from "react";

export interface BusinessFormValue {
  name: string;
  business_type: string;
  phone_number: string;
  owner_email: string;
}

const EMPTY: BusinessFormValue = {
  name: "",
  business_type: "bike_shop",
  phone_number: "",
  owner_email: "",
};

export default function BusinessForm({
  value,
  onChange,
}: {
  value?: BusinessFormValue;
  onChange?: (v: BusinessFormValue) => void;
}) {
  const [local, setLocal] = useState<BusinessFormValue>(value ?? EMPTY);

  function update(patch: Partial<BusinessFormValue>) {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange?.(next);
  }

  return (
    <div className="card">
      <div className="panel-label">Business</div>
      <h2>Who are we testing?</h2>
      <div className="field">
        <label>Business name</label>
        <input
          value={local.name}
          placeholder="Crank &amp; Coast Bike Shop"
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Business type</label>
        <select
          value={local.business_type}
          onChange={(e) => update({ business_type: e.target.value })}
        >
          <option value="bike_shop">Bike shop</option>
          <option value="salon">Salon</option>
          <option value="restaurant">Restaurant</option>
          <option value="auto_shop">Auto shop</option>
          <option value="clinic">Clinic / med spa</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="field">
        <label>Phone number to call</label>
        <input
          value={local.phone_number}
          placeholder="+1 555 010 1337"
          onChange={(e) => update({ phone_number: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Owner email (optional)</label>
        <input
          value={local.owner_email}
          placeholder="owner@example.com"
          onChange={(e) => update({ owner_email: e.target.value })}
        />
      </div>
    </div>
  );
}
