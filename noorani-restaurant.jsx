import { useState, useEffect, useCallback } from "react";
import { Phone, MapPin, Clock, Star, ChevronRight, ChevronLeft, X, Check, ShoppingBag, CalendarCheck, Lock, Flame } from "lucide-react";

/* ---------------------------------------------------------
   Noorani Restaurant — نورانی ریستوران
   Design language: "Noor" (light/glow) rising out of a
   charcoal Karachi night — ember reds, saffron gold, a
   pulsing glow nameplate, and a string-of-lights divider
   motif that recurs through the page.
--------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@500;700&display=swap');
`;

const COLORS = {
  charcoal: "#16130F",
  charcoal2: "#1E1911",
  ember: "#C8472B",
  saffron: "#E8A93D",
  cream: "#F2E8D5",
  maroon: "#3B1013",
  mint: "#7C9473",
};

const DISHES = [
  {
    name: "Biryani",
    urdu: "بریانی",
    tag: "Most ordered",
    desc: "Layered basmati slow-steamed with a bone-in mutton or chicken masala — the dish diners mention more than any other.",
  },
  {
    name: "Chicken Tikka",
    urdu: "چکن تکہ",
    tag: "Charcoal grilled",
    desc: "Marinated overnight, finished over open coals for the smoky char Noorani is known for on Rashid Minhas Road.",
  },
  {
    name: "Beef Pulao",
    urdu: "بیف پلاؤ",
    tag: "House speciality",
    desc: "A lighter, whole-spice cousin of biryani — tender beef, fragrant rice, a house recipe locals ask for by name.",
  },
  {
    name: "Karahi",
    urdu: "کڑاہی",
    tag: "Made to order",
    desc: "Tossed to order in a wok-style karahi with tomato, ginger and green chili — ask for it dry or with extra shorba.",
  },
];

const REVIEW_SNIPPETS = [
  { author: "Awais S.", role: "Local Guide", note: "Came here as a group after our last day at university — a nearby, dependable spot that delivered on taste." },
  { author: "Zohaib B.", role: "Local Guide", note: "Rates the barbecue, fast food and beef pulao as the standouts on the menu." },
  { author: "Asad A.", role: "Local Guide", note: "Enjoyed the tikka's flavor overall, though noted it can run a little dry on an off night." },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 58 },
  { stars: 4, pct: 22 },
  { stars: 3, pct: 10 },
  { stars: 2, pct: 5 },
  { stars: 1, pct: 5 },
];

function LightDivider() {
  return (
    <div className="relative h-10 w-full overflow-hidden">
      <svg viewBox="0 0 800 40" className="w-full h-full" preserveAspectRatio="none">
        <path d="M0,10 Q200,40 400,10 T800,10" fill="none" stroke="#E8A93D33" strokeWidth="1.5" />
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 20 + i * 58;
          const y = 10 + 22 * Math.sin((i / 13) * Math.PI);
          return (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.2 : 2} fill="#E8A93D" opacity={i % 3 === 0 ? 0.9 : 0.45}>
              <animate attributeName="opacity" values={`${i % 3 === 0 ? "0.9" : "0.45"};0.15;${i % 3 === 0 ? "0.9" : "0.45"}`} dur={`${2.4 + (i % 5) * 0.3}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(value) ? COLORS.saffron : "none"} color={COLORS.saffron} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function NooraniRestaurant() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("reserve"); // reserve | order
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [reserveForm, setReserveForm] = useState({ name: "", phone: "", guests: 2, date: "", time: "", note: "" });
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "", items: "", note: "" });

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [records, setRecords] = useState({ reservations: [], orders: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    setLoaded(true);
  }, []);

  function showToast(msg, kind = "ok") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }

  async function submitReservation(e) {
    e.preventDefault();
    if (!reserveForm.name || !reserveForm.phone || !reserveForm.date || !reserveForm.time) {
      showToast("Please fill in name, phone, date and time.", "err");
      return;
    }
    setSubmitting(true);
    try {
      let existing = [];
      try {
        const res = await window.storage.get("reservations-list", true);
        existing = res?.value ? JSON.parse(res.value) : [];
      } catch (_) {
        existing = [];
      }
      const entry = { ...reserveForm, id: `res_${Date.now()}`, createdAt: new Date().toISOString(), status: "pending" };
      const updated = [entry, ...existing].slice(0, 500);
      const result = await window.storage.set("reservations-list", JSON.stringify(updated), true);
      if (!result) throw new Error("Storage write failed");
      showToast("Table request sent — we'll confirm by phone shortly.");
      setReserveForm({ name: "", phone: "", guests: 2, date: "", time: "", note: "" });
    } catch (err) {
      showToast("Couldn't send that just now — please call us instead.", "err");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOrder(e) {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone || !orderForm.items) {
      showToast("Please fill in name, phone and what you'd like to order.", "err");
      return;
    }
    setSubmitting(true);
    try {
      let existing = [];
      try {
        const res = await window.storage.get("orders-list", true);
        existing = res?.value ? JSON.parse(res.value) : [];
      } catch (_) {
        existing = [];
      }
      const entry = { ...orderForm, id: `ord_${Date.now()}`, createdAt: new Date().toISOString(), status: "pending" };
      const updated = [entry, ...existing].slice(0, 500);
      const result = await window.storage.set("orders-list", JSON.stringify(updated), true);
      if (!result) throw new Error("Storage write failed");
      showToast("Order request received — we'll call to confirm total & delivery time.");
      setOrderForm({ name: "", phone: "", address: "", items: "", note: "" });
    } catch (err) {
      showToast("Couldn't send that just now — please call us instead.", "err");
    } finally {
      setSubmitting(false);
    }
  }

  const loadAdmin = useCallback(async () => {
    setAdminLoading(true);
    try {
      const [r, o] = await Promise.all([
        window.storage.get("reservations-list", true).catch(() => null),
        window.storage.get("orders-list", true).catch(() => null),
      ]);
      setRecords({
        reservations: r?.value ? JSON.parse(r.value) : [],
        orders: o?.value ? JSON.parse(o.value) : [],
      });
    } catch (e) {
      // leave as-is
    } finally {
      setAdminLoading(false);
    }
  }, []);

  function tryAdminLogin() {
    if (adminPass === "noorani786") {
      setAdminAuthed(true);
      setAdminError("");
      loadAdmin();
    } else {
      setAdminError("Incorrect passcode.");
    }
  }

  return (
    <div style={{ fontFamily: "'Work Sans', sans-serif", background: COLORS.charcoal, color: COLORS.cream }} className="min-h-screen w-full relative">
      <style>{`
        ${FONT_IMPORT}
        .noor-display { font-family: 'Fraunces', serif; }
        .noor-urdu { font-family: 'Noto Nastaliq Urdu', serif; direction: rtl; }
        .noor-glow {
          text-shadow: 0 0 40px rgba(232,169,61,0.55), 0 0 90px rgba(200,71,43,0.35);
        }
        @keyframes noorPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.06); }
        }
        .noor-pulse { animation: noorPulse 5s ease-in-out infinite; }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: riseIn 0.8s ease both; }
        .card-hover { transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(232,169,61,0.55); box-shadow: 0 18px 40px -20px rgba(200,71,43,0.55); }
        input, textarea {
          background: rgba(242,232,213,0.06);
          border: 1px solid rgba(242,232,213,0.18);
          color: #F2E8D5;
        }
        input::placeholder, textarea::placeholder { color: rgba(242,232,213,0.4); }
        input:focus, textarea:focus, button:focus-visible {
          outline: 2px solid #E8A93D;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .noor-pulse, .rise { animation: none !important; }
        }
      `}</style>

      {/* ambient glow field */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="noor-pulse" style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,169,61,0.20) 0%, rgba(200,71,43,0.10) 40%, transparent 70%)" }} />
      </div>

      {/* NAV */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b" style={{ borderColor: "rgba(242,232,213,0.1)" }}>
        <div className="flex items-baseline gap-3">
          <span className="noor-display text-xl md:text-2xl tracking-wide" style={{ color: COLORS.saffron }}>Noorani</span>
          <span className="noor-urdu text-lg md:text-xl" style={{ color: COLORS.cream }}>نورانی ریستوران</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "rgba(242,232,213,0.75)" }}>
          <a href="#menu" className="hover:text-[#E8A93D] transition-colors">Menu</a>
          <a href="#reviews" className="hover:text-[#E8A93D] transition-colors">Reviews</a>
          <a href="#visit" className="hover:text-[#E8A93D] transition-colors">Visit</a>
        </nav>
        <a href="#book" className="text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ background: COLORS.ember, color: COLORS.cream }}>
          Reserve
        </a>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <div className="rise max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-xs mb-6" style={{ color: COLORS.mint }}>Gulshan-e-Iqbal · Karachi</p>
          <h1 className="noor-display noor-glow text-5xl md:text-7xl leading-[1.05] mb-3" style={{ color: COLORS.cream }}>
            Where the tandoor
            <br />
            <span style={{ color: COLORS.saffron }}>never goes dark.</span>
          </h1>
          <p className="noor-urdu text-2xl md:text-3xl mt-4 mb-6" style={{ color: "rgba(232,169,61,0.85)" }}>روشنی، ذائقہ، نورانی</p>
          <p className="text-base md:text-lg mb-9 max-w-xl mx-auto" style={{ color: "rgba(242,232,213,0.75)" }}>
            Biryani, charcoal-grilled tikka and beef pulao, served on Rashid Minhas Road since our earliest regulars were still university students.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <a href="#book" className="px-7 py-3 rounded-full font-semibold flex items-center gap-2 transition-transform hover:scale-105" style={{ background: COLORS.saffron, color: COLORS.charcoal }}>
              <CalendarCheck size={18} /> Reserve a table
            </a>
            <a href="#order" className="px-7 py-3 rounded-full font-semibold flex items-center gap-2 border transition-colors hover:bg-[rgba(232,169,61,0.1)]" style={{ borderColor: "rgba(232,169,61,0.5)", color: COLORS.cream }}>
              <ShoppingBag size={18} /> Order takeout
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm" style={{ color: "rgba(242,232,213,0.7)" }}>
            <span className="flex items-center gap-2"><Stars value={4} /> 4.0 · 1,837 reviews</span>
            <span className="flex items-center gap-2"><Clock size={15} /> Open now · closes 11:30 PM</span>
            <span className="flex items-center gap-2">Rs 1–4,000 per person</span>
          </div>
        </div>
      </section>

      <LightDivider />

      {/* MENU */}
      <section id="menu" className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: COLORS.mint }}>On the menu</p>
              <h2 className="noor-display text-3xl md:text-4xl" style={{ color: COLORS.cream }}>What people order twice</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {DISHES.map((d) => (
              <div key={d.name} className="card-hover rounded-2xl p-6 border" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.12)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="noor-display text-2xl" style={{ color: COLORS.cream }}>{d.name}</h3>
                    <p className="noor-urdu text-base mt-0.5" style={{ color: "rgba(232,169,61,0.75)" }}>{d.urdu}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(200,71,43,0.18)", color: COLORS.ember }}>
                    <Flame size={11} /> {d.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(242,232,213,0.7)" }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LightDivider />

      {/* REVIEWS */}
      <section id="reviews" className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-12">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: COLORS.mint }}>Reputation</p>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="noor-display text-6xl" style={{ color: COLORS.saffron }}>4.0</span>
              <Stars value={4} size={20} />
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(242,232,213,0.6)" }}>from 1,837 Google reviews</p>
            <div className="space-y-2">
              {RATING_BREAKDOWN.map((r) => (
                <div key={r.stars} className="flex items-center gap-3 text-xs">
                  <span style={{ color: "rgba(242,232,213,0.6)" }}>{r.stars}★</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(242,232,213,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: COLORS.saffron }} />
                  </div>
                  <span style={{ color: "rgba(242,232,213,0.45)" }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {REVIEW_SNIPPETS.map((r) => (
              <div key={r.author} className="rounded-2xl p-5 border" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.1)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: COLORS.cream }}>{r.author}</span>
                  <span className="text-[11px] uppercase tracking-wide" style={{ color: COLORS.mint }}>{r.role}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(242,232,213,0.72)" }}>{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LightDivider />

      {/* BOOK / ORDER */}
      <section id="book" className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div id="order" className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: COLORS.mint }}>Get a table, or get it delivered</p>
            <h2 className="noor-display text-3xl md:text-4xl" style={{ color: COLORS.cream }}>Reserve or order</h2>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <button onClick={() => setTab("reserve")} className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors" style={{ background: tab === "reserve" ? COLORS.saffron : "transparent", color: tab === "reserve" ? COLORS.charcoal : COLORS.cream, border: `1px solid ${tab === "reserve" ? COLORS.saffron : "rgba(242,232,213,0.25)"}` }}>
              <CalendarCheck size={16} /> Reserve a table
            </button>
            <button onClick={() => setTab("order")} className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors" style={{ background: tab === "order" ? COLORS.saffron : "transparent", color: tab === "order" ? COLORS.charcoal : COLORS.cream, border: `1px solid ${tab === "order" ? COLORS.saffron : "rgba(242,232,213,0.25)"}` }}>
              <ShoppingBag size={16} /> Order takeout
            </button>
          </div>

          {tab === "reserve" ? (
            <form onSubmit={submitReservation} className="grid gap-4 rounded-2xl p-6 md:p-8 border" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.12)" }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Your name" value={reserveForm.name} onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
                <input placeholder="Phone number" value={reserveForm.phone} onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="date" value={reserveForm.date} onChange={(e) => setReserveForm({ ...reserveForm, date: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
                <input type="time" value={reserveForm.time} onChange={(e) => setReserveForm({ ...reserveForm, time: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
                <input type="number" min={1} max={20} value={reserveForm.guests} onChange={(e) => setReserveForm({ ...reserveForm, guests: e.target.value })} className="rounded-lg px-4 py-3 text-sm" placeholder="Guests" />
              </div>
              <textarea placeholder="Anything we should know? (e.g. birthday, seating preference)" value={reserveForm.note} onChange={(e) => setReserveForm({ ...reserveForm, note: e.target.value })} rows={3} className="rounded-lg px-4 py-3 text-sm resize-none" />
              <button disabled={submitting} type="submit" className="mt-1 rounded-full py-3 font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-60" style={{ background: COLORS.ember, color: COLORS.cream }}>
                {submitting ? "Sending…" : "Request table"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitOrder} className="grid gap-4 rounded-2xl p-6 md:p-8 border" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.12)" }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Your name" value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
                <input placeholder="Phone number" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
              </div>
              <input placeholder="Delivery address (leave blank for pickup)" value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} className="rounded-lg px-4 py-3 text-sm" />
              <textarea placeholder="What would you like? e.g. 1x Chicken Biryani, 2x Beef Pulao" value={orderForm.items} onChange={(e) => setOrderForm({ ...orderForm, items: e.target.value })} rows={3} className="rounded-lg px-4 py-3 text-sm resize-none" />
              <textarea placeholder="Notes (spice level, extras)" value={orderForm.note} onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })} rows={2} className="rounded-lg px-4 py-3 text-sm resize-none" />
              <button disabled={submitting} type="submit" className="mt-1 rounded-full py-3 font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-60" style={{ background: COLORS.saffron, color: COLORS.charcoal }}>
                {submitting ? "Sending…" : "Send order request"}
              </button>
            </form>
          )}
          <p className="text-xs text-center mt-4" style={{ color: "rgba(242,232,213,0.4)" }}>We'll confirm every request by phone before it's final.</p>
        </div>
      </section>

      <LightDivider />

      {/* VISIT */}
      <section id="visit" className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: COLORS.mint }}>Find us</p>
            <h2 className="noor-display text-3xl md:text-4xl mb-6" style={{ color: COLORS.cream }}>Suleman Plaza, Gulshan-e-Iqbal</h2>
            <div className="space-y-4 text-sm" style={{ color: "rgba(242,232,213,0.78)" }}>
              <p className="flex items-start gap-3"><MapPin size={18} style={{ color: COLORS.saffron, flexShrink: 0, marginTop: 2 }} /> Shop # 6–8, Suleman Plaza, Rashid Minhas Rd Service Ln, Block 10, Gulshan-e-Iqbal, Karachi</p>
              <p className="flex items-center gap-3"><Phone size={18} style={{ color: COLORS.saffron, flexShrink: 0 }} /> +92 21 34827322</p>
              <p className="flex items-center gap-3"><Clock size={18} style={{ color: COLORS.saffron, flexShrink: 0 }} /> Open now · closes 11:30 PM daily</p>
            </div>
            <div className="flex gap-3 mt-7">
              <a href="https://www.google.com/maps/search/?api=1&query=Noorani+Restaurant+Gulshan-e-Iqbal+Karachi" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: COLORS.saffron, color: COLORS.charcoal }}>Get directions</a>
              <a href="tel:+922134827322" className="px-5 py-2.5 rounded-full text-sm font-semibold border" style={{ borderColor: "rgba(232,169,61,0.5)", color: COLORS.cream }}>Call now</a>
            </div>
          </div>
          <div className="rounded-2xl border overflow-hidden flex items-center justify-center min-h-[220px]" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.12)" }}>
            <div className="text-center p-8">
              <MapPin size={28} style={{ color: COLORS.ember, margin: "0 auto 10px" }} />
              <p className="text-sm" style={{ color: "rgba(242,232,213,0.55)" }}>Map preview — replace with an embedded Google Map on deploy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 md:px-12 py-10 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: "rgba(242,232,213,0.1)", color: "rgba(242,232,213,0.45)" }}>
        <span>© {new Date().getFullYear()} Noorani Restaurant · نورانی ریستوران</span>
        <button onClick={() => setAdminOpen(true)} className="flex items-center gap-1.5 hover:text-[#E8A93D] transition-colors">
          <Lock size={12} /> Staff dashboard
        </button>
      </footer>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rise px-5 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-xl" style={{ background: toast.kind === "err" ? "#5C1A1A" : COLORS.saffron, color: toast.kind === "err" ? COLORS.cream : COLORS.charcoal }}>
          {toast.kind === "err" ? <X size={16} /> : <Check size={16} />} {toast.msg}
        </div>
      )}

      {/* ADMIN MODAL */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 md:p-8 border" style={{ background: COLORS.charcoal2, borderColor: "rgba(242,232,213,0.15)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="noor-display text-2xl" style={{ color: COLORS.cream }}>Staff dashboard</h3>
              <button onClick={() => { setAdminOpen(false); }} style={{ color: "rgba(242,232,213,0.6)" }}><X size={20} /></button>
            </div>

            {!adminAuthed ? (
              <div className="grid gap-3 max-w-sm">
                <p className="text-sm mb-1" style={{ color: "rgba(242,232,213,0.65)" }}>Enter the staff passcode to view reservations and orders.</p>
                <input type="password" placeholder="Passcode" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryAdminLogin()} className="rounded-lg px-4 py-3 text-sm" />
                {adminError && <p className="text-xs" style={{ color: COLORS.ember }}>{adminError}</p>}
                <button onClick={tryAdminLogin} className="rounded-full py-2.5 font-semibold text-sm" style={{ background: COLORS.saffron, color: COLORS.charcoal }}>Unlock</button>
                <p className="text-[11px] mt-2" style={{ color: "rgba(242,232,213,0.35)" }}>Demo passcode — swap for real auth before going live.</p>
              </div>
            ) : (
              <div className="grid gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.saffron }}>Reservations ({records.reservations.length})</h4>
                    <button onClick={loadAdmin} className="text-xs underline" style={{ color: "rgba(242,232,213,0.5)" }}>{adminLoading ? "Refreshing…" : "Refresh"}</button>
                  </div>
                  <div className="grid gap-2">
                    {records.reservations.length === 0 && <p className="text-xs" style={{ color: "rgba(242,232,213,0.4)" }}>No reservation requests yet.</p>}
                    {records.reservations.map((r) => (
                      <div key={r.id} className="rounded-lg p-3 text-xs border" style={{ borderColor: "rgba(242,232,213,0.1)" }}>
                        <span className="font-semibold" style={{ color: COLORS.cream }}>{r.name}</span> · {r.phone} · {r.guests} guests · {r.date} {r.time}
                        {r.note && <p className="mt-1" style={{ color: "rgba(242,232,213,0.55)" }}>{r.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.saffron }}>Orders ({records.orders.length})</h4>
                  <div className="grid gap-2">
                    {records.orders.length === 0 && <p className="text-xs" style={{ color: "rgba(242,232,213,0.4)" }}>No order requests yet.</p>}
                    {records.orders.map((o) => (
                      <div key={o.id} className="rounded-lg p-3 text-xs border" style={{ borderColor: "rgba(242,232,213,0.1)" }}>
                        <span className="font-semibold" style={{ color: COLORS.cream }}>{o.name}</span> · {o.phone} {o.address && `· ${o.address}`}
                        <p className="mt-1" style={{ color: "rgba(242,232,213,0.55)" }}>{o.items}</p>
                        {o.note && <p style={{ color: "rgba(242,232,213,0.4)" }}>{o.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
