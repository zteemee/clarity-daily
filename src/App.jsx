import { useState, useEffect } from "react";

// ─── Persistent storage helpers ───────────────────────────────────────────────
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_HABITS = [
  { id: 1, name: "Morning workout", emoji: "🏋️", points: 20 },
  { id: 2, name: "Deep work block", emoji: "🎯", points: 18 },
  { id: 3, name: "Meditate", emoji: "🧘", points: 15 },
  { id: 4, name: "Read 20 min", emoji: "📚", points: 12 },
  { id: 5, name: "Journaling", emoji: "✍️", points: 10 },
  { id: 6, name: "Drink 2L water", emoji: "💧", points: 8 },
  { id: 7, name: "No social media", emoji: "🚫", points: 8 },
  { id: 8, name: "Sleep by 11pm", emoji: "🌙", points: 5 },
  { id: 9, name: "Cold shower", emoji: "❄️", points: 4 },
];

const MOODS = [
  { emoji: "😄", label: "Amazing", color: "#f9c846", bg: "#fef9e7" },
  { emoji: "🙂", label: "Good", color: "#86efac", bg: "#f0fdf4" },
  { emoji: "😐", label: "Okay", color: "#93c5fd", bg: "#eff6ff" },
  { emoji: "😔", label: "Low", color: "#c4b5fd", bg: "#f5f3ff" },
  { emoji: "😣", label: "Hard", color: "#fca5a5", bg: "#fef2f2" },
];

const SCORE_COLOR = (pts) => {
  if (pts >= 100) return "#f9c846";
  if (pts >= 70) return "#86efac";
  if (pts >= 40) return "#93c5fd";
  if (pts > 0)  return "#c4b5fd";
  return "#e5e7eb";
};

const SCORE_OPACITY = (pts) => {
  if (pts >= 100) return 1;
  if (pts >= 70) return 0.85;
  if (pts >= 40) return 0.65;
  if (pts > 0) return 0.45;
  return 0.15;
};

