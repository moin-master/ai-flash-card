(async () => {
  const box = document.getElementById("decks");
  const $ = (id) => document.getElementById(id);

  const load = (id) => {
    try { return JSON.parse(localStorage.getItem(`flashcards:${id}`)) || {}; } catch { return {}; }
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

  let totalKnown = 0, totalReview = 0, live = 0, firstLive = null, resumeDeck = null;

  for (const d of decks) {
    const el = document.createElement(d.soon ? "div" : "a");
    el.className = "deck-tile" + (d.soon ? " soon" : "");
    let meta = "Coming soon";
    let pct = 0;

    if (!d.soon) {
      el.href = d.page;
      live++;
      firstLive ||= d;
      try {
        await loadScript(d.script);
        const cards = window.CARDS[d.id];
        const ids = new Set(cards.map((c) => c.id));
        const vals = Object.entries(load(d.id)).filter(([k]) => ids.has(k)).map(([, v]) => v);
        const known = vals.filter((v) => v === "known").length;
        const review = vals.filter((v) => v === "review").length;
        totalKnown += known; totalReview += review;
        pct = Math.round((known / cards.length) * 100);
        meta = `${cards.length} cards · ✔ ${known} · ✖ ${review}`;
        if (known + review > 0 && !resumeDeck) resumeDeck = d;
      } catch { meta = "Cards unavailable"; }
    }

    el.innerHTML = `
      ${d.soon ? '<span class="sticker">SOON</span>' : ""}
      <span class="ring" style="--p:${pct}%"><span>${d.emoji}</span></span>
      <span class="deck-info"><b>${d.title}</b><small>${d.blurb}</small><em>${meta}</em></span>
      <span class="deck-go">${d.soon ? "🔒" : "→"}</span>`;
    box.appendChild(el);
  }

  $("sKnown").textContent = totalKnown;
  $("sReview").textContent = totalReview;
  $("sDecks").textContent = live;

  // main button: continue if the user already started, otherwise start the first live deck
  const target = resumeDeck || firstLive;
  if (target) {
    $("cta").href = target.page;
    $("ctaText").textContent = `${resumeDeck ? "Continue" : "Start"} ${target.title} cards`;
  }
})();
