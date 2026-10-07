import { getMesses } from "@/lib/data";
import { createMess, updateMess, toggleMess } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD = "min-h-[46px] text-base md:min-h-0";

export default async function MessesPage() {
  const messes = await getMesses(false);

  return (
    <>
      <h1>Messes</h1>
      <p className="mb-5 text-muted-foreground">
        Add messes and set their full and half tiffin prices.
      </p>

      <p className="mb-5 text-sm text-muted-foreground">
        Changing a price only affects <strong>future</strong> orders. Orders already logged keep the
        price they were entered at, so past bills never change.
      </p>

      <Card className="mb-[18px] px-5 py-[18px]">
        <h2 className="mt-0">Add a mess</h2>
        <form action={createMess}>
          <Label className="mb-3 block font-semibold">
            Name
            <Input name="name" required placeholder="e.g. Shree Mess" className={FIELD} />
          </Label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
            <Label className="block font-semibold">
              Full tiffin (₹)
              <Input
                type="number"
                step="0.01"
                min="0"
                name="full_price"
                defaultValue="90"
                required
                className={FIELD}
              />
            </Label>
            <Label className="block font-semibold">
              Half tiffin (₹)
              <Input
                type="number"
                step="0.01"
                min="0"
                name="half_price"
                defaultValue="65"
                required
                className={FIELD}
              />
            </Label>
          </div>
          <Button type="submit" className="mt-3">
            Add mess
          </Button>
        </form>
      </Card>

      <h2>All messes</h2>
      {messes.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">
            No messes yet. Add your first one above.
          </p>
        </Card>
      ) : (
        messes.map((m) => (
          <Card key={m.id} className="mb-[18px] px-5 py-[18px]">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
              <strong>{m.name}</strong>
              <Badge variant={m.is_active ? "secondary" : "warn"}>
                {m.is_active ? "active" : "inactive"}
              </Badge>
            </div>

            <form action={updateMess}>
              <input type="hidden" name="id" value={m.id} />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                <Label className="block font-semibold">
                  Name
                  <Input name="name" defaultValue={m.name} required className={FIELD} />
                </Label>
                <Label className="block font-semibold">
                  Full (₹)
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name="full_price"
                    defaultValue={m.full_price}
                    required
                    className={FIELD}
                  />
                </Label>
                <Label className="block font-semibold">
                  Half (₹)
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name="half_price"
                    defaultValue={m.half_price}
                    required
                    className={FIELD}
                  />
                </Label>
              </div>
              <Button type="submit" size="sm" className="mt-3">
                Save changes
              </Button>
            </form>

            <form action={toggleMess} className="mt-2.5">
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="is_active" value={m.is_active ? "false" : "true"} />
              <Button type="submit" variant="outline" size="sm">
                {m.is_active ? "Deactivate" : "Reactivate"}
              </Button>
            </form>
          </Card>
        ))
      )}
    </>
  );
}