const todayKey = (d) => d.toISOString().slice(0, 10);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Garden Component ──────────────────────────────────────────────────────────
function Garden({ score, mood }) {
  const moodColor = mood ? MOODS.find(m => m.label === mood)?.color : "#86efac";
  const vitality = score / 100;

  const plants = [
    { x: 8,  y: 62, type: "tree",    scale: 0.85, emoji: "🌳" },
    { x: 78, y: 60, type: "tree",    scale: 0.9,  emoji: "🌳" },
    { x: 92, y: 65, type: "tree",    scale: 0.7,  emoji: "🌲" },
    { x: 22, y: 70, type: "flower",  scale: 1.0,  emoji: score >= 50 ? "🌸" : "🌱" },
    { x: 38, y: 68, type: "flower",  scale: 0.9,  emoji: score >= 60 ? "🌺" : "🌱" },
    { x: 55, y: 66, type: "flower",  scale: 1.1,  emoji: score >= 40 ? "🌻" : "🌱" },
    { x: 68, y: 70, type: "flower",  scale: 0.95, emoji: score >= 55 ? "🌸" : "🌱" },
    { x: 84, y: 68, type: "flower",  scale: 0.85, emoji: score >= 45 ? "🌼" : "🌱" },
    { x: 5,  y: 80, type: "flower",  scale: 0.7,  emoji: score >= 30 ? "🌼" : "🌿" },
    { x: 14, y: 82, type: "flower",  scale: 0.75, emoji: score >= 35 ? "🌸" : "🌿" },
    { x: 26, y: 80, type: "flower",  scale: 0.8,  emoji: score >= 40 ? "🌺" : "🌿" },
    { x: 36, y: 83, type: "flower",  scale: 0.65, emoji: score >= 50 ? "🌼" : "🌿" },
    { x: 46, y: 80, type: "flower",  scale: 0.85, emoji: score >= 45 ? "🌸" : "🌿" },
    { x: 57, y: 82, type: "flower",  scale: 0.7,  emoji: score >= 55 ? "🌻" : "🌿" },
    { x: 67, y: 80, type: "flower",  scale: 0.8,  emoji: score >= 60 ? "🌺" : "🌿" },
    { x: 76, y: 83, type: "flower",  scale: 0.65, emoji: score >= 35 ? "🌼" : "🌿" },
    { x: 85, y: 81, type: "flower",  scale: 0.75, emoji: score >= 50 ? "🌸" : "🌿" },
    { x: 94, y: 80, type: "flower",  scale: 0.7,  emoji: score >= 40 ? "🌼" : "🌿" },
    { x: 30, y: 75, type: "grass",   scale: 0.9,  emoji: "🌿" },
    { x: 50, y: 76, type: "grass",   scale: 0.8,  emoji: "🍀" },
    { x: 72, y: 74, type: "grass",   scale: 0.85, emoji: "🌿" },
    ...(score >= 80 ? [{ x: 42, y: 55, type: "extra", scale: 0.9, emoji: "🦋" }] : []),
    ...(score >= 100 ? [{ x: 62, y: 50, type: "extra", scale: 0.85, emoji: "🦋" }] : []),
  ];

  const skyTop = score >= 70 ? "#fde68a" : score >= 40 ? "#bfdbfe" : "#e0e7ff";
  const skyBot = score >= 70 ? "#fef9c3" : score >= 40 ? "#dbeafe" : "#ede9fe";

  return (
    <div style={{
      width: "100%", height: 210, borderRadius: 24, overflow: "hidden",
      position: "relative",
      background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 55%, #86efac22 100%)`,
      border: "2px solid #f0e8d8",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)"
    }}>
      {score >= 40 ? (
        <div style={{
          position: "absolute", top: 18, right: 24,
          width: 36, height: 36, borderRadius: "50%",
          background: score >= 70 ? "#fbbf24" : "#93c5fd",
          boxShadow: `0 0 24px 8px ${score >= 70 ? "#fde68a" : "#bfdbfe"}`,
          opacity: 0.9,
          animation: "sunPulse 3s ease-in-out infinite"
        }} />
      ) : (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(200,210,230,0.18)",
          backdropFilter: "blur(1px)"
        }} />
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
        background: `linear-gradient(180deg, #bbf7d0 0%, #86efac 100%)`,
        opacity: 0.5 + vitality * 0.5,
        borderRadius: "0 0 22px 22px"
      }} />
      {plants.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          transform: `translate(-50%, -50%) scale(${p.scale * (0.4 + vitality * 0.6)})`,
          fontSize: p.type === "tree" ? 30 : p.type === "extra" ? 22 : p.type === "grass" ? 18 : 22,
          filter: score < 20 ? "grayscale(0.7) opacity(0.45)" : score < 40 ? "grayscale(0.3) opacity(0.7)" : "none",
          transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          animation: p.type === "extra"
            ? `floatExtra ${2 + i * 0.4}s ease-in-out infinite`
            : `sway${i % 2 === 0 ? "L" : "R"} ${2.5 + (i % 5) * 0.3}s ease-in-out infinite`,
          zIndex: p.type === "tree" ? 1 : p.y > 75 ? 3 : 2,
        }}>
          {p.emoji}
        </div>
      ))}
      <div style={{
        position: "absolute", top: 14, left: 16,
        background: "rgba(255,255,255,0.85)",
        borderRadius: 20, padding: "4px 12px",
        fontSize: 13, fontFamily: "'Georgia', serif",
        color: "#3d2c1e",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        {score}<span style={{ fontSize: 10, color: "#b09070" }}>/100</span>
      </div>
      {score >= 100 && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 22,
          background: "linear-gradient(135deg, rgba(249,200,70,0.15), rgba(134,239,172,0.15))",
          animation: "glow 2s ease-in-out infinite"
        }} />
      )}
    </div>
  );
}

