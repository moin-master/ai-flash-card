// Study notes page: renders window.NOTES[deck] as connected notes (one kitchen theme, five stations)
(() => {
  const STATIONS = {
    source: { icon: "🛒", name: "Source" },
    prep: { icon: "🔪", name: "Prep" },
    cook: { icon: "🔥", name: "Cook" },
    serve: { icon: "🍽️", name: "Serve" },
    inspect: { icon: "🧾", name: "Inspect" }
  };
  const THEMES = { rag: "", agentic: "blue", llm: "amber", javaai: "green" };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const id = new URLSearchParams(location.search).get("deck");
  const deck = (window.DECKS || []).find((d) => d.id === id);
  const notes = (window.NOTES || {})[id];
  const root = document.getElementById("root");

  if (!deck || !notes) {
    root.innerHTML = '<p class="sub">No notes for this deck yet.</p>';
    return;
  }

  document.body.dataset.deck = id;
  if (THEMES[id]) document.body.dataset.theme = THEMES[id];
  document.title = `${deck.title} · Study notes`;
  document.getElementById("back").href = deck.page.split("/").pop();
  document.getElementById("navTitle").textContent = `${deck.title} notes`;

  const nSections = notes.stations.reduce((n, s) => n + s.sections.length, 0);
  let step = 0;

  const rail = notes.stations.map((s) =>
    `<a href="#st-${s.id}"><span>${STATIONS[s.id].icon}</span><b>${STATIONS[s.id].name}</b></a>`).join('<i>›</i>');

  const stations = notes.stations.map((s) => {
    const sections = s.sections.map((sec) => {
      step += 1;
      return `
      <article class="nsec">
        <div class="nsec-head"><span class="num">${step}</span><h3>${esc(sec.title)}</h3></div>
        <ul class="nlist">${sec.bullets.map((b) => `<li>${rich(b)}</li>`).join("")}</ul>
        ${sec.next ? `<p class="nnext">➜ ${rich(sec.next)}</p>` : ""}
      </article>`;
    }).join("");
    return `
    <section class="nstation" id="st-${s.id}">
      <div class="nst-head">
        <span class="nst-icon">${STATIONS[s.id].icon}</span>
        <div><b>${STATIONS[s.id].name}</b><span>${esc(s.role)}</span></div>
      </div>
      ${sections}
    </section>`;
  }).join("");

  root.innerHTML = `
    <header class="large">
      <h1 class="hero">${notes.theme.emoji} <span class="grad">${esc(notes.theme.name)}</span></h1>
      <p class="sub">${deck.title} study notes · ${nSections} linked topics</p>
    </header>
    <div class="theme-card">
      <div class="label">🧠 ONE PICTURE TO REMEMBER</div>
      <p>${rich(notes.theme.pitch)}</p>
    </div>
    <div class="chain-card">
      <div class="label">🔗 THE WHOLE STORY IN ONE LINE</div>
      <p>${rich(notes.chain)}</p>
    </div>
    <nav class="rail" aria-label="Stations">${rail}</nav>
    ${stations}
    <a class="primary" href="${deck.cards.split("/").pop()}"><span class="p-left">🃏 Practise with flash cards</span><span>›</span></a>
    <footer class="foot">© Moin Master</footer>`;

  const nav = document.querySelector(".navbar");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
