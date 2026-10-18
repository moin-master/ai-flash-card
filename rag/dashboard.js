(() => {
  const $ = (id) => document.getElementById(id);
  const ID = document.body.dataset.deck;
  const cards = (window.CARDS || {})[ID] || [];

  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
  const status = read(`flashcards:${ID}`);
  const stars = read(`flashcards:${ID}:stars`);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const known = cards.filter((c) => status[c.id] === "known");
  const review = cards.filter((c) => status[c.id] === "review");
  const starred = cards.filter((c) => stars[c.id]);
  const fresh = cards.filter((c) => !status[c.id]);
  const pct = cards.length ? Math.round((known.length / cards.length) * 100) : 0;

  // numbers
  $("bigRing").style.setProperty("--p", `${pct}%`);
  $("bigPct").textContent = `${pct}%`;
  $("bigSub").textContent = `${known.length} / ${cards.length} mastered`;
  $("sKnown").textContent = known.length;
  $("sReview").textContent = review.length;
  $("sStar").textContent = starred.length;
  $("sNew").textContent = fresh.length;

  // main button: continue where it makes sense
  const started = known.length + review.length > 0;
  $("ctaText").textContent = started ? "Continue flash cards" : "Start flash cards";
  const next = fresh[0];
  if (started && next) $("cta").href = `rag-flash-card.html#${encodeURIComponent(next.id)}`;

  const off = (el) => { el.classList.add("off"); el.removeAttribute("href"); };
  if (!review.length) off($("studyReview"));
  if (!starred.length) off($("studyStar"));

  // by topic (tags, in deck order)
  const tags = [];
  cards.forEach((c) => { if (!tags.includes(c.tag)) tags.push(c.tag); });
  $("topics").innerHTML = tags.map((t) => {
    const all = cards.filter((c) => c.tag === t);
    const k = all.filter((c) => status[c.id] === "known").length;
    const r = all.filter((c) => status[c.id] === "review").length;
    return `
      <div class="topic">
        <div class="topic-top"><b>${esc(t || "Other")}</b><span>${k}/${all.length}${r ? ` · ✖ ${r}` : ""}</span></div>
        <div class="tbar"><i style="width:${(k / all.length) * 100}%"></i></div>
      </div>`;
  }).join("");

  // lists link straight to a card
  const list = (el, items, empty) => {
    el.innerHTML = items.length
      ? items.map((c) => `<a class="row" href="rag-flash-card.html#${encodeURIComponent(c.id)}"><span>${esc(c.term)}</span><em>${esc(c.tag || "")}</em></a>`).join("")
      : `<p class="empty">${empty}</p>`;
  };
  list($("reviewList"), review, "Nothing here. Swipe a card left to add it.");
  list($("starList"), starred, "Double-tap a card to star it.");

  $("clear").addEventListener("click", () => {
    if (!confirm("Clear RAG Got it and Review marks? Your ⭐ stars stay.")) return;
    try { localStorage.removeItem(`flashcards:${ID}`); } catch {}
    location.reload();
  });
})();
