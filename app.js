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

  const storeKey = (id) => `flashcards:${id}`;
  const load = (id) => { try { return JSON.parse(localStorage.getItem(storeKey(id))) || {}; } catch { return {}; } };
  const save = () => { try { localStorage.setItem(storeKey(deck.id), JSON.stringify(status)); } catch {} };
  const starKey = (id) => `flashcards:${id}:stars`;
  const loadStars = (id) => { try { return JSON.parse(localStorage.getItem(starKey(id))) || {}; } catch { return {}; } };
  const saveStars = () => { try { localStorage.setItem(starKey(deck.id), JSON.stringify(stars)); } catch {} };

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
    stars = loadStars(deck.id);
    deckName.textContent = `${deck.emoji} ${deck.title}`;
    render();
  }

  function render() {
    cards = reviewOnly ? allCards.filter((c) => status[c.id] === "review") : allCards;
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
        <div class="tag-row"><span class="tag">${esc(c.tag || "Concept")}</span><span class="star-badge" aria-label="Starred">⭐</span></div>
        <h2 class="term">${esc(c.term)}</h2>
        <div class="label why">🎤 INTERVIEW ANSWER</div>
        <p class="explain">${rich(c.explain)}</p>
        <div class="label eg">🔥 REAL LIFE</div>
        <ul class="example">${c.example.map((e) => `<li>${rich(e)}</li>`).join("")}</ul>
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
      <button class="btn ghost" id="btnAll">${reviewOnly ? "Back to all cards" : "Start over"}</button>`;
    end.querySelector("#btnReview").onclick = () => { reviewOnly = true; render(); };
    end.querySelector("#btnAll").onclick = () => {
      if (!reviewOnly) { status = {}; save(); }
      reviewOnly = false; render();
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
    let x0 = 0, y0 = 0, dx = 0, active = false, horizontal = null;

    card.addEventListener("pointerdown", (e) => {
      active = true; horizontal = null; dx = 0;
      x0 = e.clientX; y0 = e.clientY;
    });

    card.addEventListener("pointermove", (e) => {
      if (!active) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
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
    // double-tap (or double-click) toggles the star
    let lastTap = 0;
    card.addEventListener("pointerup", () => {
      const wasTap = active && horizontal === null;
      end();
      if (!wasTap) return;
      const now = Date.now();
      if (now - lastTap < 320) { lastTap = 0; toggleStar(card, id); }
      else lastTap = now;
    });
    card.addEventListener("pointercancel", end);
    card.addEventListener("dblclick", (e) => e.preventDefault());
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

  function currentIndex() {
    return Math.min(Math.round(feed.scrollTop / feed.clientHeight), cards.length);
  }

  feed.addEventListener("scroll", () => updateProgress(), { passive: true });
  init();
})();
