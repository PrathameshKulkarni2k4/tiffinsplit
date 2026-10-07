"use client";

import { useEffect, useState } from "react";
import { createOrder } from "./actions";
import type { AppUser, Mess } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The app is mobile-first, so fields keep a comfortable touch height on small
// screens and relax to the tighter desktop sizing above the 721px breakpoint.
const FIELD = "min-h-[46px] text-base md:min-h-0";
const SELECT =
  "mt-1.5 flex min-h-[46px] w-full rounded-md border border-input bg-card px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-0";

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
    <Card className="px-5 py-[18px] max-md:px-4">
      <form action={createOrder} className="space-y-1">
        <Label className="mb-3 block font-semibold">
          Date
          <Input
            type="date"
            name="order_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            className={FIELD}
          />
        </Label>

        <Label className="mb-3 block font-semibold">
          Mess
          <select
            name="mess_id"
            value={messId}
            onChange={(e) => setMessId(e.target.value)}
            required
            className={SELECT}
          >
            {messes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Label>

        <Label className="mb-3 block font-semibold">
          Portion
          <select
            name="tiffin_type"
            value={type}
            onChange={(e) => setType(e.target.value as "full" | "half")}
            className={SELECT}
          >
            <option value="full">Full</option>
            <option value="half">Half</option>
          </select>
        </Label>

        <Label className="mb-3 block font-semibold">
          Price (₹)
          <Input
            type="number"
            step="0.01"
            min="0"
            name="unit_price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={FIELD}
          />
        </Label>

        <fieldset className="mb-3 rounded-lg border px-3.5 py-2.5 max-md:border-0 max-md:p-0">
          <legend className="px-1.5 font-semibold max-md:px-0 max-md:pb-1.5">Who shared it?</legend>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex min-h-[46px] items-center gap-2.5 max-md:border-b max-md:last:border-b-0"
            >
              <Checkbox
                id={`sharer-${m.id}`}
                name="sharers"
                value={m.id}
                checked={selected.includes(m.id)}
                onCheckedChange={() => toggle(m.id)}
              />
              <label
                htmlFor={`sharer-${m.id}`}
                className="flex flex-1 cursor-pointer items-center self-stretch font-normal"
              >
                {m.full_name || m.email}
              </label>
            </div>
          ))}
        </fieldset>

        <p className="mb-3 mt-3 text-sm text-muted-foreground">
          {n > 0
            ? `≈ ${each.toFixed(2)} each — the exact split (to the paise) is applied when you save.`
            : "Select at least one person."}
        </p>

        <Label className="mb-3 block font-semibold">
          Notes
          <Input type="text" name="notes" placeholder="optional" className={FIELD} />
        </Label>

        <Button type="submit" disabled={n === 0} className="w-full max-md:min-h-[46px]">
          Save order
        </Button>
      </form>
    </Card>
  );
}
