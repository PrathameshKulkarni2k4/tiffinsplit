import Link from "next/link";
import { getMesses, getMembers } from "@/lib/data";
import OrderForm from "../OrderForm";
import { Card } from "@/components/ui/card";

export default async function NewOrderPage() {
  const [messes, members] = await Promise.all([getMesses(true), getMembers()]);

  if (messes.length === 0) {
    return (
      <Card className="px-5 py-[18px]">
        <p className="m-0">
          No messes yet. <Link href="/messes">Add a mess first.</Link>
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
      <OrderForm messes={messes} members={members} />
    </>
  );
}
