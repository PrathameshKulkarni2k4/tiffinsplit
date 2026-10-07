"use client";

/**
 * Last-resort boundary: this replaces the root layout, so it can't rely on the
 * app's stylesheet being present. Everything here is inline on purpose.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#f4f6fb",
          color: "#1a2233",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e8ef",
            borderRadius: 14,
            padding: "28px 24px",
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.4rem", margin: "0 0 10px" }}>
            TiffinSplit couldn&apos;t load
          </h1>
          <p style={{ margin: "0 0 18px", color: "#5d636f", fontSize: "0.95rem" }}>
            Something failed before the app could start. Reload the page, and if it keeps
            happening, tell whoever looks after the app.
          </p>
          <button
            onClick={reset}
            style={{
              width: "100%",
              minHeight: 44,
              border: "1px solid #2563eb",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 10,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