// ─── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ dayData, onClose }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(30,20,10,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420,
        background: "linear-gradient(160deg, #fdf8f0, #fef3dc)",
        borderRadius: "28px 28px 0 0",
        padding: "28px 20px 40px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={prev} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#b09070" }}>‹</button>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: "#3d2c1e" }}>
            {MONTHS[month]} {year}
          </div>
          <button onClick={next} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#b09070" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#c8a060", letterSpacing: 1, paddingBottom: 4 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const data = dayData[key];
            const pts = data?.score || 0;
            const mood = data?.mood;
            const moodData = mood ? MOODS.find(m => m.label === mood) : null;
            const moodEmoji = moodData?.emoji || null;
            const moodColor = moodData?.color || null;
            const isToday = key === todayKey(today);
            const hasData = pts > 0 || mood;
            const cellBg = moodColor ? moodColor : hasData ? "#d1c4b0" : "#f5ede0";
            const cellOpacity = moodColor ? 0.75 + (pts / 100) * 0.25 : hasData ? 0.4 : 0.25;

            return (
              <div key={key} style={{
                aspectRatio: "1",
                borderRadius: 10,
                background: cellBg,
                opacity: cellOpacity,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                border: isToday ? "2px solid #3d2c1e" : "2px solid transparent",
                fontFamily: "'Georgia', serif",
                position: "relative",
                cursor: "default",
                boxShadow: moodColor ? `0 2px 8px ${moodColor}55` : "none",
                transition: "all 0.2s ease"
              }}>
                <div style={{ fontSize: 9, color: "#3d2c1e", opacity: 0.7 }}>{day}</div>
                {moodEmoji && <div style={{ fontSize: 12 }}>{moodEmoji}</div>}
                {pts > 0 && <div style={{ fontSize: 7, color: "#3d2c1e", fontWeight: "bold", opacity: 0.8 }}>{pts}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {MOODS.map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#b09070" }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: m.color }} />
              {m.emoji} {m.label}
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          display: "block", width: "100%", marginTop: 20,
          padding: "14px", borderRadius: 16, border: "none",
          background: "#f0e8d8", color: "#3d2c1e",
          fontFamily: "'Georgia', serif", fontSize: 15, cursor: "pointer"
        }}>Close</button>
      </div>
    </div>
  );
}

