import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   BANTER — social-skills trainer (Duolingo × Quizlet)
   Prototype: core loop = flashcards → daily challenge → unlock
   Palette: light brown → dark brown, banana-yellow accent
   ============================================================ */

const C = {
  bg: "#F2E7D8",        // light sand-brown
  bgDeep: "#E8D7BE",
  card: "#FFF9F0",
  tan: "#D9B48F",
  mid: "#B08760",
  brown: "#8B5E3C",
  dark: "#5C3A21",
  darkest: "#3B2416",
  banana: "#F5C242",
  bananaDeep: "#E0A81E",
  green: "#5F9E54",
  red: "#C4553B",
  cream: "#F7EEDF",
};

const CATEGORIES = [
  { id: "sports", name: "Sports", emoji: "🏈" },
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "film", name: "Film", emoji: "🎬" },
  { id: "pop", name: "Pop Culture", emoji: "⭐" },
  { id: "biz", name: "Business", emoji: "💼" },
  { id: "trivia", name: "Trivia", emoji: "🧠" },
];

const TOTAL_LEVELS = 8;
const FREE_LEVELS = 5;
const PASS_NEEDED = 3; // of 4
const NAV_SCREENS = ["home", "briefing", "leaderboard", "profile"];

/* --- Flashcard pools (front / back / conversation tip) --- */
const CARDS = {
  sports: [
    { f: "Hail Mary", b: "A desperate, long-shot play — usually a last-second deep pass in football.", t: "\u201cAsking for a raise on my first day was a total Hail Mary.\u201d" },
    { f: "Hat trick", b: "Three goals by one player in a single game (hockey, soccer).", t: "\u201cThat's her third win this month — a real hat trick.\u201d" },
    { f: "Full-court press", b: "Aggressive defense over the whole basketball court; by extension, all-out effort.", t: "\u201cSales is doing a full-court press to close the quarter.\u201d" },
    { f: "Moneyball", b: "Using data over gut instinct to build a team — from the 2003 book about the Oakland A's.", t: "\u201cWe took a Moneyball approach to hiring.\u201d" },
    { f: "GOAT", b: "Greatest Of All Time — the endless debate starter (Jordan vs. LeBron, Brady, Serena…).", t: "Ask \u201cWho's your GOAT?\u201d and any sports fan will talk for ten minutes." },
    { f: "Down to the wire", b: "Decided at the very last moment — from horse racing's finish wire.", t: "\u201cThe deadline went right down to the wire.\u201d" },
  ],
  music: [
    { f: "One-hit wonder", b: "An artist known for a single big song and little else.", t: "\u201cIs that band legit, or a one-hit wonder?\u201d" },
    { f: "B-side", b: "The lesser-known flip side of a single; now any deep cut.", t: "\u201cHer B-sides are honestly better than the album.\u201d" },
    { f: "Earworm", b: "A song that gets stuck in your head on loop.", t: "\u201cThat chorus is a certified earworm.\u201d" },
    { f: "Headliner", b: "The main act of a show or festival; openers play first.", t: "\u201cWho's headlining the festival this year?\u201d" },
    { f: "Unplugged", b: "An acoustic, stripped-down performance — popularized by MTV.", t: "\u201cI'd love to hear that song unplugged.\u201d" },
    { f: "Drop", b: "The bass-heavy payoff moment in electronic music — also \u2018to release\u2019 an album.", t: "\u201cHer new single drops Friday.\u201d" },
  ],
  film: [
    { f: "MacGuffin", b: "An object everyone chases that mostly exists to drive the plot (the briefcase, the ring).", t: "\u201cThe treasure map is pure MacGuffin.\u201d" },
    { f: "Cold open", b: "A scene that starts before the titles or intro.", t: "\u201cThat episode's cold open was better than the whole finale.\u201d" },
    { f: "Sleeper hit", b: "A film nobody expected to succeed that quietly blows up.", t: "\u201cIt made $300M on a tiny budget — total sleeper hit.\u201d" },
    { f: "Fourth wall", b: "The invisible wall between characters and audience; \u2018breaking\u2019 it means talking to the camera.", t: "\u201cDeadpool breaks the fourth wall constantly.\u201d" },
    { f: "Easter egg", b: "A hidden reference or in-joke tucked into a film or game.", t: "\u201cThe end credits are full of Easter eggs for fans.\u201d" },
    { f: "Box office bomb", b: "A film that loses serious money in theaters.", t: "\u201cGreat cast, but it bombed at the box office.\u201d" },
  ],
  pop: [
    { f: "Main character energy", b: "Acting like the protagonist of your own movie — confident, a little theatrical.", t: "\u201cShe walked in with serious main character energy.\u201d" },
    { f: "Soft launch", b: "Hinting at something (usually a relationship) online without confirming it.", t: "\u201cHe soft-launched his girlfriend with an elbow in one photo.\u201d" },
    { f: "Canceled", b: "Publicly boycotted after a controversy — severity varies wildly.", t: "Use with care: \u201cIs he actually canceled or just trending?\u201d" },
    { f: "Stan", b: "A super-fan (from the Eminem song). Verb and noun.", t: "\u201cI stan that show — watched it twice.\u201d" },
    { f: "It's giving…", b: "Slang for \u2018it has the vibe of\u2019 — fill in the blank.", t: "\u201cThis café? It's giving Parisian side street.\u201d" },
    { f: "Rizz", b: "Charisma, especially in flirting. Short for cha-RIZ-ma.", t: "\u201cHe asked for her number in one line — unreal rizz.\u201d" },
  ],
  biz: [
    { f: "Circle back", b: "To return to a topic later — the king of meeting phrases.", t: "\u201cLet's circle back on budget once numbers land.\u201d" },
    { f: "Low-hanging fruit", b: "The easiest wins available.", t: "\u201cFix the login bug first — it's low-hanging fruit.\u201d" },
    { f: "Runway", b: "How long a company can operate before cash runs out.", t: "\u201cThe startup has about 14 months of runway.\u201d" },
    { f: "Synergy", b: "When combined efforts produce more than the sum of parts. (Use ironically among friends.)", t: "\u201cThe merger promises synergy — we'll see.\u201d" },
    { f: "Bandwidth", b: "Capacity to take on work.", t: "\u201cI don't have bandwidth this week — can it wait?\u201d" },
    { f: "Pivot", b: "A sharp change in business strategy.", t: "\u201cThey pivoted from DVDs to streaming. Worked out.\u201d" },
  ],
  trivia: [
    { f: "Occam's razor", b: "The simplest explanation is usually right.", t: "\u201cOccam's razor says he just forgot, not that it's a conspiracy.\u201d" },
    { f: "Placebo effect", b: "Feeling better because you believe a treatment works.", t: "\u201cSugar pills helped — classic placebo effect.\u201d" },
    { f: "Serendipity", b: "A happy accident; finding good things you weren't looking for.", t: "\u201cMeeting my cofounder at that airport was pure serendipity.\u201d" },
    { f: "Dunning-Kruger", b: "Knowing a little makes people overconfident; experts underrate themselves.", t: "\u201cDay-two chess players trash-talking? Dunning-Kruger.\u201d" },
    { f: "Butterfly effect", b: "Tiny causes, huge downstream consequences.", t: "\u201cOne missed train and I met my wife — butterfly effect.\u201d" },
    { f: "Zeitgeist", b: "The defining spirit or mood of an era.", t: "\u201cThat show just captured the zeitgeist.\u201d" },
  ],
};

