import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, Plus, BookOpen, X, Trash2, Loader2, LogIn, KeyRound, ChevronRight } from "lucide-react";

const FONT_LINK_ID = "dict-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600&family=Amiri:wght@400;700&family=Cairo:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const EN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AR_LETTERS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");

function firstLetterKey(word, section) {
  if (!word) return "#";
  const w = word.trim();
  if (section === "en-ar") {
    const c = w[0].toUpperCase();
    return /[A-Z]/.test(c) ? c : "#";
  } else {
    const c = w[0];
    return AR_LETTERS.includes(c) ? c : "#";
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SECTIONS = {
  "en-ar": {
    label: "English → Arabic",
    shortLabel: "EN → AR",
    accent: "#2F6F63",
    accentSoft: "#E4EEEA",
    wordPlaceholder: "Word in English",
    wordDir: "ltr",
    wordFont: "'Fraunces', serif",
    meaningPlaceholder: "المعنى بالعربية",
    meaningDir: "rtl",
    meaningFont: "'Amiri', serif",
    letters: EN_LETTERS,
  },
  "ar-ar": {
    label: "Arabic → Arabic",
    shortLabel: "AR → AR",
    accent: "#7A3B3F",
    accentSoft: "#F1E5E4",
    wordPlaceholder: "الكلمة",
    wordDir: "rtl",
    wordFont: "'Amiri', serif",
    meaningPlaceholder: "الشرح بالعربية",
    meaningDir: "rtl",
    meaningFont: "'Amiri', serif",
    letters: AR_LETTERS,
  },
};

const INK = "#22302B";
const PAPER = "#ECE7D8";
const CARD = "#F8F5EA";
const BRASS = "#B4884B";

export default function DictionaryApp() {
  useFonts();
  const [authStage, setAuthStage] = useState("checking"); // checking | setup | login | in
  const [storedCode, setStoredCode] = useState(null);
  const [name, setName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  const [entries, setEntries] = useState([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [section, setSection] = useState("en-ar");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saveError, setSaveError] = useState("");

  const FIXED_CODE = "bacaloria2026";

  // ---- bootstrap: fixed shared access code ----
  useEffect(() => {
    setStoredCode(FIXED_CODE);
    setAuthStage("login");
  }, []);

  // ---- load entries once logged in ----
  useEffect(() => {
    if (authStage !== "in") return;
    (async () => {
      try {
        const res = await window.storage.get("entries", true);
        if (res && res.value) {
          setEntries(JSON.parse(res.value));
        } else {
          setEntries([]);
        }
      } catch (e) {
        setEntries([]);
      } finally {
        setEntriesLoaded(true);
      }
    })();
  }, [authStage]);

  const persistEntries = useCallback(async (next) => {
    setEntries(next);
    try {
      const res = await window.storage.set("entries", JSON.stringify(next), true);
      if (!res) setSaveError("Couldn't save — try again.");
      else setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save — try again.");
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    if (!name.trim()) {
      setAuthError("Enter your name.");
      return;
    }
    if (codeInput.trim().toLowerCase() !== String(storedCode).toLowerCase()) {
      setAuthError("That access code doesn't match.");
      return;
    }
    setAuthStage("in");
  }

  if (authStage === "checking") {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: INK, opacity: 0.7 }}>
          <Loader2 className="spin" size={18} />
          <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Opening the ledger…</span>
        </div>
        <style>{spinCss}</style>
      </Shell>
    );
  }

  if (authStage === "login") {
    return (
      <Shell>
        <div style={authCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BookOpen size={22} color={BRASS} />
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: INK, margin: 0 }}>
              Two Tongues
            </h1>
          </div>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#5B6660", fontSize: 14, margin: "0 0 22px" }}>
            Enter your name and the shared access code to open the dictionary.
          </p>
          <form onSubmit={handleLogin}>
            <label style={labelStyle}>Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Omar"
              style={inputStyle}
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
            />
            <label style={labelStyle}>
              <KeyRound size={13} style={{ marginInlineEnd: 5, verticalAlign: -2 }} />
              Access code
            </label>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter the code"
              style={inputStyle}
              type="text"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
            {authError && <div style={errorStyle}>{authError}</div>}
            <button type="submit" disabled={busy} style={primaryBtnStyle} onClick={handleLogin}>
              <LogIn size={16} />
              Enter
            </button>
          </form>
        </div>
        <style>{spinCss}</style>
      </Shell>
    );
  }

  return (
    <MainView
      name={name}
      entries={entries}
      entriesLoaded={entriesLoaded}
      section={section}
      setSection={setSection}
      query={query}
      setQuery={setQuery}
      showAdd={showAdd}
      setShowAdd={setShowAdd}
      persistEntries={persistEntries}
      saveError={saveError}
    />
  );
}

function Shell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(34,48,43,0.06) 1px, transparent 0)",
        backgroundSize: "18px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

const authCardStyle = {
  width: "100%",
  maxWidth: 380,
  background: CARD,
  border: "1px solid rgba(34,48,43,0.15)",
  borderRadius: 4,
  padding: "28px 26px",
  boxShadow: "0 2px 0 rgba(34,48,43,0.06), 0 12px 30px -14px rgba(34,48,43,0.35)",
};

const labelStyle = {
  display: "block",
  fontFamily: "'Source Sans 3', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#5B6660",
  margin: "14px 0 6px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  fontFamily: "'Source Sans 3', sans-serif",
  fontSize: 15,
  color: INK,
  background: "#fff",
  border: "1px solid rgba(34,48,43,0.25)",
  borderRadius: 3,
  outline: "none",
};

const errorStyle = {
  marginTop: 12,
  fontFamily: "'Source Sans 3', sans-serif",
  fontSize: 13,
  color: "#8A3A3A",
  background: "#F6E7E5",
  border: "1px solid #E3B9B4",
  borderRadius: 3,
  padding: "8px 10px",
};

const primaryBtnStyle = {
  marginTop: 20,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px 14px",
  fontFamily: "'Source Sans 3', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  background: INK,
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
};

const spinCss = `
.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
input:focus { border-color: ${BRASS} !important; box-shadow: 0 0 0 3px rgba(180,136,75,0.18); }
* { box-sizing: border-box; }
`;

function MainView({
  name,
  entries,
  entriesLoaded,
  section,
  setSection,
  query,
  setQuery,
  showAdd,
  setShowAdd,
  persistEntries,
  saveError,
}) {
  const cfg = SECTIONS[section];
  const sectionEntries = useMemo(
    () => entries.filter((e) => e.section === section),
    [entries, section]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sectionEntries;
    return sectionEntries.filter(
      (e) =>
        e.word.toLowerCase().includes(q) ||
        (e.meaning || "").toLowerCase().includes(q) ||
        (e.definition || "").toLowerCase().includes(q)
    );
  }, [sectionEntries, query]);

  const grouped = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      const key = firstLetterKey(e.word, section);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    for (const k in map) {
      map[k].sort((a, b) => a.word.localeCompare(b.word, section === "ar-ar" ? "ar" : "en"));
    }
    return map;
  }, [filtered, section]);

  const availableLetters = useMemo(() => new Set(Object.keys(grouped)), [grouped]);
  const letterRefs = useRef({});

  function jumpTo(letter) {
    const el = letterRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleAdd(newEntry) {
    const next = [...entries, { ...newEntry, id: uid(), section, addedBy: name, addedAt: Date.now() }];
    await persistEntries(next);
    setShowAdd(false);
  }

  async function handleDelete(id) {
    const next = entries.filter((e) => e.id !== id);
    await persistEntries(next);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Source Sans 3', sans-serif" }}>
      <style>{spinCss}</style>

      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(34,48,43,0.15)",
          background: PAPER,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <BookOpen size={20} color={BRASS} />
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 600, color: INK, margin: 0 }}>
                Two Tongues
              </h1>
            </div>
            <div style={{ fontSize: 13, color: "#5B6660" }}>
              Signed in as <strong style={{ color: INK }}>{name}</strong>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {Object.entries(SECTIONS).map(([key, s]) => {
              const active = key === section;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSection(key);
                    setQuery("");
                  }}
                  style={{
                    padding: "9px 18px",
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: active ? s.accent : "#8A9189",
                    background: active ? CARD : "transparent",
                    border: "1px solid rgba(34,48,43,0.15)",
                    borderBottom: active ? `1px solid ${CARD}` : "1px solid rgba(34,48,43,0.15)",
                    borderRadius: "4px 4px 0 0",
                    marginBottom: -1,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {s.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 20px 0" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search
              size={16}
              color="#8A9189"
              style={{ position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${cfg.shortLabel}…`}
              dir={section === "ar-ar" ? "rtl" : "auto"}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                fontSize: 14,
                border: "1px solid rgba(34,48,43,0.25)",
                borderRadius: 3,
                background: "#fff",
                color: INK,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: cfg.accent,
              border: "none",
              borderRadius: 3,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} /> Add word
          </button>
        </div>
        {saveError && (
          <div style={{ ...errorStyle, marginTop: 10 }}>{saveError}</div>
        )}
      </div>

      {/* Body: letter rail + list */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 60px", display: "flex", gap: 18 }}>
        <nav
          style={{
            flex: "0 0 34px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "sticky",
            top: 130,
            alignSelf: "flex-start",
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          {cfg.letters.map((l) => {
            const has = availableLetters.has(l);
            return (
              <button
                key={l}
                disabled={!has}
                onClick={() => jumpTo(l)}
                style={{
                  fontFamily: section === "ar-ar" ? "'Amiri', serif" : "'Fraunces', serif",
                  fontSize: 13,
                  padding: "2px 0",
                  border: "none",
                  background: "none",
                  color: has ? cfg.accent : "rgba(34,48,43,0.25)",
                  fontWeight: has ? 700 : 400,
                  cursor: has ? "pointer" : "default",
                  textAlign: "center",
                }}
              >
                {l}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          {!entriesLoaded ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#5B6660", padding: "30px 0" }}>
              <Loader2 className="spin" size={18} />
              <span>Loading entries…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasQuery={!!query.trim()} onAdd={() => setShowAdd(true)} accent={cfg.accent} />
          ) : (
            (section === "ar-ar" ? cfg.letters : cfg.letters)
              .filter((l) => grouped[l])
              .map((letter) => (
                <div key={letter} ref={(el) => (letterRefs.current[letter] = el)} style={{ marginBottom: 26 }}>
                  <div
                    style={{
                      fontFamily: section === "ar-ar" ? "'Amiri', serif" : "'Fraunces', serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: cfg.accent,
                      borderBottom: `1px solid ${cfg.accentSoft}`,
                      paddingBottom: 4,
                      marginBottom: 10,
                    }}
                  >
                    {letter}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {grouped[letter].map((e) => (
                      <EntryCard key={e.id} entry={e} cfg={cfg} onDelete={() => handleDelete(e.id)} />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {showAdd && <AddModal cfg={cfg} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
    </div>
  );
}

function EntryCard({ entry, cfg, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div
      style={{
        background: CARD,
        border: "1px solid rgba(34,48,43,0.12)",
        borderInlineStart: `3px solid ${cfg.accent}`,
        borderRadius: 3,
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span
            dir={cfg.wordDir}
            style={{ fontFamily: cfg.wordFont, fontSize: 18, fontWeight: 600, color: INK }}
          >
            {entry.word}
          </span>
          <ChevronRight size={13} color="#B7BDB4" style={{ flexShrink: 0 }} />
          <span
            dir={cfg.meaningDir}
            style={{ fontFamily: cfg.meaningFont, fontSize: 17, color: "#3C4A43" }}
          >
            {entry.meaning}
          </span>
        </div>
        {entry.definition && (
          <p
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 14,
              color: "#6B746C",
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}
          >
            {entry.definition}
          </p>
        )}
        <div style={{ fontSize: 11, color: "#9AA098", marginTop: 8 }}>
          added by {entry.addedBy}
        </div>
      </div>
      <button
        onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
        onBlur={() => setConfirmDel(false)}
        title={confirmDel ? "Click again to confirm" : "Delete"}
        style={{
          flexShrink: 0,
          alignSelf: "flex-start",
          border: "none",
          background: confirmDel ? "#E3B9B4" : "transparent",
          color: confirmDel ? "#8A3A3A" : "#B7BDB4",
          borderRadius: 3,
          padding: 6,
          cursor: "pointer",
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function EmptyState({ hasQuery, onAdd, accent }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#6B746C",
        border: "1px dashed rgba(34,48,43,0.25)",
        borderRadius: 4,
      }}
    >
      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: INK, marginBottom: 6 }}>
        {hasQuery ? "No entries match your search" : "This dictionary is empty"}
      </p>
      <p style={{ fontSize: 14, marginBottom: 18 }}>
        {hasQuery ? "Try a different word." : "Be the first to add a word."}
      </p>
      {!hasQuery && (
        <button
          onClick={onAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: accent,
            border: "none",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> Add word
        </button>
      )}
    </div>
  );
}

function AddModal({ cfg, onClose, onSubmit }) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [definition, setDefinition] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      setError("Word and meaning are both required.");
      return;
    }
    setSaving(true);
    await onSubmit({ word: word.trim(), meaning: meaning.trim(), definition: definition.trim() });
    setSaving(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(34,48,43,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: CARD,
          borderRadius: 4,
          padding: "24px 24px 22px",
          boxShadow: "0 20px 50px -12px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: INK, margin: 0 }}>
            Add to {cfg.label}
          </h2>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#8A9189" }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
          <label style={labelStyle}>Word *</label>
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={cfg.wordPlaceholder}
            dir={cfg.wordDir}
            style={{ ...inputStyle, fontFamily: cfg.wordFont, fontSize: 16 }}
            autoFocus
          />
          <label style={labelStyle}>Meaning *</label>
          <input
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder={cfg.meaningPlaceholder}
            dir={cfg.meaningDir}
            style={{ ...inputStyle, fontFamily: cfg.meaningFont, fontSize: 16 }}
          />
          <label style={labelStyle}>Definition (optional)</label>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="شرح إضافي أو مثال"
            dir="rtl"
            rows={3}
            style={{ ...inputStyle, fontFamily: "'Amiri', serif", fontSize: 15, resize: "vertical" }}
          />
          {error && <div style={errorStyle}>{error}</div>}
          <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, background: cfg.accent }}>
            {saving ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}
            Save word
          </button>
        </form>
      </div>
    </div>
  );
}
