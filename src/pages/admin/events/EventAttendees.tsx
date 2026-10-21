import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
type Registration = {
  id: string;
  attendee_name: string;
  attendee_email: string;
  payment_status: string;
  created_at: string;
  amount_cents: number;
  currency: string;
};
function csvCell(value: string) {
  return (
    '"' +
    (/^[\s]*[=+@\-\t\r]/.test(value) ? "'" : "") +
    value.replace(/"/g, '""') +
    '"'
  );
}
export default function EventAttendees({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<Registration[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const result: Registration[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          "id,attendee_name,attendee_email,payment_status,created_at,amount_cents,currency",
        )
        .eq("event_id", eventId)
        .order("created_at")
        .order("id")
        .range(from, from + 999);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      result.push(...data);
      if (data.length < 1000) break;
    }
    setRows(result);
    setLoading(false);
  }, [eventId]);
  useEffect(() => {
    void load();
  }, [load]);
  function download() {
    const csv = [
      [
        "Name",
        "Email",
        "Payment status",
        "Amount",
        "Currency",
        "Registered at",
      ],
      ...rows.map((r) => [
        r.attendee_name,
        r.attendee_email,
        r.payment_status,
        (r.amount_cents / 100).toFixed(2),
        r.currency,
        r.created_at,
      ]),
    ]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventId}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="mt-10 border-t border-white/20 pt-6">
      <h2 className="text-xl">Attendees ({rows.length})</h2>
      <div className="my-4 flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded border border-white/30 px-4"
          onClick={() => void load()}
        >
          Refresh
        </button>
        <button
          disabled={loading || !!error}
          className="min-h-11 rounded border border-white/30 px-4"
          onClick={download}
        >
          Export CSV
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Loading attendees…</p>
      ) : rows.length === 0 ? (
        <p>No registrations yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap justify-between gap-3 rounded border border-white/15 p-4"
            >
              <div>
                <p>{r.attendee_name}</p>
                <p className="break-all text-sm text-zinc-400">
                  {r.attendee_email}
                </p>
              </div>
              <span>
                {r.payment_status} ·{" "}
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: r.currency,
                }).format(r.amount_cents / 100)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
