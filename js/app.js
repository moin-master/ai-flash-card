(() => {
  const feed = document.getElementById("feed");
  const deckName = document.getElementById("deckName");
  const counter = document.getElementById("counter");
  const barFill = document.getElementById("barFill");

  const SWIPE_PX = 90;
  let deck = null;
  let allCards = [];
  let cards = [];
  let status = {};
  let stars = {};
  let reviewOnly = false;
  let starOnly = false;
  let views = {};
  let viewTimer = null;
  const seenNow = new Set(); // a card counts once per visit to the page

  const storeKey = (id) => `flashcards:${id}`;
  const load = (id) => { try { return JSON.parse(localStorage.getItem(storeKey(id))) || {}; } catch { return {}; } };
  const save = () => { try { localStorage.setItem(storeKey(deck.id), JSON.stringify(status)); localStorage.setItem("flashcards:last", deck.id); } catch {} };
  const starKey = (id) => `flashcards:${id}:stars`;
  const loadStars = (id) => { try { return JSON.parse(localStorage.getItem(starKey(id))) || {}; } catch { return {}; } };
  const saveStars = () => { try { localStorage.setItem(starKey(deck.id), JSON.stringify(stars)); } catch {} };

  const viewKey = (id) => `flashcards:${id}:views`;
  const posKey = (id) => `flashcards:${id}:pos`;
  const loadViews = (id) => { try { return JSON.parse(localStorage.getItem(viewKey(id))) || {}; } catch { return {}; } };
  const saveViews = () => { try { localStorage.setItem(viewKey(deck.id), JSON.stringify(views)); localStorage.setItem("flashcards:last", deck.id); } catch {} };
  const savePos = (cid) => { try { localStorage.setItem(posKey(deck.id), cid); } catch {} };
  const loadPos = (id) => { try { return localStorage.getItem(posKey(id)) || ""; } catch { return ""; } };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // escape first, then turn **word** into bold
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  async function init() {
    const id = document.body.dataset.deck;
    deck = (window.DECKS || []).find((d) => d.id === id);
    allCards = deck ? (window.CARDS || {})[id] : null;
    if (!allCards) {
      feed.innerHTML = '<p class="msg">Could not load cards.</p>';
      return;
    }
    status = load(deck.id);
    try { localStorage.setItem("flashcards:last", deck.id); } catch {}
    stars = loadStars(deck.id);
    views = loadViews(deck.id);
    deckName.textContent = `${deck.emoji} ${deck.title}`;
    // dashboard links: ?mode=review | ?mode=starred, and #card-id to jump to one card
    const mode = new URLSearchParams(location.search).get("mode");
    reviewOnly = mode === "review";
    starOnly = mode === "starred";
    render();
    // a #card-id wins; otherwise resume where you stopped last time
    const wanted = decodeURIComponent(location.hash.slice(1)) || (reviewOnly || starOnly ? "" : loadPos(deck.id));
    const at = cards.findIndex((c) => c.id === wanted);
    if (at > 0) { feed.scrollTop = at * feed.clientHeight; updateProgress(); }
    scheduleView();
  }

  function render() {
    cards = reviewOnly ? allCards.filter((c) => status[c.id] === "review")
      : starOnly ? allCards.filter((c) => stars[c.id])
      : allCards;
    feed.innerHTML = "";
    cards.forEach((c, i) => feed.appendChild(cardSlide(c, i)));
    feed.appendChild(endSlide());
    feed.scrollTop = 0;
    updateProgress(0);
  }

  function cardSlide(c, i) {
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.dataset.index = i;
    slide.innerHTML = `
      <article class="card" data-id="${c.id}">
        <span class="stamp know">GOT IT ✔</span>
        <span class="stamp again">REVIEW ✖</span>
        <div class="tag-row"><span class="tag">${esc(c.tag || "Concept")}</span><span class="tag-right"><span class="views${views[c.id] ? "" : " hide"}">👁 <i>${views[c.id] || 0}</i></span><span class="star-badge" aria-label="Starred">⭐</span></span></div>
        <h2 class="term">${rich(c.term)}</h2>
        <div class="label why">🎤 INTERVIEW ANSWER</div>
        ${Array.isArray(c.explain)
          ? `<ul class="example answer">${c.explain.map((e) => `<li>${rich(e)}</li>`).join("")}</ul>`
          : `<p class="explain">${rich(c.explain)}</p>`}
        ${c.example ? `<div class="label eg">🔥 REAL LIFE</div>
        <ul class="example">${c.example.map((e) => `<li>${rich(e)}</li>`).join("")}</ul>` : ""}
        <div class="hints"><span class="l">◀ review</span><span class="u">⬆ next</span><span class="r">got it ▶</span></div>
      </article>`;
    const card = slide.querySelector(".card");
    paint(card, status[c.id]);
    paintStar(card, c.id);
    attachSwipe(card, c.id);
    return slide;
  }

  function endSlide() {
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.id = "endSlide";
    slide.innerHTML = `<article class="card end"></article>`;
    return slide;
  }

  function fillEnd() {
    const known = allCards.filter((c) => status[c.id] === "known").length;
    const review = allCards.filter((c) => status[c.id] === "review").length;
    const end = document.querySelector("#endSlide .card");
    if (!end) return;
    end.innerHTML = `
      <h2 class="term">${known === allCards.length ? "All done 🎉" : "Nice work 💪"}</h2>
      <div class="stats">
        <div class="stat k"><b>${known}</b><span>GOT IT</span></div>
        <div class="stat r"><b>${review}</b><span>REVIEW</span></div>
      </div>
      <button class="btn" id="btnReview" ${review ? "" : "disabled"}>Study ✖ review cards</button>
      <button class="btn ghost" id="btnAll">${reviewOnly || starOnly ? "Back to all cards" : "Start over"}</button>`;
    end.querySelector("#btnReview").onclick = () => { reviewOnly = true; starOnly = false; render(); };
    end.querySelector("#btnAll").onclick = () => {
      if (!reviewOnly && !starOnly) { status = {}; save(); savePos(""); }
      reviewOnly = false; starOnly = false; render();
    };
  }

  function paint(card, s) {
    card.classList.toggle("done", !!s);
    card.classList.toggle("is-known", s === "known");
    card.classList.toggle("is-review", s === "review");
  }

  function mark(card, id, s) {
    status[id] = s;
    save();
    paint(card, s);
    card.classList.remove("left", "right");
    card.style.transform = "";
    updateProgress();
    const slide = card.closest(".slide");
    setTimeout(() => slide.nextElementSibling?.scrollIntoView({ behavior: "smooth" }), 200);
  }

  function attachSwipe(card, id) {
    let x0 = 0, y0 = 0, dx = 0, maxMove = 0, active = false, horizontal = null;

    card.addEventListener("pointerdown", (e) => {
      active = true; horizontal = null; dx = 0; maxMove = 0;
      x0 = e.clientX; y0 = e.clientY;
    });

    card.addEventListener("pointermove", (e) => {
      if (!active) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      maxMove = Math.max(maxMove, Math.abs(mx), Math.abs(my));
      if (horizontal === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
        horizontal = Math.abs(mx) > Math.abs(my) * 1.5;
        if (horizontal) { card.setPointerCapture(e.pointerId); card.classList.add("dragging"); }
      }
      if (!horizontal) return;
      dx = mx;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
      card.classList.toggle("right", dx > SWIPE_PX * 0.6);
      card.classList.toggle("left", dx < -SWIPE_PX * 0.6);
    });

    const end = () => {
      if (!active) return;
      active = false;
      card.classList.remove("dragging");
      if (horizontal && Math.abs(dx) > SWIPE_PX) {
        mark(card, id, dx > 0 ? "known" : "review");
      } else {
        card.style.transform = "";
        card.classList.remove("left", "right");
      }
    };
    // double-tap (touch) or double-click (mouse) toggles the star
    let lastTap = 0, lastToggle = 0;
    const star = () => {
      const now = Date.now();
      if (now - lastToggle < 150) return; // both paths can fire for one gesture
      lastToggle = now;
      toggleStar(card, id);
    };
    card.addEventListener("pointerup", () => {
      const wasTap = active && !horizontal && maxMove < 15; // finger jitter is not a swipe
      end();
      if (!wasTap) return;
      const now = Date.now();
      if (now - lastTap < 400) { lastTap = 0; star(); }
      else lastTap = now;
    });
    card.addEventListener("pointercancel", end);
    card.addEventListener("dblclick", (e) => { e.preventDefault(); star(); });
  }

  function toggleStar(card, id) {
    if (stars[id]) delete stars[id]; else stars[id] = true;
    saveStars();
    paintStar(card, id);
    const pop = document.createElement("div");
    pop.className = "star-pop" + (stars[id] ? "" : " off");
    pop.textContent = "⭐";
    card.appendChild(pop);
    setTimeout(() => pop.remove(), 650);
    updateProgress();
  }

  function paintStar(card, id) {
    card.classList.toggle("starred", !!stars[id]);
  }

  function updateProgress(forceIndex) {
    const known = cards.filter((c) => status[c.id] === "known").length;
    barFill.style.width = cards.length ? `${(known / cards.length) * 100}%` : "0%";
    const idx = forceIndex ?? currentIndex();
    const starred = cards.filter((c) => stars[c.id]).length;
    counter.textContent = idx >= cards.length ? "done" : `${idx + 1} / ${cards.length}  ·  ✔ ${known}  ·  ⭐ ${starred}`;
    if (idx >= cards.length) fillEnd();
  }

  function scheduleView() {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(recordView, 700); // only count a card you actually stopped on
  }

  function recordView() {
    const c = cards[currentIndex()];
    if (!c) return;
    if (!reviewOnly && !starOnly) savePos(c.id);
    if (seenNow.has(c.id)) return;
    seenNow.add(c.id);
    views[c.id] = (views[c.id] || 0) + 1;
    saveViews();
    const chip = feed.querySelector(`.card[data-id="${c.id}"] .views`);
    if (chip) { chip.classList.remove("hide"); chip.querySelector("i").textContent = views[c.id]; }
  }

  function currentIndex() {
    return Math.min(Math.round(feed.scrollTop / feed.clientHeight), cards.length);
  }

  feed.addEventListener("scroll", () => { updateProgress(); scheduleView(); }, { passive: true });
  init();
})();
