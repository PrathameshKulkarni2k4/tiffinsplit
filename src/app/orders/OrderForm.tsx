"use client";

import { useEffect, useState } from "react";
import { createOrder } from "./actions";
import type { AppUser, Mess } from "@/lib/types";

export default function OrderForm({ messes, members }: { messes: Mess[]; members: AppUser[] }) {
  const [messId, setMessId] = useState(messes[0]?.id ?? "");
  const [type, setType] = useState<"full" | "half">("full");
  const [price, setPrice] = useState<string>(String(messes[0]?.full_price ?? ""));
  const [selected, setSelected] = useState<string[]>(members.map((m) => m.id));

  // Pre-fill the price from the mess whenever the mess or portion changes.
  useEffect(() => {
    const mess = messes.find((m) => m.id === messId);
    if (mess) setPrice(String(type === "full" ? mess.full_price : mess.half_price));
  }, [messId, type, messes]);

  const n = selected.length;
  const each = n > 0 ? Number(price) / n : 0;

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <form action={createOrder} className="card form">
      <label>
        Date
        <input type="date" name="order_date" defaultValue={new Date().toISOString().slice(0, 10)} required />
      </label>

      <label>
        Mess
        <select name="mess_id" value={messId} onChange={(e) => setMessId(e.target.value)} required>
          {messes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Portion
        <select name="tiffin_type" value={type} onChange={(e) => setType(e.target.value as "full" | "half")}>
          <option value="full">Full</option>
          <option value="half">Half</option>
        </select>
      </label>

      <label>
        Price (₹)
        <input
          type="number"
          step="0.01"
          min="0"
          name="unit_price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>

      <fieldset>
        <legend>Who shared it?</legend>
        {members.map((m) => (
          <label key={m.id} className="check">
            <input
              type="checkbox"
              name="sharers"
              value={m.id}
              checked={selected.includes(m.id)}
              onChange={() => toggle(m.id)}
            />
            {m.full_name || m.email}
          </label>
        ))}
      </fieldset>

      <p className="muted">
        {n > 0
          ? `≈ ${each.toFixed(2)} each — the exact split (to the paise) is applied when you save.`
          : "Select at least one person."}
      </p>

      <label>
        Notes
        <input type="text" name="notes" placeholder="optional" />
      </label>

      <button className="btn primary" type="submit" disabled={n === 0}>
        Save order
      </button>
    </form>
  );
}
