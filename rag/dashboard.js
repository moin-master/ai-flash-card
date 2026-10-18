(() => {
  const $ = (id) => document.getElementById(id);
  const ID = document.body.dataset.deck;
  const cards = (window.CARDS || {})[ID] || [];

  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
  const status = read(`flashcards:${ID}`);
  const stars = read(`flashcards:${ID}:stars`);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n) => `${n} card${n === 1 ? "" : "s"}`;

  const known = cards.filter((c) => status[c.id] === "known");
  const review = cards.filter((c) => status[c.id] === "review");
  const starred = cards.filter((c) => stars[c.id]);
  const fresh = cards.filter((c) => !status[c.id]);
  const pct = cards.length ? Math.round((known.length / cards.length) * 100) : 0;

  // summary
  $("ring").style.setProperty("--p", `${pct}%`);
  $("bigPct").textContent = `${pct}%`;
  $("bigSub").textContent = `${known.length} / ${cards.length}`;
  $("sKnown").textContent = known.length;
  $("sReview").textContent = review.length;
  $("sStar").textContent = starred.length;
  $("sumLine").textContent = `${fresh.length} new · ${review.length} to review · ${known.length} learned`;

  // main button: jump to the next card you have not seen yet
  const started = known.length + review.length > 0;
  $("ctaText").textContent = started ? "Continue" : "Start flash cards";
  if (started && fresh[0]) $("cta").href = `rag-flash-card.html#${encodeURIComponent(fresh[0].id)}`;

  // study rows
  $("reviewNum").textContent = review.length;
  $("starNum").textContent = starred.length;
  $("newNum").textContent = fresh.length;
  if (review.length) $("reviewHint").textContent = "Tap to study";
  if (starred.length) $("starHint").textContent = "Tap to study";
  if (!review.length) $("studyReview").classList.add("off");
  if (!starred.length) $("studyStar").classList.add("off");
  if (fresh[0]) $("studyNew").href = `rag-flash-card.html#${encodeURIComponent(fresh[0].id)}`;
  else $("studyNew").classList.add("off");

  // topics (tags, in deck order)
  const tags = [];
  cards.forEach((c) => { if (!tags.includes(c.tag)) tags.push(c.tag); });
  $("topics").innerHTML = tags.map((t) => {
    const all = cards.filter((c) => c.tag === t);
    const k = all.filter((c) => status[c.id] === "known").length;
    const r = all.filter((c) => status[c.id] === "review").length;
    const first = all[0];
    return `
      <a class="row" href="rag-flash-card.html#${encodeURIComponent(first.id)}" style="--c:#32d74b">
        <span class="tx"><b>${esc(t || "Other")}</b><small>${k} of ${all.length} learned${r ? ` · ${r} to review` : ""}</small>
          <span class="row-bar"><i style="width:${(k / all.length) * 100}%"></i></span></span>
        <span class="chev">›</span>
      </a>`;
  }).join("");

  // lists link straight to a card
  const list = (el, items, empty) => {
    el.innerHTML = items.length
      ? items.map((c) => `<a class="row" href="rag-flash-card.html#${encodeURIComponent(c.id)}"><span class="tx"><b>${esc(c.term)}</b><small>${esc(c.tag || "")}</small></span><span class="chev">›</span></a>`).join("")
      : `<div class="row"><span class="tx"><small>${empty}</small></span></div>`;
  };
  list($("reviewList"), review, "Nothing here. Swipe a card left to add it.");
  list($("starList"), starred, "Double-tap a card to star it.");

  $("clear").addEventListener("click", () => {
    if (!confirm("Clear RAG Got it and Review marks? Your stars stay.")) return;
    try { localStorage.removeItem(`flashcards:${ID}`); } catch {}
    location.reload();
  });
})();
