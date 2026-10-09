"use client";

import { Download, Link2, MessageCircle, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * The ways a month leaves the app.
 *
 * The group talks on WhatsApp, and money gets settled in that thread - so the
 * most useful thing this screen can do is produce a block of text that can be
 * pasted straight into it. No API, no bot, no account: just the summary, in the
 * format people already read.
 *
 * CSV is the spreadsheet route, and print is for anyone who wants it on paper.
 */
export default function ShareBar({
  month,
  monthLabel,
  lines,
  total,
}: {
  month: string;
  monthLabel: string;
  lines: { name: string; amount: string }[];
  total: string;
}) {
  const { push } = useToast();

  function summary(): string {
    const body = lines.map((l) => `${l.name} — ${l.amount}`).join("\n");
    return `*TiffinSplit — ${monthLabel}*\n\n${body}\n\n*Total ${total}*`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary());
      push("Summary copied — paste it into the group.");
    } catch {
      push("Couldn't reach the clipboard. Long-press the page to copy instead.", {
        variant: "error",
      });
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        <Link2 className="h-4 w-4" aria-hidden="true" />
        Copy summary
      </Button>

      {/* wa.me opens the app or the web client with the text already in the
          message box. The text is encoded, not sent - the sender still chooses
          the group and presses send. */}
      <Button variant="outline" size="sm" asChild>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(summary())}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </Button>

      <Button variant="outline" size="sm" asChild>
        <a href={`/api/export?month=${month}`} download>
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </a>
      </Button>

      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print
      </Button>
    </div>
  );
}
