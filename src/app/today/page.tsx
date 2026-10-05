import Link from "next/link";
import { getMesses, getMembers } from "@/lib/data";
import TodayForm from "./TodayForm";

export default async function TodayPage() {
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
      <h1>Today</h1>
      <TodayForm messes={messes} members={members} />
    </>
  );
}
