import Link from "next/link";
import { getMesses, getMembers } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import OrderForm from "../OrderForm";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Log a tiffin" };

/**
 * "YYYY-MM-DD|messId" for every order in the last few months.
 *
 * Feeds the duplicate guard. Keys rather than rows, because the form only asks
 * a yes/no question and shipping the whole order set to the client to answer
 * it would be wasteful.
 *
 * Deliberately local to this page rather than a shared helper: PR #46 also
 * edits lib/data.ts, and two changes appending to the same file conflict on
 * merge even when they have nothing to do with each other.
 */
async function loggedKeys(days = 120): Promise<string[]> {
  const supabase = createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data, error } = await supabase
    .from("orders")
    .select("order_date, mess_id")
    .gte("order_date", since);
  if (error) throw new Error(error.message);
  return (data ?? []).map((o) => `${o.order_date}|${o.mess_id}`);
}

export default async function NewOrderPage() {
  const [messes, members, keys] = await Promise.all([
    getMesses(true),
    getMembers(),
    loggedKeys(),
  ]);

  if (messes.length === 0) {
    return (
      <Card className="px-5 py-[18px]">
        <p className="m-0">
          No messes yet. <Link href="/messes" className="underline">Add a mess first.</Link>
        </p>
      </Card>
    );
  }

  return (
    <>
      <h1>Log a tiffin</h1>
      <p className="mb-5 text-muted-foreground">
        Pick the mess, the portion, the price, and who shared it.
      </p>
      <OrderForm messes={messes} members={members} loggedKeys={keys} />
    </>
  );
}
