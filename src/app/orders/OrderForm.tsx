"use client";

import { useEffect, useState } from "react";
import { createOrder } from "./actions";
import type { AppUser, Mess } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateField from "@/components/DateField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// The app is mobile-first, so fields keep a comfortable touch height on small
// screens and relax to the tighter desktop sizing above the 721px breakpoint.
const FIELD = "min-h-[46px] text-base md:min-h-0";
const SELECT =
  "mt-1.5 flex min-h-[46px] w-full rounded-md border border-input bg-card px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-0";

export default function OrderForm({
  messes,
  members,
  loggedKeys,
}: {
  messes: Mess[];
  members: AppUser[];
  /** "date|messId" for orders that already exist, for the duplicate guard. */
  loggedKeys: string[];
}) {
  const [messId, setMessId] = useState(messes[0]?.id ?? "");
  const [orderDate, setOrderDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [type, setType] = useState<"full" | "half" | "mixed">("full");
  // Only meaningful for a mixed order: how many of each go into the basket.
  const [fullQty, setFullQty] = useState(1);
  const [halfQty, setHalfQty] = useState(1);
  const [price, setPrice] = useState<string>(String(messes[0]?.full_price ?? ""));
  const [selected, setSelected] = useState<string[]>(members.map((m) => m.id));
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // The same guard the Today screen has had all along. This form predates it
  // and was never given one, so the same person could be logged twice for one
  // day through one screen and not the other - which produced a bill that was
  // quietly wrong rather than visibly broken.
  const hasClash = loggedKeys.includes(`${orderDate}|${messId}`);
  const blocked = hasClash && !allowDuplicate;

  // Pre-fill the price from the mess whenever the mess or portion changes.
  useEffect(() => {
    const mess = messes.find((m) => m.id === messId);
    if (!mess) return;
    if (type === "mixed") {
      // Priced from the mess's current prices at the moment it is logged. An
      // old order keeps whatever it was logged at - the snapshot rule is
      // unchanged, and this does not reach backwards.
      setPrice(String(fullQty * mess.full_price + halfQty * mess.half_price));
      return;
    }
    setPrice(String(type === "full" ? mess.full_price : mess.half_price));
  }, [messId, type, messes, fullQty, halfQty]);

  const n = selected.length;
  const each = n > 0 ? Number(price) / n : 0;

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <Card className="px-5 py-[18px] max-md:px-4">
      <form action={createOrder} className="space-y-1">
        <div className="mb-3">
          <span className="mb-1.5 block font-semibold">Date</span>
          <DateField value={orderDate} onChange={setOrderDate} name="order_date" />
        </div>

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
            onChange={(e) => setType(e.target.value as "full" | "half" | "mixed")}
            className={SELECT}
          >
            <option value="full">Full</option>
            <option value="half">Half</option>
            <option value="mixed">Mixed — fulls and halves</option>
          </select>
        </Label>

        {type === "mixed" && (
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Label className="block font-semibold">
              Fulls
              <Input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                name="full_qty"
                value={fullQty}
                onChange={(e) => setFullQty(Math.max(0, Number(e.target.value) || 0))}
                className={FIELD}
              />
            </Label>
            <Label className="block font-semibold">
              Halves
              <Input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                name="half_qty"
                value={halfQty}
                onChange={(e) => setHalfQty(Math.max(0, Number(e.target.value) || 0))}
                className={FIELD}
              />
            </Label>
            <p className="col-span-2 -mt-1 text-sm text-muted-foreground">
              The price below is filled in from these and the mess&apos;s prices.
              You can still change it if you were charged something else.
            </p>
          </div>
        )}

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

        {hasClash && (
          <Alert variant="warning" className="mb-3">
            <AlertTitle>Already logged for that date and mess.</AlertTitle>
            <AlertDescription>
              <div className="mt-2 flex min-h-[46px] items-center gap-2.5 font-semibold">
                <Checkbox
                  id="allow-duplicate"
                  checked={allowDuplicate}
                  onCheckedChange={(v) => setAllowDuplicate(v === true)}
                />
                <label
                  htmlFor="allow-duplicate"
                  className="flex flex-1 cursor-pointer items-center self-stretch font-normal"
                >
                  I know — add it anyway
                </label>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* The server reads this, so the guard holds even if the button is
            bypassed or JavaScript never ran. */}
        {allowDuplicate && <input type="hidden" name="allow_duplicate" value="1" />}

        <Button
          type="submit"
          disabled={n === 0 || blocked}
          className="w-full max-md:min-h-[46px]"
        >
          Save order
        </Button>
      </form>
    </Card>
  );
}