/* --- Challenge question pools --- */
const QUESTIONS = {
  sports: [
    { q: "A coworker says their pitch was 'a total Hail Mary.' They mean it was…", o: ["Carefully planned", "A desperate long shot", "Guaranteed to work", "A team effort"], a: 1 },
    { q: "Three goals by one player in a single game is a…", o: ["Grand slam", "Triple double", "Hat trick", "Turkey"], a: 2 },
    { q: "'Moneyball' refers to building a team using…", o: ["Big salaries", "Data and stats", "Fan votes", "Veteran instinct"], a: 1 },
    { q: "'Down to the wire' comes from which sport?", o: ["Boxing", "Horse racing", "Tennis", "Golf"], a: 1 },
    { q: "A 'full-court press' at work means…", o: ["Taking a break", "An all-out effort", "Working remotely", "Quiet quitting"], a: 1 },
    { q: "GOAT stands for…", o: ["Game Over At Ten", "Greatest Of All Time", "Go Out And Try", "Great Offense And Tackling"], a: 1 },
  ],
  music: [
    { q: "An artist famous for exactly one song is a…", o: ["Headliner", "One-hit wonder", "Session player", "Opener"], a: 1 },
    { q: "'Her new album drops Friday' means it…", o: ["Gets removed", "Gets released", "Gets remixed", "Goes on sale"], a: 1 },
    { q: "An 'earworm' is…", o: ["A bad review", "A catchy song stuck in your head", "A pirated track", "A concert bug"], a: 1 },
    { q: "The 'headliner' at a festival is…", o: ["The first act", "The sound engineer", "The main act", "The MC"], a: 2 },
    { q: "An 'unplugged' set means the artist plays…", o: ["Acoustic", "Lip-synced", "With lasers", "A capella only"], a: 0 },
    { q: "A 'B-side' originally referred to…", o: ["A backup band", "The flip side of a vinyl single", "A bonus tour date", "Plan B for a show"], a: 1 },
  ],
  film: [
    { q: "The briefcase everyone chases but never explains is a classic…", o: ["Red herring", "MacGuffin", "Cameo", "Cliffhanger"], a: 1 },
    { q: "A show that starts with a scene before the title sequence has a…", o: ["Cold open", "Hard cut", "Flash-forward", "Teaser trailer"], a: 0 },
    { q: "A 'sleeper hit' is a film that…", o: ["Puts people to sleep", "Succeeds unexpectedly", "Wins every award", "Flops twice"], a: 1 },
    { q: "When Deadpool talks to the camera, he's…", o: ["Ad-libbing", "Breaking the fourth wall", "Cold opening", "Gaslighting"], a: 1 },
    { q: "A hidden in-joke for attentive fans is an…", o: ["Outtake", "Easter egg", "End credit", "Insert shot"], a: 1 },
    { q: "A 'box office bomb'…", o: ["Wins big", "Loses money in theaters", "Goes straight to streaming", "Gets re-released"], a: 1 },
  ],
  pop: [
    { q: "Posting a hand-on-coffee-cup photo of a new partner is a…", o: ["Hard launch", "Soft launch", "Cold open", "Photo dump"], a: 1 },
    { q: "'He's got rizz' means he has…", o: ["Money", "Charisma", "Followers", "A podcast"], a: 1 },
    { q: "To 'stan' something is to…", o: ["Boycott it", "Be a super-fan of it", "Review it", "Ignore it"], a: 1 },
    { q: "'It's giving cozy autumn' means…", o: ["It ruined autumn", "It has cozy-autumn vibes", "It's literally October", "It's a gift"], a: 1 },
    { q: "'Main character energy' describes someone who is…", o: ["Shy and quiet", "Confidently the star of their own story", "Always late", "Off the grid"], a: 1 },
    { q: "If a celebrity is 'canceled,' they are…", o: ["Retired", "Publicly boycotted after controversy", "Off social media", "Between projects"], a: 1 },
  ],
  biz: [
    { q: "'Let's circle back' most nearly means…", o: ["Cancel it", "Discuss it later", "Approve it now", "Escalate it"], a: 1 },
    { q: "'Low-hanging fruit' refers to…", o: ["Cheap snacks", "The easiest wins", "Junior staff", "Old projects"], a: 1 },
    { q: "A startup's 'runway' is…", o: ["Its office space", "Months of cash left", "Its launch event", "Its ad budget"], a: 1 },
    { q: "'I don't have bandwidth' means…", o: ["Bad wifi", "No capacity for more work", "No opinion", "No budget"], a: 1 },
    { q: "Netflix moving from DVDs to streaming is a famous…", o: ["Pivot", "Merger", "Buyout", "Recall"], a: 0 },
    { q: "'Synergy' promises that combining efforts will…", o: ["Cut all jobs", "Produce more than the sum of parts", "Double costs", "Slow things down"], a: 1 },
  ],
  trivia: [
    { q: "Occam's razor says to prefer…", o: ["The oldest theory", "The simplest explanation", "The expert's view", "The wildest idea"], a: 1 },
    { q: "Feeling better from a sugar pill you believe in is the…", o: ["Halo effect", "Placebo effect", "Butterfly effect", "Anchoring effect"], a: 1 },
    { q: "Beginners overrating their skill is called…", o: ["Imposter syndrome", "Dunning-Kruger", "Groupthink", "Sunk cost"], a: 1 },
    { q: "A lucky, unplanned discovery is…", o: ["Serendipity", "Déjà vu", "Nostalgia", "Karma"], a: 0 },
    { q: "'Zeitgeist' means…", o: ["A German ghost", "The spirit of an era", "A time zone", "A design trend"], a: 1 },
    { q: "Tiny causes with huge consequences describe the…", o: ["Domino theory", "Butterfly effect", "Snowball tax", "Ripple rule"], a: 1 },
  ],
};