// ─── Settings View ─────────────────────────────────────────────────────────────
function SettingsView({ habits, setHabits, onClose }) {
  const [local, setLocal] = useState(habits.map(h => ({ ...h })));
  const total = local.reduce((s, h) => s + Number(h.points), 0);

  const update = (id, field, val) =>
    setLocal(l => l.map(h => h.id === id ? { ...h, [field]: val } : h));

  const addHabit = () => {
    if (local.length >= 10) return;
    setLocal(l => [...l, { id: Date.now(), name: "", emoji: "⭐", points: 5 }]);
  };

  const removeHabit = (id) => setLocal(l => l.filter(h => h.id !== id));

  const save_ = () => {
    setHabits(local.filter(h => h.name.trim()));
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "linear-gradient(160deg, #fdf8f0 0%, #fef3dc 100%)",
      overflowY: "auto", padding: "32px 20px 80px"
    }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={onClose} style={{
            background: "#f0e8d8", border: "none", borderRadius: 12,
            width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#b09070"
          }}>←</button>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#3d2c1e", fontWeight: "normal" }}>
            My Habits
          </h2>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: "14px 18px",
          border: "2px solid #f0e8d8", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontFamily: "'Georgia', serif", color: "#b09070", fontSize: 14 }}>Total points</span>
          <span style={{
            fontSize: 22, color: total === 100 ? "#e8a000" : total > 100 ? "#ef4444" : "#3d2c1e",
            fontFamily: "'Georgia', serif"
          }}>{total}<span style={{ fontSize: 13, color: "#b09070" }}>/100</span></span>
        </div>

        {total !== 100 && (
          <div style={{
            background: total > 100 ? "#fef2f2" : "#fef9e7",
            border: `2px solid ${total > 100 ? "#fca5a5" : "#fde68a"}`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 16,
            fontSize: 13, color: total > 100 ? "#dc2626" : "#92610a",
            fontFamily: "'Georgia', serif"
          }}>
            {total > 100 ? `⚠️ ${total - 100} pts over limit — reduce some habits` : `💡 ${100 - total} pts remaining to assign`}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {local.map(h => (
            <div key={h.id} style={{
              background: "#fff", borderRadius: 16, padding: "12px 14px",
              border: "2px solid #f0e8d8",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <input
                value={h.emoji} onChange={e => update(h.id, "emoji", e.target.value)}
                style={{
                  width: 40, textAlign: "center", fontSize: 20,
                  border: "none", background: "#f5ede0", borderRadius: 8,
                  padding: "4px 0", cursor: "text"
                }}
              />
              <input
                value={h.name} onChange={e => update(h.id, "name", e.target.value)}
                placeholder="Habit name..."
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontFamily: "'Georgia', serif", fontSize: 14, color: "#3d2c1e",
                  outline: "none"
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number" min={1} max={100}
                  value={h.points} onChange={e => update(h.id, "points", Number(e.target.value))}
                  style={{
                    width: 44, textAlign: "center",
                    border: "2px solid #f0e8d8", borderRadius: 8,
                    fontFamily: "'Georgia', serif", fontSize: 14, color: "#e8a000",
                    padding: "4px 2px", background: "#fef9e7"
                  }}
                />
                <span style={{ fontSize: 11, color: "#c8a060" }}>pt</span>
              </div>
              <button onClick={() => removeHabit(h.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 16, color: "#fca5a5", padding: "0 2px"
              }}>×</button>
            </div>
          ))}
        </div>

        {local.length < 10 && (
          <button onClick={addHabit} style={{
            width: "100%", padding: "12px", borderRadius: 16,
            border: "2px dashed #e0d5c5", background: "transparent",
            fontFamily: "'Georgia', serif", fontSize: 14, color: "#b09070",
            cursor: "pointer", marginBottom: 20
          }}>+ Add habit ({local.length}/10)</button>
        )}

        <button onClick={save_} disabled={total !== 100} style={{
          width: "100%", padding: "16px", borderRadius: 16, border: "none",
          background: total === 100 ? "linear-gradient(135deg, #f9c846, #e08000)" : "#e5e7eb",
          color: total === 100 ? "#fff" : "#9ca3af",
          fontFamily: "'Georgia', serif", fontSize: 16,
          cursor: total === 100 ? "pointer" : "not-allowed",
          boxShadow: total === 100 ? "0 4px 16px rgba(249,200,70,0.4)" : "none",
          transition: "all 0.2s"
        }}>
          {total === 100 ? "Save Habits ✓" : `Adjust to reach 100 pts (${total} now)`}
        </button>
      </div>
    </div>
  );
}

// ─── Impressum View ────────────────────────────────────────────────────────────
function ImpressumView({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "linear-gradient(160deg, #fdf8f0 0%, #fef3dc 100%)",
      overflowY: "auto", padding: "32px 20px 80px"
    }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <button onClick={onClose} style={{
            background: "#f0e8d8", border: "none", borderRadius: 12,
            width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#b09070"
          }}>←</button>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#3d2c1e", fontWeight: "normal" }}>
            Impressum
          </h2>
        </div>

        {/* Angaben gemäß § 5 TMG */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "22px 24px",
          border: "2px solid #f0e8d8", marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#c8a060", textTransform: "uppercase", marginBottom: 12 }}>
            Angaben gemäß § 5 TMG
          </div>
          <div style={{ fontFamily: "'Georgia', serif", color: "#3d2c1e", fontSize: 15, lineHeight: 1.8 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>Timea Zelch</div>
            <div>Lindenstr. 5</div>
            <div>76327 Pfinztal</div>
            <div>Deutschland</div>
          </div>
        </div>

        {/* Kontakt */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "22px 24px",
          border: "2px solid #f0e8d8", marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#c8a060", textTransform: "uppercase", marginBottom: 12 }}>
            Kontakt
          </div>
          <div style={{ fontFamily: "'Georgia', serif", color: "#3d2c1e", fontSize: 15, lineHeight: 1.8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>✉️</span>
              <a
                href="mailto:hello@clarity-journal.com"
                style={{ color: "#c8a060", textDecoration: "none", borderBottom: "1px solid #f0e8d8" }}
              >
                hello@clarity-journal.com
              </a>
            </div>
          </div>
        </div>

        {/* Haftungsausschluss */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "22px 24px",
          border: "2px solid #f0e8d8", marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#c8a060", textTransform: "uppercase", marginBottom: 12 }}>
            Haftungsausschluss
          </div>
          <div style={{ fontFamily: "'Georgia', serif", color: "#7a6652", fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ fontWeight: "bold", color: "#3d2c1e", marginBottom: 4, fontSize: 14 }}>Haftung für Inhalte</div>
            <p style={{ margin: "0 0 12px" }}>
              Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
              und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
            </p>
            <div style={{ fontWeight: "bold", color: "#3d2c1e", marginBottom: 4, fontSize: 14 }}>Urheberrecht</div>
            <p style={{ margin: 0 }}>
              Die durch die Seitenbetreiberin erstellten Inhalte und Werke unterliegen dem deutschen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
              außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung der jeweiligen
              Autorin.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: "center", fontSize: 12, color: "#c8a060",
          fontFamily: "'Georgia', serif", marginTop: 8
        }}>
          The Clarity Journal · {new Date().getFullYear()}
        </div>

        <button onClick={onClose} style={{
          display: "block", width: "100%", marginTop: 24,
          padding: "14px", borderRadius: 16, border: "none",
          background: "#f0e8d8", color: "#3d2c1e",
          fontFamily: "'Georgia', serif", fontSize: 15, cursor: "pointer"
        }}>← Zurück</button>

      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function ClarityDaily() {
  const [habits, setHabits] = useState(() => load("cd_habits", DEFAULT_HABITS));
  const [dayData, setDayData] = useState(() => load("cd_daydata", {}));
  const [view, setView] = useState("dashboard");
  const [showCalendar, setShowCalendar] = useState(false);
  const [floats, setFloats] = useState([]);

  const today = todayKey(new Date());
  const todayData = dayData[today] || {
    intention: "", grateful1: "", grateful2: "",
    completed: [], note: "", mood: null, score: 0
  };

  const saveToday = (patch) => {
    const updated = { ...todayData, ...patch };
    const score = habits
      .filter(h => (updated.completed || []).includes(h.id))
      .reduce((s, h) => s + h.points, 0);
    updated.score = score;
    const newData = { ...dayData, [today]: updated };
    setDayData(newData);
    save("cd_daydata", newData);
  };

  const toggleHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    const was = (todayData.completed || []).includes(id);
    const completed = was
      ? todayData.completed.filter(x => x !== id)
      : [...(todayData.completed || []), id];
    saveToday({ completed });

    if (!was) {
      const fid = Date.now();
      setFloats(f => [...f, { id: fid, text: `+${habit.points}`, x: Math.random() * 50 + 25 }]);
      setTimeout(() => setFloats(f => f.filter(fl => fl.id !== fid)), 1200);
    }
  };

  const score = todayData.score || 0;

  useEffect(() => { save("cd_habits", habits); }, [habits]);

  if (view === "settings") {
    return <SettingsView habits={habits} setHabits={(h) => { setHabits(h); save("cd_habits", h); }} onClose={() => setView("dashboard")} />;
  }

  if (view === "impressum") {
    return <ImpressumView onClose={() => setView("dashboard")} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #fdf8f0 0%, #fef3dc 50%, #fdf0e0 100%)",
      fontFamily: "'Georgia', serif",
      position: "relative"
    }}>
      <style>{`
        @keyframes sunPulse { 0%,100%{box-shadow:0 0 24px 8px #fde68a} 50%{box-shadow:0 0 36px 14px #fde68a} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes swayL { 0%,100%{transform:translate(-50%,-50%) rotate(-3deg)} 50%{transform:translate(-50%,-50%) rotate(3deg)} }
        @keyframes swayR { 0%,100%{transform:translate(-50%,-50%) rotate(3deg)} 50%{transform:translate(-50%,-50%) rotate(-3deg)} }
        @keyframes floatExtra { 0%,100%{transform:translate(-50%,-50%) translateY(0px) rotate(-5deg)} 50%{transform:translate(-50%,-50%) translateY(-8px) rotate(5deg)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-70px) scale(1.4)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e0d0b0; border-radius: 4px; }
        input:focus, textarea:focus { outline: none; }
      `}</style>

      {/* Floating points */}
      {floats.map(fl => (
        <div key={fl.id} style={{
          position: "fixed", top: "35%", left: `${fl.x}%`,
          fontFamily: "'Georgia', serif", fontWeight: "bold",
          fontSize: 24, color: "#e8a000",
          animation: "floatUp 1.2s ease forwards",
          pointerEvents: "none", zIndex: 999,
          textShadow: "0 2px 8px rgba(232,160,0,0.5)"
        }}>{fl.text}</div>
      ))}

      {showCalendar && <CalendarView dayData={dayData} onClose={() => setShowCalendar(false)} />}

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "28px 20px 16px"
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#c8a060", textTransform: "uppercase" }}>Today</div>
            <div style={{ fontSize: 20, color: "#3d2c1e" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowCalendar(true)} style={{
              background: "#fff", border: "2px solid #f0e8d8", borderRadius: 12,
              padding: "8px 14px", cursor: "pointer", fontSize: 13,
              color: "#b09070", fontFamily: "'Georgia', serif"
            }}>📅 Month</button>
            <button onClick={() => setView("settings")} style={{
              background: "#fff", border: "2px solid #f0e8d8", borderRadius: 12,
              padding: "8px 12px", cursor: "pointer", fontSize: 16
            }}>⚙️</button>
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.4s ease" }}>

          {/* 🌱 Garden */}
          <Garden score={score} mood={todayData.mood} />

          {/* 🌅 Intention */}
          <div style={{
            background: "#fff", borderRadius: 20, padding: "18px 20px",
            border: "2px solid #f0e8d8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>☀️</span>
              <div>
                <div style={{ fontSize: 12, color: "#c8a060", letterSpacing: 2, textTransform: "uppercase" }}>Morning</div>
                <div style={{ fontSize: 16, color: "#3d2c1e" }}>Set your intention</div>
              </div>
            </div>
            <textarea
              value={todayData.intention || ""}
              onChange={e => saveToday({ intention: e.target.value })}
              placeholder="What does a good day look like today?"
              rows={2}
              style={{
                width: "100%", border: "2px solid #f0e8d8", borderRadius: 12,
                padding: "12px 14px", fontFamily: "'Georgia', serif",
                fontSize: 14, color: "#3d2c1e", background: "#fdf8f0",
                lineHeight: 1.6
              }}
            />
          </div>

          {/* ✅ Habits */}
          <div style={{
            background: "#fff", borderRadius: 20, padding: "18px 20px",
            border: "2px solid #f0e8d8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 12, color: "#c8a060", letterSpacing: 2, textTransform: "uppercase" }}>Habits</div>
                  <div style={{ fontSize: 16, color: "#3d2c1e" }}>Today's practices</div>
                </div>
              </div>
              <div style={{ fontSize: 20, color: "#e8a000", fontFamily: "'Georgia', serif" }}>
                {score}<span style={{ fontSize: 12, color: "#c8a060" }}>pts</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {habits.map(habit => {
                const done = (todayData.completed || []).includes(habit.id);
                return (
                  <div key={habit.id} onClick={() => toggleHabit(habit.id)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 14,
                    background: done ? "linear-gradient(135deg,#fef3c7,#fde68a)" : "#fdf8f0",
                    border: done ? "2px solid #f9c846" : "2px solid #f0e8d8",
                    cursor: "pointer", transition: "all 0.2s ease",
                    boxShadow: done ? "0 3px 12px rgba(249,200,70,0.25)" : "none"
                  }}>
                    <span style={{ fontSize: 22 }}>{habit.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 14, color: done ? "#92610a" : "#3d2c1e",
                        textDecoration: done ? "line-through" : "none",
                        textDecorationColor: "#f9c846"
                      }}>{habit.name}</div>
                      <div style={{ fontSize: 11, color: "#c8a060" }}>+{habit.points} pts</div>
                    </div>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: done ? "#f9c846" : "transparent",
                      border: done ? "none" : "2px solid #e0d5c5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: "#fff", transition: "all 0.2s", flexShrink: 0
                    }}>{done ? "✓" : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🌙 Evening */}
          <div style={{
            background: "#fff", borderRadius: 20, padding: "18px 20px",
            border: "2px solid #f0e8d8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 22 }}>🌙</span>
              <div>
                <div style={{ fontSize: 12, color: "#c8a060", letterSpacing: 2, textTransform: "uppercase" }}>Evening</div>
                <div style={{ fontSize: 16, color: "#3d2c1e" }}>Reflect & be grateful</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#b09070", marginBottom: 8 }}>How did today feel?</div>
              <div style={{ display: "flex", gap: 8 }}>
                {MOODS.map(m => (
                  <button key={m.label} onClick={() => saveToday({ mood: todayData.mood === m.label ? null : m.label })} style={{
                    flex: 1, padding: "8px 4px", borderRadius: 12, border: "none",
                    background: todayData.mood === m.label ? m.bg : "#fdf8f0",
                    cursor: "pointer", fontSize: 20,
                    boxShadow: todayData.mood === m.label ? `0 0 0 2px ${m.color}` : "none",
                    transition: "all 0.15s ease"
                  }}>
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#b09070", marginBottom: 8 }}>2 things I'm grateful for</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2].map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, color: "#f9c846" }}>✦</span>
                    <input
                      value={todayData[`grateful${n}`] || ""}
                      onChange={e => saveToday({ [`grateful${n}`]: e.target.value })}
                      placeholder={`Grateful for...`}
                      style={{
                        flex: 1, border: "2px solid #f0e8d8", borderRadius: 10,
                        padding: "10px 12px", fontFamily: "'Georgia', serif",
                        fontSize: 14, color: "#3d2c1e", background: "#fdf8f0"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#b09070", marginBottom: 8 }}>A note about today</div>
              <textarea
                value={todayData.note || ""}
                onChange={e => saveToday({ note: e.target.value })}
                placeholder="How did the day go? What patterns do you notice?"
                rows={3}
                style={{
                  width: "100%", border: "2px solid #f0e8d8", borderRadius: 12,
                  padding: "12px 14px", fontFamily: "'Georgia', serif",
                  fontSize: 14, color: "#3d2c1e", background: "#fdf8f0",
                  lineHeight: 1.6
                }}
              />
            </div>
          </div>

          {/* Score summary */}
          {score > 0 && (
            <div style={{
              background: score >= 100
                ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              borderRadius: 20, padding: "18px 20px",
              border: `2px solid ${score >= 100 ? "#f9c846" : "#86efac"}`,
              textAlign: "center", animation: "fadeIn 0.4s ease"
            }}>
              <div style={{ fontSize: 13, color: "#b09070", marginBottom: 4 }}>
                {score >= 100 ? "🌟 Perfect day!" : score >= 70 ? "🌸 Great day!" : score >= 40 ? "🌱 Growing!" : "💧 Every step counts"}
              </div>
              <div style={{ fontSize: 32, color: "#3d2c1e" }}>{score}<span style={{ fontSize: 16, color: "#b09070" }}>/100</span></div>
              <div style={{ fontSize: 12, color: "#b09070" }}>points earned today</div>
            </div>
          )}

          {/* ─── Impressum Link ─────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 16 }}>
            <button
              onClick={() => setView("impressum")}
              style={{
                background: "none", border: "none",
                cursor: "pointer",
                fontSize: 12, color: "#c8a060",
                fontFamily: "'Georgia', serif",
                textDecoration: "underline",
                textDecorationColor: "#e0d5c5",
                letterSpacing: 1,
                padding: "4px 8px"
              }}
            >
              Impressum
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}