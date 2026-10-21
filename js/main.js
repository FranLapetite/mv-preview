/* Mickaëlle Vallé : site vitrine. Le contenu vient de data/*.json (voir README). */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const PAGES = [
  ['index.html', 'Accueil', 'home'],
  ['a-propos.html', 'À propos', 'about'],
  ['accompagnements.html', 'Accompagnements', 'care'],
  ['lieux.html', 'Lieux', 'places'],
  ['infos-pratiques.html', 'Infos pratiques', 'practical'],
  ['blog.html', 'Blog', 'blog'],
  ['contact.html', 'Contact', 'contact']
];
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const getJSON = u => fetch(u, { cache: 'no-cache' }).then(r => r.json());
const mapSrc = q => 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
const todo = t => /compléter/i.test(t) ? `<span class="todo">${esc(t)}</span>` : esc(t);

function header(site, page) {
  const links = PAGES.map(([h, l, k]) => `<li><a href="${h}"${k === page || (page === 'article' && k === 'blog') ? ' aria-current="page"' : ''}>${l}</a></li>`).join('');
  $('#site-header').innerHTML = `<div class="wrap">
    <a class="logo" href="index.html" aria-label="Accueil"><strong>${esc(site.name)}</strong><span>PSYCHOMOTRICITÉ · PSYCHOLOGIE</span></a>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="nav" aria-label="Navigation principale"><ul>${links}</ul></nav></div>`;
  const b = $('.burger'), n = $('.nav');
  b.onclick = () => { const o = n.classList.toggle('open'); b.classList.toggle('open', o); b.setAttribute('aria-expanded', o); };
  const onScroll = () => $('#site-header').classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

function footer(site) {
  const route = p => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.mapQuery);
  const places = site.places.map(p => `<div class="f-place"><h3>${esc(p.name)}</h3>
      <p>${todo(p.street)}<br>${esc(p.city)}</p><a class="f-route" href="${route(p)}" target="_blank" rel="noopener">Itinéraire →</a></div>`).join('');
  const nav = PAGES.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('');
  $('#site-footer').innerHTML = `<div class="wrap">
    <div class="f-main">
      <div class="f-left">
        <p class="f-name">${esc(site.name)}</p>
        <p class="f-sub">${esc(site.title)}</p>
        <div class="f-contact"><a class="btn btn-light" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a>
          <a href="tel:${site.phoneHref}">${esc(site.phone)}</a><a href="mailto:${site.email}">${esc(site.email)}</a></div>
      </div>
      <div class="f-center">
        <div><h3>Horaires</h3><ul>${site.hours.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>
        <div><h3>Suivez-moi</h3><ul>${site.social.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul></div>
      </div>
      <div class="f-maps">${places}</div>
    </div>
    <nav class="f-nav" aria-label="Pages du site"><ul>${nav}</ul></nav>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.name)}</span><a href="mentions-legales.html">Mentions légales et RGPD</a></div></div>`;
}

