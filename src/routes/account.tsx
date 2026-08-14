import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { BUILDING_MARKET_FACTS, unitMarketSnapshot } from "@/lib/market-data";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import { PAYMENT_METHODS } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/account")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "House Account & Condominium Fees · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "View statements, house account charges and condominium fees for your residence at 40 Trinity Place, and settle balances online.",
      },
      { property: "og:title", content: "House Account · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Statements, condominium fees and payments for your residence.",
      },
    ],
  }),
  component: AccountPage,
});

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function AccountPage() {
  return (
    <PageShell
      eyebrow="House Account"
      title="Statements & payments"
      intro="Condominium fees, amenity charges and in-residence dining are consolidated into a single monthly statement for your household."
    >
      <RequireSession area="your house account">
        <AccountBody />
      </RequireSession>
    </PageShell>
  );
}

function AccountBody() {
  const { statements, payments, payStatement, currentUser } = usePortal();
  const [method, setMethod] = useState(PAYMENT_METHODS[0]!.id);
  const [openId, setOpenId] = useState<number | null>(statements[0]?.id ?? null);

  const balance = statements
    .filter((s) => s.status !== "Paid")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="mt-12 space-y-10">
      <MarketSnapshot unit={currentUser?.unit ?? "Residence 22H"} />

      <section aria-labelledby="balance-heading" className="border border-border bg-card p-8">
        <h2 id="balance-heading" className="text-2xl">
          Current balance
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{currentUser?.unit}</p>
        <p className="mt-4 font-display text-5xl">{money(balance)}</p>
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          {balance > 0 ? "Due by the 15th of the month." : "No outstanding balance. Thank you."}
        </p>

        <div className="mt-6 max-w-md space-y-2">
          <Label htmlFor="payment-method">Payment method</Label>
          <select
            id="payment-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section aria-labelledby="statements-heading">
        <h2 id="statements-heading" className="text-2xl">
          Statements
        </h2>
        <ul className="mt-6 space-y-4">
          {statements.map((s) => {
            const open = openId === s.id;
            return (
              <li key={s.id} className="border border-border bg-card">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : s.id)}
                    aria-expanded={open}
                    aria-controls={`statement-${s.id}`}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 text-left sm:flex sm:flex-wrap sm:justify-between sm:gap-4 sm:p-6"
                  >
                    <span className="min-w-0">
                      <span className="block text-lg sm:text-xl">{s.period}</span>
                      <span className="block text-xs text-muted-foreground sm:text-sm">
                        Issued {s.issued} · Due {s.due}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-5">
                      <span className="font-display text-xl sm:text-2xl">{money(s.amount)}</span>
                      <span
                        className={`border px-2.5 py-1 text-[0.65rem] tracking-[0.16em] uppercase sm:px-3 sm:text-xs ${
                          s.status === "Paid"
                            ? "border-primary text-primary"
                            : "border-destructive text-destructive"
                        }`}
                      >
                        {s.status}
                      </span>
                    </span>
                  </button>
                </h3>
                {open && (
                  <div
                    id={`statement-${s.id}`}
                    className="border-t border-border px-5 pt-5 pb-6 sm:px-6"
                  >
                    <table className="w-full text-sm">
                      <caption className="sr-only">Charges for {s.period}</caption>
                      <thead>
                        <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                          <th scope="col" className="pb-2">
                            Charge
                          </th>
                          <th scope="col" className="pb-2 text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.lines.map((l) => (
                          <tr key={l.label} className="border-t border-border">
                            <td className="py-2">{l.label}</td>
                            <td className="py-2 text-right">{money(l.amount)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-border font-medium">
                          <td className="py-2">Total</td>
                          <td className="py-2 text-right">{money(s.amount)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {s.status !== "Paid" && (
                      <Button
                        className="mt-5 min-h-11 tracking-[0.18em] uppercase"
                        onClick={() => {
                          payStatement(
                            s.id,
                            PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method,
                          );
                          toast.success(`${s.period} settled.`);
                        }}
                      >
                        Pay {money(s.amount)}
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="payments-heading">
        <h2 id="payments-heading" className="text-2xl">
          Payment history
        </h2>
        <ul className="mt-6 space-y-3" aria-live="polite">
          {payments.map((p) => (
            <li key={p.id} className="border border-border bg-card p-5 text-sm">
              {money(p.amount)} · {p.statementPeriod} · {p.method} · {p.at}
            </li>
          ))}
          {payments.length === 0 && (
            <li className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No payments made in this session.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

/** Illustrative real-estate performance for the signed-in residence. */
function MarketSnapshot({ unit }: { unit: string }) {
  const snap = unitMarketSnapshot(unit);
  const facts = BUILDING_MARKET_FACTS;

  return (
    <section aria-labelledby="market-heading" className="border border-border bg-card p-6 sm:p-8">
      <p className="eyebrow">Ownership</p>
      <h2 id="market-heading" className="mt-3 text-2xl">
        Your residence at market
      </h2>
      <div className="gold-rule mt-4" />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Illustrative valuation for {unit} based on recent activity in the building. Demonstration
        figures only, not an appraisal.
      </p>

      <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Estimated value"
          value={money(snap.estimate)}
          note={`${snap.sqft.toLocaleString("en-US")} sq ft`}
        />
        <Stat label="Purchase price" value={money(snap.purchase)} note="Recorded at closing" />
        <Stat
          label="Unrealised gain"
          value={`${snap.gain >= 0 ? "+" : ""}${money(snap.gain)}`}
          note={`${snap.gainPct >= 0 ? "+" : ""}${snap.gainPct}% since purchase`}
        />
        <Stat
          label="Lease potential"
          value={`${money(snap.rentEstimate)} / mo`}
          note={`${snap.grossYield}% gross yield`}
        />
      </dl>

      <h3 className="mt-10 text-xl">The building</h3>
      <dl className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Median price / sq ft"
          value={money(facts.medianPricePerSqft)}
          note={`${facts.yearOverYear}% year on year`}
        />
        <Stat
          label="Days on market"
          value={`${facts.daysOnMarket}`}
          note={`${facts.askingToClose}% asking to close`}
        />
        <Stat
          label="Active listings"
          value={`${facts.activeListings}`}
          note={`${facts.soldTrailingYear} sold in twelve months`}
        />
        <Stat
          label="Leased occupancy"
          value={`${facts.leaseOccupancy}%`}
          note={`Median lease ${money(facts.medianLease)}`}
        />
      </dl>

      <Link to="/sales-and-leasing" className="btn-outline mt-8 inline-flex min-h-11 items-center">
        View sales & leasing
      </Link>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-2 font-display text-2xl">{value}</dd>
      <dd className="mt-1 text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}