/* ---------- Milo the monkey (SVG mascot) ---------- */
function Milo({ size = 84, mood = "idle" }) {
  const mouth =
    mood === "happy" ? (
      <path d="M46 74 Q60 88 74 74" stroke={C.darkest} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    ) : mood === "sad" ? (
      <path d="M48 80 Q60 70 72 80" stroke={C.darkest} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M50 76 Q60 84 70 76" stroke={C.darkest} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    );
  const anim = mood === "happy" ? "miloParty 0.6s ease infinite" : "miloBob 2.4s ease-in-out infinite";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: anim, display: "block" }} aria-label="Milo the monkey">
      <circle cx="20" cy="52" r="15" fill={C.brown} />
      <circle cx="20" cy="52" r="8" fill={C.tan} />
      <circle cx="100" cy="52" r="15" fill={C.brown} />
      <circle cx="100" cy="52" r="8" fill={C.tan} />
      <circle cx="60" cy="60" r="40" fill={C.brown} />
      <ellipse cx="60" cy="70" rx="27" ry="23" fill="#EED5AE" />
      <ellipse cx="60" cy="44" rx="17" ry="13" fill="#EED5AE" />
      <path d="M52 24 Q60 12 68 24" stroke={C.dark} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="50" r="5.5" fill={C.darkest} />
      <circle cx="72" cy="50" r="5.5" fill={C.darkest} />
      <circle cx="50" cy="48" r="1.8" fill="#fff" />
      <circle cx="74" cy="48" r="1.8" fill="#fff" />
      <ellipse cx="54" cy="65" rx="2.5" ry="3.5" fill={C.mid} />
      <ellipse cx="66" cy="65" rx="2.5" ry="3.5" fill={C.mid} />
      {mouth}
      {mood === "happy" && <ellipse cx="60" cy="79" rx="7" ry="5" fill={C.dark} />}
    </svg>
  );
}

/* ---------- tiny UI atoms ---------- */
const Pill = ({ children, bg = C.cream, color = C.dark, style }) => (
  <span style={{ background: bg, color, borderRadius: 999, padding: "5px 12px", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5, ...style }}>{children}</span>
);

function Btn({ children, onClick, kind = "primary", disabled, style }) {
  const base = {
    primary: { background: C.banana, color: C.darkest, boxShadow: `0 4px 0 ${C.bananaDeep}` },
    dark: { background: C.dark, color: C.cream, boxShadow: `0 4px 0 ${C.darkest}` },
    ghost: { background: "transparent", color: C.dark, boxShadow: "none", border: `2px solid ${C.tan}` },
  }[kind];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none", borderRadius: 16, padding: "14px 20px", fontSize: 16, fontWeight: 900,
        fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer", width: "100%",
        opacity: disabled ? 0.5 : 1, transition: "transform .08s", letterSpacing: 0.3, ...base, ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "translateY(3px)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {children}
    </button>
  );
}

/* ---------- main app ---------- */
export default function BanterApp() {
  const [screen, setScreen] = useState("home"); // home | deck | quiz | result | ad | paywall
  const [cat, setCat] = useState("pop");
  const [level, setLevel] = useState(1);
  const [user, setUser] = useState({
    xp: 0, bananas: 12, streak: 0, longestStreak: 0, premium: false, lastChallenge: null,
    challengesPassed: 0, simsDone: 0, joined: Date.now(),
    progress: { sports: 1, music: 1, film: 1, pop: 1, biz: 1, trivia: 1 }, // highest unlocked
  });
  const [toast, setToast] = useState(null);
  const loaded = useRef(false);

  /* persistence via localStorage (per-browser; best-effort) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("banter-save");
      if (raw) {
        const saved = JSON.parse(raw);
        delete saved.lastSim; // clear stale sim-lock from earlier build
        setUser(saved);
      }
    } catch (e) { /* first run, or storage blocked (private mode) */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem("banter-save", JSON.stringify(user)); } catch (e) { /* storage blocked */ }
  }, [user]);

  const say = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const today = () => new Date().toDateString();
  const doneToday = user.lastChallenge === today();

  const openLevel = (lv, premiumLocked, locked) => {
    if (premiumLocked && !user.premium) { setScreen("paywall"); return; }
    if (locked) { say("Pass the previous level to unlock this one 🍌"); return; }
    setLevel(lv);
    setScreen("deck");
  };

  const finishQuiz = (passed, score) => {
    if (passed) {
      setUser((u) => {
        const nu = { ...u, xp: u.xp + 10 * score + 20, bananas: u.bananas + 5, challengesPassed: (u.challengesPassed || 0) + 1 };
        if (u.progress[cat] === level && level < TOTAL_LEVELS) nu.progress = { ...u.progress, [cat]: level + 1 };
        if (u.lastChallenge !== today()) { nu.streak = u.streak + 1; nu.lastChallenge = today(); }
        nu.longestStreak = Math.max(u.longestStreak || 0, nu.streak);
        return nu;
      });
    }
    setScreen("result");
    window.__banterLast = { passed, score };
  };

  const S = { screen, setScreen, cat, setCat, level, user, setUser, openLevel, finishQuiz, say, doneToday };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bg}, ${C.bgDeep})`, display: "flex", justifyContent: "center", fontFamily: "'Avenir Next','Nunito','Trebuchet MS',system-ui,sans-serif", color: C.darkest }}>
      <style>{`
        @keyframes miloBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes miloParty { 0%,100%{transform:rotate(-6deg) translateY(0)} 50%{transform:rotate(6deg) translateY(-8px)} }
        @keyframes popIn { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes vineSway { 0%,100%{transform:rotate(0)} 50%{transform:rotate(1.2deg)} }
        @keyframes confetti { to { transform: translateY(340px) rotate(720deg); opacity: 0 } }
        @keyframes toastUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        button:focus-visible { outline: 3px solid ${C.bananaDeep}; outline-offset: 2px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400, minHeight: "100vh", background: C.bg, boxShadow: "0 0 40px rgba(59,36,22,.25)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Header user={user} onPro={() => setScreen("paywall")} />
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: NAV_SCREENS.includes(screen) ? (!user.premium && screen === "home" ? 136 : 72) : 16 }}>
          {screen === "home" && <Home {...S} />}
          {screen === "deck" && <Deck {...S} />}
          {screen === "quiz" && <Quiz {...S} />}
          {screen === "result" && <Result {...S} />}
          {screen === "ad" && <AdScreen {...S} />}
          {screen === "paywall" && <Paywall {...S} />}
          {screen === "sim" && <MiloSim {...S} />}
          {screen === "briefing" && <Briefing {...S} />}
          {screen === "leaderboard" && <Leaderboard {...S} />}
          {screen === "profile" && <Profile {...S} />}
        </div>
        {!user.premium && screen === "home" && <BannerAd onPro={() => setScreen("paywall")} />}
        {NAV_SCREENS.includes(screen) && <BottomNav screen={screen} setScreen={setScreen} premium={user.premium} />}
        {toast && (
          <div style={{ position: "absolute", bottom: 96, left: 20, right: 20, background: C.darkest, color: C.cream, borderRadius: 14, padding: "12px 16px", fontWeight: 700, textAlign: "center", animation: "toastUp .25s ease", zIndex: 40 }}>{toast}</div>
        )}
      </div>
    </div>
  );
}