function faq(site) {
  const el = $('#faq'); if (!el) return;
  el.innerHTML = site.faq.map(f => `<details class="reveal"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
}

function jsonld(site) {
  const add = o => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); };
  add({
    '@context': 'https://schema.org', '@type': ['LocalBusiness', 'MedicalBusiness'], name: site.name,
    description: site.tagline, telephone: site.phone, email: site.email,
    address: site.places.filter(p => !/compléter/i.test(p.street)).map(p => ({ '@type': 'PostalAddress', streetAddress: p.street, addressLocality: 'Paris', addressCountry: 'FR' })),
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '13:00', closes: '18:00' }
    ]
  });
  add({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: site.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
}

const R = {
  home(site, c) {
    const h = c.home, words = h.title.split(' ').map((w, i) => `<span class="w" style="animation-delay:${i * .18}s">${esc(w)}</span>`).join(' ');
    $('#main').innerHTML = `<section class="hero"><div class="hero-media" aria-hidden="true"><img class="hero-poster" src="images/hero.jpg" alt="" fetchpriority="high" onerror="this.remove()"><video class="hero-video" src="images/hero.mp4" poster="images/hero.jpg" autoplay muted loop playsinline preload="auto" onerror="this.remove()"></video></div><div class="wrap"><div>
      <span class="kicker">${esc(h.kicker)}</span><h1 aria-label="${esc(h.title)}">${words}</h1>
      <p class="lead">${esc(h.lead)}</p>
      <div class="btn-row"><a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a><a class="btn" href="lieux.html">Mes deux lieux</a></div></div></div>
      <button class="explore" data-target="#domaines">Explorer<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button></section>
      <section id="domaines"><div class="wrap"><h2 class="reveal">Mes accompagnements</h2>
      <div class="path-wrap"><svg class="dots" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,22 C8,22 10,38 16.5,38 S30,64 39,64 S52,36 61,36 S74,64 83.5,64 S96,34 100,34" vector-effect="non-scaling-stroke"/></svg><div class="grid">${h.domains.map(d => `<a class="card reveal" href="${d.href}"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></a>`).join('')}</div></div></div></section>
      <section class="cta-section"><div class="wrap"><div class="cta-band reveal"><div><h2>Un rendez-vous, une question ?</h2><p>Réservez en ligne en quelques clics, ou appelez-moi.</p></div>
      <div class="cta-actions"><a class="btn btn-light" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a><a class="cta-phone" href="tel:${site.phoneHref}">${esc(site.phone)}</a></div></div></div></section>
      <section class="alt"><div class="wrap"><h2 class="reveal">Questions fréquentes</h2><div id="faq"></div></div></section>`;
  },
  about(site, c) {
    const a = c.about;
    $('#main').innerHTML = `<section class="about-hero"><div class="wrap about-grid">
      <div><span class="kicker">${esc(a.kicker)}</span><h1>${esc(a.name)}</h1><p class="role">${esc(a.role)}</p>
      <p class="lead">${esc(a.intro)}</p>
      <ul class="tags">${a.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="btn-row"><a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a><a class="btn" href="accompagnements.html">Mes accompagnements</a></div></div>
      <figure class="portrait"><img src="images/mickaelle.jpg" alt="Portrait de ${esc(a.name)}" width="800" height="1000" fetchpriority="high" onerror="this.parentNode.classList.add('empty');this.remove()"><span class="portrait-empty">Photo à venir</span></figure></div></section>
      <section><div class="wrap"><h2 class="reveal">Mon parcours</h2>
      <ol class="timeline">${a.timeline.map(t => `<li class="reveal"><span class="t-label">${esc(t.label)}</span><div><h3>${esc(t.h)}</h3><p>${esc(t.p)}</p></div></li>`).join('')}</ol>
      <p class="ids reveal">Psychomotricienne : RPPS ${site.rpps}. Psychologue : ADELI / RPPS ${site.adeli}.</p></div></section>`;
  },
  care(site, c) {
    const list = c.accompagnements;
    const side = list.map(d => `<li><a href="#${d.id}" data-id="${d.id}">${esc(d.title)}</a></li>`).join('');
    const body = list.map(d => `<article class="domain reveal" id="${d.id}"><h2>${esc(d.title)}</h2>
      ${d.quote ? `<blockquote>${esc(d.quote)}</blockquote>` : ''}<p class="lead">${esc(d.intro)}</p>
      ${d.blocks.map((b, i) => b.list
        ? `<div class="block"><h3>${esc(b.h)}</h3><ul class="checks">${b.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`
        : `<details class="acc"${i === 0 ? ' open' : ''}><summary>${esc(b.h)}</summary><p>${esc(b.p)}</p></details>`).join('')}</article>`).join('');
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>Accompagnements</h1><p class="lead">Psychomotricité, psychologie, sensori-motricité et médiations spécifiques.</p></div></div>
      <section><div class="wrap care-layout"><aside class="care-nav" aria-label="Domaines"><ul>${side}</ul></aside>
      <div class="care-body">${body}<a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a></div></div></section>`;
    const links = [...document.querySelectorAll('.care-nav a')];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.dataset.id === en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.domain').forEach(d => io.observe(d));
  },
  places(site) {
    const route = p => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.mapQuery);
    const hours = p => p.hours && p.hours.length
      ? `<ul class="hours">${p.hours.map(h => `<li><span>${esc(h.day)}</span><span>${esc(h.time)}</span></li>`).join('')}</ul>`
      : `<p>${todo('Horaires à compléter')}</p>`;
    const row = (p, i) => `<section class="${i % 2 ? 'alt ' : ''}place-row"><div class="wrap place-grid${i % 2 ? ' flip' : ''}">
      <div class="map map-consent reveal" data-src="${mapSrc(p.mapQuery)}" data-title="Plan : ${esc(p.name)}"><p>Cette carte est fournie par Google Maps. En l'affichant, vous acceptez que Google dépose des cookies et reçoive votre adresse IP.</p><button class="btn" type="button">Afficher la carte</button></div>
      <div class="place-info reveal"><span class="kicker">Lieu ${i + 1}</span><h2>${esc(p.name)}</h2><p class="place-tag">${esc(p.tagline)}</p>
        <p class="place-addr">${todo(p.street)}<br>${esc(p.city)}</p>
        <div class="place-cols"><div><h3>Horaires</h3>${hours(p)}</div>
        <div><h3>Accès</h3><dl class="access"><dt>Métro</dt><dd>${todo(p.access.metro)}</dd><dt>Bus</dt><dd>${todo(p.access.bus)}</dd><dt>Accessibilité</dt><dd>${todo(p.access.pmr)}</dd></dl></div></div>
        <div class="btn-row"><a class="btn" href="${route(p)}" target="_blank" rel="noopener">Itinéraire</a><a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a></div></div></div></section>`;
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>Mes deux lieux</h1><p class="lead">Je reçois à Paris 13e, sur deux lieux. Les jours de consultation sont les mêmes, le lieu est précisé lors de la prise de rendez-vous.</p>
      <ul class="tags">${site.hours.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div></div>${site.places.map(row).join('')}`;
  },
  practical(site, c) {
    const p = c.practical;
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>${esc(p.title)}</h1><p class="lead">${esc(p.lead)}</p></div></div>
      <section><div class="wrap"><div class="practical-grid"><ol class="timeline steps">${p.steps.map(t => `<li class="reveal"><span class="t-label">${esc(t.label)}</span><div><h3>${esc(t.h)}</h3><p>${esc(t.p)}</p></div></li>`).join('')}</ol>
      <div class="notes">${p.notes.map(n => `<div class="note reveal"><h3>${esc(n.h)}</h3><p>${esc(n.p)}</p></div>`).join('')}</div></div>
      <div class="btn-row"><a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a><a class="btn" href="contact.html">Me contacter</a></div></div></section>
      <section class="alt"><div class="wrap"><h2 class="reveal">Questions fréquentes</h2><div id="faq"></div></div></section>`;
  },
  async blog() {
    const list = await getJSON('data/articles.json');
    const [first, ...rest] = list;
    const link = a => `article.html?slug=${encodeURIComponent(a.slug)}`;
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>La Gazette</h1><p class="lead">Articles et conseils autour du développement de l'enfant et de la parentalité.</p></div></div>
      <section><div class="wrap"><a class="feature reveal" href="${link(first)}"><div><span class="date">À la une, ${esc(first.date)}</span><h2>${esc(first.title)}</h2><p>${esc(first.excerpt)}</p><span class="more">Lire l'article →</span></div><span class="feature-tag">${esc(first.tag)}</span></a>
      <div class="grid blog-grid">${rest.map(a => `<a class="card reveal" href="${link(a)}"><span class="date">${esc(a.date)} · ${esc(a.tag)}</span><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><span class="more">Lire l'article →</span></a>`).join('')}</div></div></section>`;
  },
  async article(site) {
    const list = await getJSON('data/articles.json');
    const i = list.findIndex(a => a.slug === new URLSearchParams(location.search).get('slug'));
    if (i < 0) { $('#main').innerHTML = `<section><div class="wrap"><h1>Article introuvable</h1><p><a class="btn" href="blog.html">Retour à la Gazette</a></p></div></section>`; return; }
    const a = list[i], next = list[(i + 1) % list.length];
    document.title = `${a.title} | ${site.name}`;
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = a.excerpt;
    const body = a.body.map(b => b.t === 'h' ? `<h2>${esc(b.x)}</h2>` : b.t === 'ul' ? `<ul class="checks">${b.x.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(b.x)}</p>`).join('');
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><a class="back" href="blog.html">← La Gazette</a><span class="date">${esc(a.date)} · ${esc(a.tag)} · ${esc(a.read)} de lecture</span><h1>${esc(a.title)}</h1><p class="lead">${esc(a.excerpt)}</p></div></div>
      <section><div class="wrap"><article class="prose">${body}<p class="byline">Par ${esc(a.author)}</p></article>
      <div class="after"><a class="card" href="article.html?slug=${encodeURIComponent(next.slug)}"><span class="date">Article suivant</span><h3>${esc(next.title)}</h3></a>
      <div class="btn-row"><a class="btn" href="${site.doctolib}" target="_blank" rel="noopener">Prendre rendez-vous</a><a class="btn" href="contact.html">Me contacter</a></div></div></div></section>`;
  },
  contact(site) {
    const route = p => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.mapQuery);
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>Contact</h1><p class="lead">Prenez rendez-vous en ligne, appelez-moi ou écrivez-moi : je vous réponds dès que possible.</p></div></div>
      <section><div class="wrap contact-grid"><div class="contact-side">
        <div class="cta-card reveal"><h2>Prendre rendez-vous</h2><p>Le plus simple : réserver directement un créneau en ligne.</p><a class="btn btn-light" href="${site.doctolib}" target="_blank" rel="noopener">Réserver sur Doctolib</a></div>
        <ul class="direct reveal"><li><span>Téléphone</span><a href="tel:${site.phoneHref}">${esc(site.phone)}</a></li><li><span>Email</span><a href="mailto:${site.email}">${esc(site.email)}</a></li></ul>
        <div class="reveal"><h3>Où me trouver</h3><ul class="direct">${site.places.map(p => `<li><span>${esc(p.name)}</span><span>${todo(p.street)}, ${esc(p.city)} <a href="${route(p)}" target="_blank" rel="noopener">Itinéraire →</a></span></li>`).join('')}</ul></div>
        <div class="reveal"><h3>Jours de consultation</h3><ul class="plain">${site.hours.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div></div>
      <form class="reveal" id="contact-form"><h2>Écrivez-moi</h2>
        <div class="row2"><div><label for="n">Nom</label><input id="n" name="name" required autocomplete="name"></div><div><label for="t">Téléphone (facultatif)</label><input id="t" name="tel" type="tel" autocomplete="tel"></div></div>
        <div><label for="e">Email</label><input id="e" name="email" type="email" required autocomplete="email"></div>
        <div><label for="s">Motif</label><select id="s" name="subject"><option>Prise de rendez-vous</option><option>Bilan psychomoteur ou psychologique</option><option>Groupe ou atelier</option><option>Autre question</option></select></div>
        <div><label for="m">Message</label><textarea id="m" name="message" required></textarea></div>
        <label class="check"><input type="checkbox" required> J'accepte que mes données soient utilisées pour répondre à ma demande (voir les <a href="mentions-legales.html">mentions légales</a>).</label>
        <p class="notice">Merci de ne pas indiquer d'informations médicales détaillées dans ce formulaire.</p>
        <button class="btn" type="submit">Envoyer</button><p class="notice" id="form-note" role="status"></p></form></div></section>`;
    $('#contact-form').onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target);
      const body = `${f.get('message')}\n\nNom : ${f.get('name')}\nEmail : ${f.get('email')}\nTéléphone : ${f.get('tel') || 'non renseigné'}`;
      $('#form-note').textContent = 'Votre messagerie va s\'ouvrir avec le message prêt à envoyer.';
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(f.get('subject') + ' : ' + f.get('name'))}&body=${encodeURIComponent(body)}`;
    };
  },
  legal(site, c) {
    const l = c.legal, rich = t => esc(t).replace(/\{\{(.+?)\}\}/g, '<span class="todo">$1</span>');
    const toc = l.sections.map(s => `<li><a href="#${s.id}" data-id="${s.id}">${esc(s.h)}</a></li>`).join('');
    const body = l.sections.map(s => `<article class="domain reveal" id="${s.id}"><h2>${esc(s.h)}</h2>${s.b.map(b => b.t === 'ul' ? `<ul class="checks">${b.x.map(x => `<li>${rich(x)}</li>`).join('')}</ul>` : `<p>${rich(b.x)}</p>`).join('')}</article>`).join('');
    $('#main').innerHTML = `<div class="page-head"><div class="wrap"><h1>${esc(l.title)}</h1><p class="lead">Dernière mise à jour : ${esc(l.updated)}</p></div></div>
      <section><div class="wrap care-layout"><aside class="care-nav" aria-label="Sommaire"><ul>${toc}</ul></aside><div class="care-body prose legal">${body}</div></div></section>`;
    const links = [...document.querySelectorAll('.care-nav a')];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.dataset.id === en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.domain').forEach(x => io.observe(x));
  }
};

function setup() {
  document.querySelectorAll('.map-consent').forEach(box => {
    box.querySelector('button').onclick = () => {
      const f = document.createElement('iframe');
      f.className = 'map'; f.title = box.dataset.title; f.src = box.dataset.src;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.replaceWith(f);
    };
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const hv=$('.hero-video');if(hv&&matchMedia('(prefers-reduced-motion:reduce)').matches){hv.pause();hv.removeAttribute('autoplay')}
  document.querySelectorAll('.explore').forEach(b => b.onclick = () => $(b.dataset.target).scrollIntoView({ behavior: 'smooth' }));
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || a.target === '_blank' || /^(https?:|mailto:|tel:|#)/.test(h)) return;
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = h, 240);
    });
  });
}

(async function () {
  const page = document.body.dataset.page;
  const [site, content] = await Promise.all([getJSON('data/site.json'), getJSON('data/content.json')]);
  header(site, page);
  await R[page](site, content);
  faq(site); footer(site); jsonld(site); setup();
  if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 50); }
})();
