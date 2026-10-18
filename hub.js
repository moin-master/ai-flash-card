(async () => {
  const box = document.getElementById("decks");
  const $ = (id) => document.getElementById(id);

  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  };

  // plain <script> loading works on file:// too (fetch does not)
  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  const decks = window.DECKS || [];
  if (!decks.length) {
    box.innerHTML = '<p class="note">Could not load decks.</p>';
    return;
  }

  let known = 0, review = 0, starred = 0, total = 0;
  const live = [];   // decks that are playable, with their numbers

  for (const d of decks) {
    const el = document.createElement(d.soon ? "div" : "a");
    el.className = "track" + (d.soon ? " soon" : "");
    el.style.setProperty("--accent", d.color || "#a78bfa");
    let pct = 0;
    let meta = "Coming soon";

    if (!d.soon) {
      el.href = d.page;
      try {
        await loadScript(d.script);
        const cards = window.CARDS[d.id];
        const ids = new Set(cards.map((c) => c.id));
        const st = Object.entries(read(`flashcards:${d.id}`)).filter(([k]) => ids.has(k)).map(([, v]) => v);
        const k = st.filter((v) => v === "known").length;
        const r = st.filter((v) => v === "review").length;
        const s = Object.keys(read(`flashcards:${d.id}:stars`)).filter((x) => ids.has(x)).length;
        known += k; review += r; starred += s; total += cards.length;
        pct = Math.round((k / cards.length) * 100);
        meta = `${cards.length} cards · ✔ ${k} · ✖ ${r} · ⭐ ${s}`;
        live.push({ d, progress: k + r });
      } catch { meta = "Cards unavailable"; }
    }

    el.innerHTML = `
      ${d.soon ? '<span class="sticker">SOON</span>' : ""}
      <div class="t-head">
        <span class="t-badge">${d.emoji}</span>
        <span class="t-title"><b>${d.title}</b><small>${d.blurb}</small></span>
        <span class="t-go">${d.soon ? "🔒" : `${pct}%`}</span>
      </div>
      <div class="t-bar"><i style="width:${pct}%"></i></div>
      <div class="t-chips">${(d.topics || []).map((t) => `<span>${t}</span>`).join("")}</div>
      <div class="t-meta">${meta}</div>`;
    box.appendChild(el);
  }

  // overall progress card
  const pct = total ? Math.round((known / total) * 100) : 0;
  $("ring").style.setProperty("--p", `${pct}%`);
  $("oPct").textContent = `${pct}%`;
  $("sKnown").textContent = known;
  $("sReview").textContent = review;
  $("sStar").textContent = starred;
  $("oLine").textContent = `${known} of ${total} mastered · ${live.length} of ${decks.length} tracks live`;

  // main button: last deck you studied, else any deck you started, else the first live one
  let lastId = null;
  try { lastId = localStorage.getItem("flashcards:last"); } catch {}
  const target =
    live.find((x) => x.d.id === lastId) ||
    live.find((x) => x.progress > 0) ||
    live[0];
  if (target) {
    $("cta").href = target.d.page;
    $("ctaText").textContent = `${target.progress > 0 ? "Continue" : "Start"} ${target.d.title}`;
  }
})();

// clear Got it / Review marks for every deck (stars are kept)
document.getElementById("clear").addEventListener("click", () => {
  if (!confirm("Clear all Got it and Review marks? Your ⭐ stars stay.")) return;
  try {
    (window.DECKS || []).forEach((d) => localStorage.removeItem(`flashcards:${d.id}`));
  } catch {}
  location.reload();
});