/* ---------- header ---------- */
function Header({ user, onPro }) {
  return (
    <div style={{ background: C.dark, padding: "14px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34 }}><Milo size={34} /></div>
        <span style={{ color: C.cream, fontWeight: 900, fontSize: 20, letterSpacing: 0.5 }}>Banter</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Pill bg={C.darkest} color="#FF9B54">🔥 {user.streak}</Pill>
        <Pill bg={C.darkest} color={C.banana}>⚡ {user.xp}</Pill>
        <Pill bg={C.darkest} color={C.banana}>🍌 {user.bananas}</Pill>
        {user.premium ? (
          <Pill bg={C.banana} color={C.darkest}>PRO</Pill>
        ) : (
          <button onClick={onPro} style={{ background: C.banana, border: "none", borderRadius: 999, padding: "5px 12px", fontWeight: 900, fontSize: 13, color: C.darkest, cursor: "pointer", fontFamily: "inherit" }}>Go Pro</button>
        )}
      </div>
    </div>
  );
}

/* ---------- home: category tabs + vine level path ---------- */
function Home({ cat, setCat, user, openLevel, doneToday }) {
  const unlocked = user.progress[cat];
  const nodes = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const xFor = (i) => 200 + Math.sin(i * 1.05) * 105; // winding vine
  const yFor = (i) => 70 + i * 92;
  const path = nodes.map((lv, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(i)}`).join(" ");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 14px 6px" }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ flex: "0 0 auto", border: "none", fontFamily: "inherit", cursor: "pointer", borderRadius: 14, padding: "9px 13px", fontWeight: 800, fontSize: 14, background: cat === c.id ? C.dark : C.card, color: cat === c.id ? C.cream : C.dark, boxShadow: cat === c.id ? `0 3px 0 ${C.darkest}` : `0 3px 0 ${C.tan}` }}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div style={{ margin: "10px 14px 0", background: C.card, borderRadius: 18, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, border: `2px solid ${C.tan}`, animation: "popIn .3s ease" }}>
        <Milo size={54} mood={doneToday ? "happy" : "idle"} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 15 }}>{doneToday ? "Streak safe for today! 🔥" : "Milo says: do today's challenge!"}</div>
          <div style={{ fontSize: 13, color: C.brown, fontWeight: 600 }}>{doneToday ? "Come back tomorrow to keep it alive." : "Study the flashcards, then pass the quiz to climb the vine."}</div>
        </div>
      </div>

      <svg viewBox="0 0 400 830" style={{ width: "100%", display: "block", animation: "vineSway 6s ease-in-out infinite", transformOrigin: "top center" }}>
        <path d={path} stroke={C.mid} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={path} stroke={C.tan} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 14" />
        {nodes.map((lv, i) => {
          const isPremium = lv > FREE_LEVELS;
          const isLocked = lv > unlocked;
          const isCurrent = lv === unlocked;
          const passed = lv < unlocked;
          const fill = passed ? C.green : isCurrent ? C.banana : isPremium ? C.darkest : C.card;
          const label = passed ? "✓" : isPremium && !user.premium ? "👑" : isLocked ? "🔒" : lv;
          return (
            <g key={lv} onClick={() => openLevel(lv, isPremium, isLocked && !(isPremium && !user.premium))} style={{ cursor: "pointer" }}>
              <circle cx={xFor(i)} cy={yFor(i)} r="34" fill={C.darkest} opacity="0.18" transform="translate(0 5)" />
              <circle cx={xFor(i)} cy={yFor(i)} r="34" fill={fill} stroke={C.dark} strokeWidth="3.5" />
              <text x={xFor(i)} y={yFor(i) + 8} textAnchor="middle" fontSize="24" fontWeight="900" fill={passed ? "#fff" : isPremium ? C.banana : C.darkest} fontFamily="inherit">{label}</text>
              {isCurrent && (
                <g transform={`translate(${xFor(i) - 26}, ${yFor(i) - 88})`}>
                  <Milo size={52} />
                </g>
              )}
              <text x={xFor(i)} y={yFor(i) + 56} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.brown} fontFamily="inherit">
                {isPremium ? "Pro level" : `Level ${lv}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- flashcard deck ---------- */
function Deck({ cat, level, setScreen, doneToday, say }) {
  const pool = CARDS[cat];
  const cards = [pool[(level - 1) % pool.length], pool[level % pool.length], pool[(level + 1) % pool.length]];
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const card = cards[idx];
  const catInfo = CATEGORIES.find((c) => c.id === cat);

  return (
    <div style={{ padding: 16, animation: "popIn .25s ease" }}>
      <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", fontFamily: "inherit", fontWeight: 800, color: C.brown, fontSize: 15, cursor: "pointer", padding: 0 }}>← Back to path</button>
      <h2 style={{ margin: "10px 0 2px", fontSize: 22, fontWeight: 900 }}>{catInfo.emoji} {catInfo.name} · Level {level}</h2>
      <div style={{ color: C.brown, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Card {idx + 1} of {cards.length} — tap to flip</div>

      <div onClick={() => setFlip(!flip)} style={{ perspective: 1000, cursor: "pointer" }}>
        <div style={{ position: "relative", height: 300, transformStyle: "preserve-3d", transition: "transform .5s", transform: flip ? "rotateY(180deg)" : "none" }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: C.card, border: `3px solid ${C.tan}`, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, boxShadow: `0 6px 0 ${C.tan}` }}>
            <Milo size={56} />
            <div style={{ fontSize: 26, fontWeight: 900, textAlign: "center", marginTop: 12 }}>{card.f}</div>
            <div style={{ marginTop: 10, color: C.mid, fontWeight: 700, fontSize: 13 }}>tap to reveal</div>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: C.dark, color: C.cream, borderRadius: 22, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, boxShadow: `0 6px 0 ${C.darkest}` }}>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.45 }}>{card.b}</div>
            <div style={{ marginTop: 16, background: "rgba(245,194,66,.15)", border: `1.5px solid ${C.banana}`, borderRadius: 14, padding: "10px 12px", fontSize: 14, color: C.banana, fontWeight: 700 }}>
              💬 Try it: {card.t}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Btn kind="ghost" onClick={() => { setFlip(false); setIdx(Math.max(0, idx - 1)); }} disabled={idx === 0} style={{ width: "auto", flex: 1 }}>← Prev</Btn>
        <Btn kind="ghost" onClick={() => { setFlip(false); setIdx(Math.min(cards.length - 1, idx + 1)); }} disabled={idx === cards.length - 1} style={{ width: "auto", flex: 1 }}>Next →</Btn>
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn onClick={() => (doneToday ? say("You already banked today's streak — this one's for XP! ⚡") || setScreen("quiz") : setScreen("quiz"))}>
          Start today's challenge 🎯
        </Btn>
      </div>
    </div>
  );
}

/* ---------- quiz ---------- */
function Quiz({ cat, level, finishQuiz, setScreen }) {
  const pool = QUESTIONS[cat];
  const qs = [0, 1, 2, 3].map((i) => pool[(level - 1 + i) % pool.length]);
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = qs[i];

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    const right = idx === q.a;
    const nScore = right ? score + 1 : score;
    const nHearts = right ? hearts : hearts - 1;
    if (right) setScore(nScore); else setHearts(nHearts);
    setTimeout(() => {
      setPicked(null);
      if (nHearts === 0) return finishQuiz(false, nScore);
      if (i + 1 >= qs.length) return finishQuiz(nScore >= PASS_NEEDED, nScore);
      setI(i + 1);
    }, 900);
  };

  return (
    <div style={{ padding: 16, animation: "popIn .25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setScreen("deck")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.brown }} aria-label="Quit quiz">✕</button>
        <div style={{ flex: 1, height: 14, background: C.bgDeep, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${(i / qs.length) * 100}%`, height: "100%", background: C.banana, transition: "width .4s", borderRadius: 999 }} />
        </div>
        <span style={{ fontWeight: 900, color: C.red }}>{"❤️".repeat(hearts)}{"🤍".repeat(3 - hearts)}</span>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <Milo size={56} mood={picked === null ? "idle" : picked === q.a ? "happy" : "sad"} />
        <div style={{ flex: 1, background: C.card, border: `2.5px solid ${C.tan}`, borderRadius: "4px 18px 18px 18px", padding: 14, fontWeight: 800, fontSize: 16, lineHeight: 1.4 }}>{q.q}</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {q.o.map((opt, idx) => {
          let bg = C.card, border = C.tan, color = C.darkest;
          if (picked !== null) {
            if (idx === q.a) { bg = C.green; border = C.green; color = "#fff"; }
            else if (idx === picked) { bg = C.red; border = C.red; color = "#fff"; }
          }
          return (
            <button key={idx} onClick={() => choose(idx)}
              style={{ fontFamily: "inherit", textAlign: "left", background: bg, color, border: `2.5px solid ${border}`, borderRadius: 14, padding: "13px 14px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 3px 0 ${picked !== null && (idx === q.a || idx === picked) ? "rgba(0,0,0,.25)" : C.tan}`, transition: "all .15s" }}>
              {opt}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, textAlign: "center", color: C.brown, fontWeight: 700, fontSize: 13 }}>Question {i + 1} of {qs.length} · pass with {PASS_NEEDED}+</div>
    </div>
  );
}

