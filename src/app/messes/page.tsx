import { getMesses } from "@/lib/data";
import { createMess, updateMess, toggleMess } from "./actions";

export default async function MessesPage() {
  const messes = await getMesses(false);

  return (
    <>
      <h1>Messes</h1>
      <p className="subtitle">Add messes and set their full and half tiffin prices.</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add a mess</h2>
        <form action={createMess} className="form">
          <label>
            Name
            <input name="name" required placeholder="e.g. Shree Mess" />
          </label>
          <div className="grid">
            <label>
              Full tiffin (₹)
              <input type="number" step="0.01" min="0" name="full_price" defaultValue="90" required />
            </label>
            <label>
              Half tiffin (₹)
              <input type="number" step="0.01" min="0" name="half_price" defaultValue="65" required />
            </label>
          </div>
          <button className="btn primary" type="submit">
            Add mess
          </button>
        </form>
      </div>

      <h2>All messes</h2>
      {messes.length === 0 ? (
        <div className="card">
          <p className="muted">No messes yet. Add your first one above.</p>
        </div>
      ) : (
        messes.map((m) => (
          <div className="card" key={m.id}>
            <div className="row" style={{ marginBottom: 10 }}>
              <strong>{m.name}</strong>
              <span className={`pill ${m.is_active ? "" : "half"}`}>
                {m.is_active ? "active" : "inactive"}
              </span>
            </div>

            <form action={updateMess} className="form">
              <input type="hidden" name="id" value={m.id} />
              <div className="grid">
                <label>
                  Name
                  <input name="name" defaultValue={m.name} required />
                </label>
                <label>
                  Full (₹)
                  <input type="number" step="0.01" min="0" name="full_price" defaultValue={m.full_price} required />
                </label>
                <label>
                  Half (₹)
                  <input type="number" step="0.01" min="0" name="half_price" defaultValue={m.half_price} required />
                </label>
              </div>
              <button className="btn small primary" type="submit">
                Save changes
              </button>
            </form>

            <form action={toggleMess} style={{ marginTop: 10 }}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="is_active" value={m.is_active ? "false" : "true"} />
              <button className="btn small" type="submit">
                {m.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </form>
          </div>
        ))
      )}
    </>
  );
}
