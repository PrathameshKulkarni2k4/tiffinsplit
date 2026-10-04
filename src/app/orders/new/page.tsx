import Link from "next/link";
import { getMesses, getMembers } from "@/lib/data";
import OrderForm from "../OrderForm";

export default async function NewOrderPage() {
  const [messes, members] = await Promise.all([getMesses(true), getMembers()]);

  if (messes.length === 0) {
    return (
      <div className="card">
        <p>
          No messes yet. <Link href="/messes">Add a mess first.</Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1>Log a tiffin</h1>
      <p className="subtitle">Pick the mess, the portion, the price, and who shared it.</p>
      <OrderForm messes={messes} members={members} />
    </>
  );
}