/* ---------- result ---------- */
function Result({ setScreen, user, level, cat }) {
  const { passed, score } = window.__banterLast || { passed: false, score: 0 };
  const confetti = passed ? Array.from({ length: 18 }, (_, i) => i) : [];
  return (
    <div style={{ padding: 24, textAlign: "center", position: "relative", animation: "popIn .3s ease" }}>
      {confetti.map((i) => (
        <div key={i} style={{ position: "absolute", top: -10, left: `${(i * 53) % 100}%`, width: 9, height: 9, background: [C.banana, C.green, C.tan, C.red][i % 4], borderRadius: i % 2 ? "50%" : 2, animation: `confetti ${1.6 + (i % 5) * 0.25}s ease-in ${i * 0.06}s forwards` }} />
      ))}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Milo size={110} mood={passed ? "happy" : "sad"} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "16px 0 6px" }}>{passed ? "Level cleared! 🍌" : "So close!"}</h2>
      <p style={{ color: C.brown, fontWeight: 700, margin: "0 0 18px" }}>
        {passed ? `You scored ${score}/4. +${10 * score + 20} XP, +5 bananas${level < TOTAL_LEVELS ? " — next level unlocked!" : "!"}` : `You scored ${score}/4 — you need ${PASS_NEEDED}. Review the cards and try again.`}
      </p>
      {passed && user.streak > 0 && <Pill bg={C.dark} color="#FF9B54" style={{ marginBottom: 18 }}>🔥 Streak: {user.streak} day{user.streak === 1 ? "" : "s"}</Pill>}
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {passed ? (
          <>
            <Btn onClick={() => setScreen("sim")}>Practice with Milo 🎙️</Btn>
            <Btn kind="ghost" onClick={() => setScreen(user.premium ? "home" : "ad")}>Continue</Btn>
          </>
        ) : (
          <>
            <Btn onClick={() => setScreen("deck")}>Review flashcards</Btn>
            <Btn kind="ghost" onClick={() => setScreen("quiz")}>Retry challenge</Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- mock interstitial ad ---------- */
function AdScreen({ setScreen }) {
  const [left, setLeft] = useState(5);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <div style={{ padding: 24, textAlign: "center", background: C.darkest, minHeight: "100%", color: C.cream, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.mid, fontWeight: 800, marginBottom: 12 }}>ADVERTISEMENT</div>
      <div style={{ background: C.dark, borderRadius: 18, padding: 28, border: `2px dashed ${C.mid}` }}>
        <div style={{ fontSize: 42 }}>🧃</div>
        <div style={{ fontWeight: 900, fontSize: 20, margin: "8px 0" }}>Jungle Juice Co.</div>
        <div style={{ color: C.tan, fontWeight: 600, fontSize: 14 }}>Placeholder interstitial — AdMob unit renders here in production.</div>
      </div>
      <div style={{ marginTop: 20 }}>
        {left > 0 ? (
          <div style={{ fontWeight: 800, color: C.tan }}>Skip in {left}…</div>
        ) : (
          <Btn onClick={() => setScreen("home")}>Skip ad ✕</Btn>
        )}
      </div>
      <button onClick={() => setScreen("paywall")} style={{ marginTop: 16, background: "none", border: "none", color: C.banana, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", fontSize: 14 }}>
        Remove ads with Banter Pro →
      </button>
    </div>
  );
}

/* ---------- banner ad ---------- */
function BannerAd({ onPro }) {
  return (
    <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, background: C.darkest, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 29, borderTop: `1px solid ${C.dark}` }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.5, color: C.mid, fontWeight: 800 }}>AD</div>
        <div style={{ color: C.cream, fontWeight: 800, fontSize: 13 }}>🍌 Banana Phone Cases — 20% off</div>
      </div>
      <button onClick={onPro} style={{ background: C.banana, border: "none", borderRadius: 10, padding: "7px 11px", fontWeight: 900, fontSize: 12, color: C.darkest, cursor: "pointer", fontFamily: "inherit" }}>Remove ads</button>
    </div>
  );
}

