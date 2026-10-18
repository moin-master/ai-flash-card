(async () => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  };

  // plain <script> loading works on file:// too (fetch does not)
  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  /* ---------- tabs ---------- */
  const TABS = ["home", "review", "starred"];
  function show(tab) {
    if (!TABS.includes(tab)) tab = "home";
    TABS.forEach((t) => {
      $(`view-${t}`).hidden = t !== tab;
      document.querySelector(`[data-tab="${t}"]`).classList.toggle("on", t === tab);
    });
    window.scrollTo(0, 0);
    try { history.replaceState(null, "", tab === "home" ? location.pathname : `#${tab}`); } catch {}
  }
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));

  /* ---------- data ---------- */
  const decks = window.DECKS || [];
  const tracks = $("decks");
  let known = 0, review = 0, starred = 0, total = 0;
  const live = [];
  const reviewItems = [], starItems = [];

  for (const d of decks) {
    const color = d.color || "#a78bfa";
    let pct = 0, meta = "Coming soon", progress = 0;

    if (!d.soon) {
      try {
        await loadScript(d.script);
        const cards = window.CARDS[d.id];
        const status = read(`flashcards:${d.id}`);
        const stars = read(`flashcards:${d.id}:stars`);
        const k = cards.filter((c) => status[c.id] === "known").length;
        const r = cards.filter((c) => status[c.id] === "review").length;
        const s = cards.filter((c) => stars[c.id]).length;
        known += k; review += r; starred += s; total += cards.length;
        pct = Math.round((k / cards.length) * 100);
        meta = `${cards.length} cards · ✔ ${k} · ✖ ${r} · ⭐ ${s}`;
        progress = k + r;
        cards.forEach((c) => {
          if (status[c.id] === "review") reviewItems.push({ d, c });
          if (stars[c.id]) starItems.push({ d, c });
        });
      } catch { meta = "Cards unavailable"; }
      live.push({ d, progress });
    }

    const el = document.createElement(d.soon ? "div" : "a");
    el.className = "track" + (d.soon ? " soon" : "");
    el.style.setProperty("--accent", color);
    if (!d.soon) el.href = d.page;
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
    tracks.appendChild(el);
  }

  /* ---------- summary ---------- */
  const pct = total ? Math.round((known / total) * 100) : 0;
  $("ring").style.setProperty("--p", `${pct}%`);
  $("oPct").textContent = `${pct}%`;
  $("sKnown").textContent = known;
  $("sReview").textContent = review;
  $("sStar").textContent = starred;
  $("oLine").textContent = `${known} of ${total} cards learned · ${live.length} of ${decks.length} tracks live`;

  let lastId = null;
  try { lastId = localStorage.getItem("flashcards:last"); } catch {}
  const target = live.find((x) => x.d.id === lastId) || live.find((x) => x.progress > 0) || live[0];
  if (target) {
    $("cta").href = target.d.page;
    $("ctaText").textContent = `${target.progress > 0 ? "Continue" : "Start"} ${target.d.title}`;
  }

  /* ---------- review + starred tabs ---------- */
  function fillList(el, items, empty) {
    if (!items.length) {
      el.innerHTML = `<div class="empty-state"><i>${empty.icon}</i><b>${empty.title}</b>${empty.text}</div>`;
      return;
    }
    const byDeck = {};
    items.forEach((x) => (byDeck[x.d.id] ||= { d: x.d, list: [] }).list.push(x.c));
    el.innerHTML = Object.values(byDeck).map(({ d, list }) => `
      <h2 class="gh">${d.title} · ${list.length}</h2>
      <div class="group">${list.map((c) => `
        <a class="row" href="${d.cards}#${encodeURIComponent(c.id)}" style="--c:${d.color || "#a78bfa"}">
          <span class="tx"><b>${esc(c.term)}</b><small>${esc(c.tag || "")}</small></span>
          <span class="chev">›</span>
        </a>`).join("")}
      </div>`).join("");
  }
  fillList($("reviewList"), reviewItems, { icon: "✨", title: "Nothing to review", text: "Swipe a card left and it shows up here." });
  fillList($("starList"), starItems, { icon: "⭐", title: "No starred cards", text: "Double-tap a card to star it." });

  const badge = $("badgeReview");
  badge.textContent = reviewItems.length;
  badge.hidden = !reviewItems.length;

  show(location.hash.slice(1));

  /* ---------- clear ---------- */
  $("clear").addEventListener("click", () => {
    if (!confirm("Clear all Got it and Review marks? Your stars stay.")) return;
    try { decks.forEach((d) => localStorage.removeItem(`flashcards:${d.id}`)); } catch {}
    location.reload();
  });
})();