/* ---------- paywall ---------- */
function Paywall({ setScreen, setUser, say }) {
  const [plan, setPlan] = useState("yr");
  const perks = ["Levels 6–8 in every category", "Exclusive trending decks, updated daily", "No ads, ever", "Unlimited hearts + 2 streak freezes/mo", "Offline flashcard packs"];
  return (
    <div style={{ padding: 20, animation: "popIn .25s ease" }}>
      <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", fontFamily: "inherit", fontWeight: 800, color: C.brown, fontSize: 15, cursor: "pointer", padding: 0 }}>← Not now</button>
      <div style={{ textAlign: "center", margin: "6px 0 14px" }}>
        <div style={{ display: "inline-block" }}><Milo size={90} mood="happy" /></div>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: "8px 0 4px" }}>Banter <span style={{ color: C.bananaDeep }}>Pro</span> 👑</h2>
        <div style={{ color: C.brown, fontWeight: 700 }}>Unlock the whole jungle.</div>
      </div>
      <div style={{ background: C.card, borderRadius: 18, border: `2px solid ${C.tan}`, padding: 16, marginBottom: 14 }}>
        {perks.map((p) => (
          <div key={p} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", fontWeight: 700, fontSize: 14.5 }}>
            <span style={{ color: C.green, fontWeight: 900 }}>✓</span> {p}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {[{ id: "yr", label: "Annual", price: "$59.99/yr", sub: "≈ $5/mo · save 50%" }, { id: "mo", label: "Monthly", price: "$9.99/mo", sub: "cancel anytime" }].map((p) => (
          <button key={p.id} onClick={() => setPlan(p.id)}
            style={{ fontFamily: "inherit", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: plan === p.id ? "rgba(245,194,66,.22)" : C.card, border: `2.5px solid ${plan === p.id ? C.bananaDeep : C.tan}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{p.label} {p.id === "yr" && <span style={{ background: C.bananaDeep, color: "#fff", borderRadius: 8, fontSize: 11, padding: "2px 7px", marginLeft: 6 }}>BEST VALUE</span>}</div>
              <div style={{ color: C.brown, fontWeight: 700, fontSize: 12.5 }}>{p.sub}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{p.price}</div>
          </button>
        ))}
      </div>
      <Btn onClick={() => { setUser((u) => ({ ...u, premium: true })); say("Welcome to the jungle, Pro! 👑"); setScreen("home"); }}>
        Start free trial (demo)
      </Btn>
      <div style={{ textAlign: "center", color: C.mid, fontSize: 11.5, fontWeight: 700, marginTop: 10 }}>
        Prototype only — in production this opens StoreKit / Play Billing.
      </div>
    </div>
  );
}

/* ---------- AI conversation simulator ---------- */
function MiloSim({ cat, level, setScreen, user, setUser, say }) {
  const pool = CARDS[cat];
  const terms = [pool[(level - 1) % pool.length].f, pool[level % pool.length].f, pool[(level + 1) % pool.length].f];
  const catInfo = CATEGORIES.find((c) => c.id === cat);
  const todayStr = new Date().toDateString();
  const locked = !user.premium && user.lastSim === todayStr;

  const [msgs, setMsgs] = useState([]);           // { who: 'milo'|'you', text }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);      // { score, feedback }
  const history = useRef([]);                       // raw API messages
  const started = useRef(false);
  const scrollRef = useRef(null);

  const SYSTEM = `You are Milo, the upbeat monkey mascot of Banter, a social-skills app. Run a short roleplay so the learner can practice small talk about ${catInfo.name.toLowerCase()}. Play a realistic character (coworker, party guest, friend of a friend) who naturally brings the topic up. The learner is practicing these phrases: ${terms.join(", ")}. Keep every reply under 40 words, casual and warm. React naturally to what they say and give them openings to use the phrases. The learner gets 4 messages total. After their 4th message, set done to true and score them. Respond with ONLY a raw JSON object, no markdown, no backticks: {"reply": string, "done": boolean, "score": number 0-10 (only when done), "feedback": string (only when done; 2 warm, specific sentences: did they use a practice phrase naturally, keep the conversation flowing, and ask follow-up questions?)}`;

  const callMilo = async () => {
    setBusy(true); setError(null);
    try {
      // Calls our own serverless function (see api/milo.js), which holds the
      // Anthropic API key securely server-side. The browser never sees the key.
      const res = await fetch("/api/milo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM, messages: history.current }),
      });
      if (!res.ok) throw new Error("milo endpoint " + res.status);
      const data = await res.json();
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      history.current = [...history.current, { role: "assistant", content: text }];
      setMsgs((m) => [...m, { who: "milo", text: parsed.reply }]);
      if (parsed.done) {
        const sc = Math.max(0, Math.min(10, Math.round(parsed.score || 0)));
        setResult({ score: sc, feedback: parsed.feedback || "Nice practice session!" });
        setUser((u) => ({ ...u, xp: u.xp + sc * 2, bananas: u.bananas + (sc >= 6 ? 3 : 1), lastSim: todayStr, simsDone: (u.simsDone || 0) + 1 }));
      }
    } catch (e) {
      setError("Milo lost his train of thought. Tap retry.");
      history.current = history.current.slice(0, -0); // keep history; retry re-sends
    }
    setBusy(false);
  };

  useEffect(() => {
    if (locked || started.current) return;
    started.current = true;
    history.current = [{ role: "user", content: "Start the roleplay with your opening line." }];
    callMilo();
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, busy, result]);

  const send = () => {
    const text = input.trim();
    if (!text || busy || result) return;
    setInput("");
    setMsgs((m) => [...m, { who: "you", text }]);
    history.current = [...history.current, { role: "user", content: text }];
    callMilo();
  };

  const yourTurns = msgs.filter((m) => m.who === "you").length;

  if (locked) {
    return (
      <div style={{ padding: 24, textAlign: "center", animation: "popIn .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><Milo size={90} mood="sad" /></div>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: "14px 0 6px" }}>Milo needs a banana break 🍌</h2>
        <p style={{ color: C.brown, fontWeight: 700, marginBottom: 18 }}>Free plan includes one practice conversation per day. Go Pro for unlimited roleplay with Milo.</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Btn onClick={() => setScreen("paywall")}>Unlock unlimited practice 👑</Btn>
          <Btn kind="ghost" onClick={() => setScreen("home")}>Back to the vine</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "popIn .25s ease" }}>
      <div style={{ padding: "12px 16px 8px" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", fontFamily: "inherit", fontWeight: 800, color: C.brown, fontSize: 15, cursor: "pointer", padding: 0 }}>← End practice</button>
        <h2 style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 900 }}>🎙️ Practice: {catInfo.name}</h2>
        <div style={{ fontSize: 12.5, color: C.brown, fontWeight: 700 }}>
          Try to work in: {terms.map((t) => <Pill key={t} bg={C.bgDeep} style={{ marginRight: 4, fontSize: 11.5, padding: "3px 9px" }}>{t}</Pill>)}
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, justifyContent: m.who === "you" ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
            {m.who === "milo" && <div style={{ flexShrink: 0 }}><Milo size={34} /></div>}
            <div style={{ maxWidth: "78%", background: m.who === "you" ? C.banana : C.card, color: C.darkest, border: `2px solid ${m.who === "you" ? C.bananaDeep : C.tan}`, borderRadius: m.who === "you" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", padding: "10px 13px", fontWeight: 700, fontSize: 14.5, lineHeight: 1.4 }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flexShrink: 0 }}><Milo size={34} /></div>
            <div style={{ background: C.card, border: `2px solid ${C.tan}`, borderRadius: "4px 16px 16px 16px", padding: "10px 14px", fontWeight: 800, color: C.mid }}>Milo is typing…</div>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: C.red, fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>{error}</div>
            <Btn kind="ghost" onClick={callMilo} style={{ width: "auto", padding: "9px 18px" }}>Retry</Btn>
          </div>
        )}
        {result && (
          <div style={{ background: C.dark, color: C.cream, borderRadius: 18, padding: 18, textAlign: "center", animation: "popIn .3s ease" }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: C.tan }}>MILO'S VERDICT</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.banana, margin: "6px 0" }}>{result.score}/10</div>
            <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.45 }}>{result.feedback}</div>
            <div style={{ marginTop: 6, color: C.tan, fontWeight: 800, fontSize: 13 }}>+{result.score * 2} XP · +{result.score >= 6 ? 3 : 1} 🍌</div>
            <div style={{ marginTop: 12 }}>
              <Btn onClick={() => setScreen(user.premium ? "home" : "ad")}>Continue</Btn>
            </div>
          </div>
        )}
      </div>

      {!result && (
        <div style={{ padding: "10px 16px 16px", display: "flex", gap: 8, alignItems: "center", borderTop: `2px solid ${C.bgDeep}` }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={busy ? "Milo is thinking…" : `Your reply (${4 - yourTurns} left)…`}
            disabled={busy}
            style={{ flex: 1, fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "12px 14px", borderRadius: 14, border: `2.5px solid ${C.tan}`, background: C.card, color: C.darkest, outline: "none" }}
          />
          <button onClick={send} disabled={busy || !input.trim()} aria-label="Send reply"
            style={{ fontFamily: "inherit", background: C.banana, border: "none", borderRadius: 14, width: 48, height: 48, fontSize: 20, cursor: busy ? "wait" : "pointer", boxShadow: `0 3px 0 ${C.bananaDeep}`, opacity: busy || !input.trim() ? 0.5 : 1 }}>🍌</button>
        </div>
      )}
    </div>
  );
}

/* ---------- bottom navigation ---------- */
function BottomNav({ screen, setScreen, premium }) {
  const tabs = [
    { id: "home", icon: "🌴", label: "Learn" },
    { id: "briefing", icon: "📰", label: "Today" },
    { id: "leaderboard", icon: "🏆", label: "Ranks" },
    { id: "profile", icon: "🐵", label: "You" },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: C.dark, display: "flex", zIndex: 30, boxShadow: `0 -2px 12px rgba(59,36,22,.3)` }}>
      {tabs.map((t) => {
        const on = screen === t.id;
        return (
          <button key={t.id} onClick={() => setScreen(t.id)}
            style={{ flex: 1, border: "none", background: "none", fontFamily: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: on ? C.banana : C.tan, opacity: on ? 1 : 0.7 }}>
            <span style={{ fontSize: 21, filter: on ? "none" : "grayscale(.3)", transform: on ? "scale(1.15)" : "none", transition: "transform .15s" }}>{t.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: 800 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- daily briefing (swipeable "what people are talking about") ---------- */
const BRIEFING_CARDS = [
  { cat: "Sports", emoji: "⚽", headline: "World Cup hits the knockout rounds", tip: "The quarterfinals and semis are on this week. Safe opener: \u201cAre you following the World Cup at all?\u201d — then ask who they're pulling for.", tags: ["Messi", "England", "Morocco"] },
  { cat: "Sports", emoji: "🥊", headline: "Holloway vs. McGregor is finally happening", tip: "McGregor's first fight in five years. Even non-fans have an opinion on him — good low-stakes debate fuel.", tags: ["UFC", "comeback"] },
  { cat: "Film", emoji: "🏛️", headline: "Nolan's 'The Odyssey' lands July 17", tip: "Matt Damon as Odysseus, Homer by way of Christopher Nolan. Try: \u201cAre you a Nolan person, or is it all a bit much?\u201d", tags: ["Nolan", "Matt Damon"] },
  { cat: "Music", emoji: "💜", headline: "BTS announce first album in ~4 years", tip: "A huge return after the hiatus. Even a casual \u201cDid you see BTS are back?\u201d lands with a lot of people right now.", tags: ["BTS", "comeback tour"] },
  { cat: "Pop Culture", emoji: "👠", headline: "'Devil Wears Prada 2' is the water-cooler movie", tip: "Miranda and Andy are back. Great for: \u201cHave you seen it yet? No spoilers.\u201d — instant common ground.", tags: ["sequel", "Meryl Streep"] },
];

function Briefing({ setScreen, user }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(0);
  const total = user.premium ? BRIEFING_CARDS.length : 3;
  const card = BRIEFING_CARDS[i];
  const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const go = (d) => { const n = i + d; if (n < 0 || n >= total) return; setDir(d); setI(n); };

  return (
    <div style={{ padding: 16, animation: "popIn .25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Milo size={44} />
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 900 }}>Today's Banter</h2>
          <div style={{ fontSize: 12.5, color: C.brown, fontWeight: 700 }}>{dateStr} · what people are talking about</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, margin: "14px 0" }}>
        {Array.from({ length: total }).map((_, k) => (
          <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k <= i ? C.banana : C.bgDeep, transition: "background .3s" }} />
        ))}
      </div>

      <div key={i} style={{ background: C.card, border: `3px solid ${C.tan}`, borderRadius: 22, padding: 20, boxShadow: `0 6px 0 ${C.tan}`, minHeight: 300, animation: `${dir >= 0 ? "popIn" : "popIn"} .3s ease` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Pill bg={C.bgDeep}>{card.cat}</Pill>
          <div style={{ fontSize: 40 }}>{card.emoji}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.25, marginBottom: 14 }}>{card.headline}</div>
        <div style={{ background: "rgba(245,194,66,.15)", border: `1.5px solid ${C.banana}`, borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontWeight: 700, lineHeight: 1.45, color: C.dark }}>
          💬 {card.tip}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {card.tags.map((t) => <span key={t} style={{ fontSize: 12, fontWeight: 800, color: C.mid }}>#{t}</span>)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Btn kind="ghost" onClick={() => go(-1)} disabled={i === 0} style={{ width: "auto", flex: 1 }}>← Prev</Btn>
        {i < total - 1 ? (
          <Btn onClick={() => go(1)} style={{ width: "auto", flex: 1 }}>Next →</Btn>
        ) : (
          <Btn onClick={() => setScreen("home")} style={{ width: "auto", flex: 1 }}>Done 🍌</Btn>
        )}
      </div>

      {!user.premium && (
        <div onClick={() => setScreen("paywall")} style={{ marginTop: 14, textAlign: "center", background: C.dark, color: C.cream, borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontWeight: 800, fontSize: 13.5 }}>
          👑 Pro unlocks the full briefing ({BRIEFING_CARDS.length} stories daily, all categories)
        </div>
      )}
    </div>
  );
}

/* ---------- leaderboard (weekly, mocked bots + you) ---------- */
function Leaderboard({ user }) {
  const bots = [
    { name: "BananaBandit", xp: 940, emoji: "🙊" },
    { name: "ChatChampGio", xp: 720, emoji: "🦊" },
    { name: "SmallTalkSue", xp: 610, emoji: "🐨" },
    { name: "TriviaTornado", xp: 430, emoji: "🦁" },
    { name: "QuietQuokka", xp: 180, emoji: "🐹" },
    { name: "NewbieNate", xp: 60, emoji: "🐣" },
  ];
  const me = { name: "You", xp: user.xp, emoji: "🐵", you: true };
  const ranked = [...bots, me].sort((a, b) => b.xp - a.xp);
  const myRank = ranked.findIndex((r) => r.you) + 1;
  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ padding: 16, animation: "popIn .25s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h2 style={{ margin: "4px 0", fontSize: 22, fontWeight: 900 }}>🏆 Banana League</h2>
        <div style={{ color: C.brown, fontWeight: 700, fontSize: 13 }}>This week · top 3 advance to Coconut League</div>
      </div>

      <div style={{ background: C.dark, color: C.cream, borderRadius: 16, padding: "12px 16px", margin: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>You're <span style={{ color: C.banana }}>#{myRank}</span> of {ranked.length}</div>
        <div style={{ fontWeight: 900, color: C.banana }}>⚡ {user.xp} XP</div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {ranked.map((r, idx) => {
          const promo = idx < 3;
          return (
            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, background: r.you ? "rgba(245,194,66,.25)" : C.card, border: `2px solid ${r.you ? C.bananaDeep : C.tan}`, borderRadius: 14, padding: "11px 14px" }}>
              <div style={{ width: 26, textAlign: "center", fontWeight: 900, fontSize: idx < 3 ? 20 : 15, color: C.dark }}>{medal[idx] || idx + 1}</div>
              <div style={{ fontSize: 26 }}>{r.emoji}</div>
              <div style={{ flex: 1, fontWeight: 900, fontSize: 15.5 }}>{r.name}{r.you && " (you)"}</div>
              {promo && <span style={{ fontSize: 11, fontWeight: 800, color: C.green }}>▲ promo</span>}
              <div style={{ fontWeight: 800, color: C.brown }}>{r.xp}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", color: C.mid, fontSize: 11.5, fontWeight: 700, marginTop: 14 }}>
        Leaderboard resets Sunday · earn XP from challenges & Milo practice
      </div>
    </div>
  );
}

/* ---------- profile + achievements ---------- */
function Profile({ user, setScreen }) {
  const catsMastered = Object.values(user.progress).filter((v) => v > FREE_LEVELS).length;
  const totalLevelsCleared = Object.values(user.progress).reduce((s, v) => s + (v - 1), 0);

  const badges = [
    { id: "first", icon: "🌱", name: "First Steps", desc: "Pass your first challenge", got: (user.challengesPassed || 0) >= 1 },
    { id: "streak3", icon: "🔥", name: "On a Roll", desc: "Hit a 3-day streak", got: (user.longestStreak || 0) >= 3 },
    { id: "streak7", icon: "⚡", name: "Week Warrior", desc: "Hit a 7-day streak", got: (user.longestStreak || 0) >= 7 },
    { id: "chatter", icon: "🎙️", name: "Smooth Talker", desc: "Finish 3 Milo practices", got: (user.simsDone || 0) >= 3 },
    { id: "explorer", icon: "🧭", name: "Explorer", desc: "Clear 10 levels total", got: totalLevelsCleared >= 10 },
    { id: "master", icon: "👑", name: "Category Master", desc: "Finish a full category", got: catsMastered >= 1 },
    { id: "bananas", icon: "🍌", name: "Banana Hoarder", desc: "Stash 50 bananas", got: user.bananas >= 50 },
    { id: "polyglot", icon: "🌍", name: "Well-Rounded", desc: "Reach L3+ in every category", got: Object.values(user.progress).every((v) => v >= 3) },
  ];
  const earned = badges.filter((b) => b.got).length;

  const Stat = ({ big, label, color }) => (
    <div style={{ flex: 1, background: C.card, border: `2px solid ${C.tan}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: color || C.dark }}>{big}</div>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: C.brown }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: 16, animation: "popIn .25s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 14 }}>
        <div style={{ background: C.card, borderRadius: "50%", padding: 8, border: `3px solid ${C.tan}` }}><Milo size={72} mood="happy" /></div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Banter Learner</div>
        <div style={{ display: "flex", gap: 6 }}>
          {user.premium ? <Pill bg={C.banana} color={C.darkest}>👑 PRO</Pill> : <Pill bg={C.bgDeep}>Free plan</Pill>}
          <Pill bg={C.dark} color="#FF9B54">🔥 {user.streak} day streak</Pill>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Stat big={user.xp} label="Total XP" color={C.bananaDeep} />
        <Stat big={user.longestStreak || 0} label="Best Streak" color={C.red} />
        <Stat big={totalLevelsCleared} label="Levels Cleared" color={C.green} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Stat big={user.challengesPassed || 0} label="Challenges" />
        <Stat big={user.simsDone || 0} label="Milo Chats" />
        <Stat big={`${user.bananas}🍌`} label="Bananas" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>Achievements</h3>
        <span style={{ fontWeight: 800, color: C.brown, fontSize: 13 }}>{earned}/{badges.length} earned</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {badges.map((b) => (
          <div key={b.id} style={{ background: b.got ? C.card : C.bgDeep, border: `2px solid ${b.got ? C.banana : C.tan}`, borderRadius: 14, padding: "12px 10px", textAlign: "center", opacity: b.got ? 1 : 0.55, position: "relative" }}>
            <div style={{ fontSize: 30, filter: b.got ? "none" : "grayscale(1)" }}>{b.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 13.5, marginTop: 4 }}>{b.name}</div>
            <div style={{ fontSize: 11, color: C.brown, fontWeight: 700, marginTop: 2, lineHeight: 1.3 }}>{b.desc}</div>
            {b.got && <div style={{ position: "absolute", top: 6, right: 8, color: C.green, fontWeight: 900, fontSize: 13 }}>✓</div>}
          </div>
        ))}
      </div>

      {!user.premium && (
        <div onClick={() => setScreen("paywall")} style={{ marginTop: 16, textAlign: "center", background: C.dark, color: C.cream, borderRadius: 14, padding: "13px 14px", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>
          👑 Go Pro to unlock every category & badge
        </div>
      )}
    </div>
  );
}
