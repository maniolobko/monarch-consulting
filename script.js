/* ============================================================
   MONARCH CONSULTING — interactions & visuels génératifs
   ============================================================ */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ----------------------------------------------------------
     CARTE DU MONDE EN POINTS DORÉS
     Masque des continents : pour chaque ligne (latitude),
     intervalles de colonnes (longitude) couverts par les terres.
  ---------------------------------------------------------- */
  var COLS = 60, ROWS = 24;
  var LAND = {
    0:  [[11,15],[22,25],[40,52]],
    1:  [[9,17],[22,26],[38,55]],
    2:  [[4,7],[7,19],[22,27],[30,33],[34,57]],
    3:  [[3,7],[6,20],[24,26],[29,34],[34,58]],
    4:  [[4,20],[28,30],[30,35],[35,58]],
    5:  [[5,19],[28,38],[38,57]],
    6:  [[7,18],[29,39],[39,55],[53,55]],
    7:  [[8,18],[29,38],[38,44],[44,54]],
    8:  [[9,17],[28,39],[39,44],[42,53]],
    9:  [[11,15],[27,40],[39,43],[42,46],[46,52]],
    10: [[12,16],[26,41],[42,46],[46,52]],
    11: [[14,17],[25,42],[43,45],[47,52]],
    12: [[16,20],[26,41],[48,53]],
    13: [[15,22],[27,39],[47,54]],
    14: [[15,23],[28,38],[48,55]],
    15: [[15,23],[29,37],[49,55]],
    16: [[16,23],[30,37],[51,57]],
    17: [[16,22],[31,37],[49,57]],
    18: [[16,21],[32,36],[49,56]],
    19: [[16,20],[33,35],[52,56]],
    20: [[16,19],[57,58]],
    21: [[16,18]],
    22: [[16,18]],
    23: [[16,17]]
  };

  // hubs (col,row) sur les terres + libellé pour les arcs
  var HUBS = [
    { c: 17, r: 7  }, // Amériques (NY)
    { c: 22, r: 15 }, // Amérique du Sud
    { c: 30, r: 5  }, // Europe
    { c: 31, r: 12 }, // Afrique de l'Ouest
    { c: 40, r: 9  }, // Moyen-Orient
    { c: 43, r: 10 }, // Asie du Sud
    { c: 48, r: 13 }, // Asie du Sud-Est
    { c: 53, r: 6  }, // Asie de l'Est
    { c: 55, r: 18 }  // Océanie
  ];
  var ARCS = [
    [0, 2], [2, 4], [4, 5], [5, 6], [6, 7],
    [6, 8], [0, 1], [2, 3], [0, 7], [3, 6]
  ];

  function buildWorld(svg, opts) {
    if (!svg) return;
    opts = opts || {};
    var vb = (svg.getAttribute("viewBox") || "0 0 800 460").split(/\s+/).map(Number);
    var W = vb[2], H = vb[3];
    var cell = W / COLS;
    var totalH = ROWS * cell;
    var offY = (H - totalH) / 2 + (opts.shiftY || 0);
    var dotR = cell * (opts.dot || 0.17);
    var twinkleRate = opts.twinkle != null ? opts.twinkle : 0.16;
    var baseOpacity = opts.opacity != null ? opts.opacity : 0.85;

    function px(c) { return c * cell + cell / 2; }
    function py(r) { return offY + r * cell + cell / 2; }

    // points des continents
    var gDots = el("g", {});
    for (var r = 0; r < ROWS; r++) {
      var segs = LAND[r];
      if (!segs) continue;
      for (var s = 0; s < segs.length; s++) {
        for (var c = segs[s][0]; c <= segs[s][1]; c++) {
          var dot = el("circle", {
            cx: px(c).toFixed(1), cy: py(r).toFixed(1), r: dotR.toFixed(1),
            fill: "#d8b348"
          });
          if (Math.random() < twinkleRate) {
            dot.setAttribute("class", "twinkle");
            dot.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
            dot.setAttribute("fill", "#f3e0a0");
          } else {
            dot.setAttribute("opacity", (baseOpacity * (0.4 + Math.random() * 0.5)).toFixed(2));
          }
          gDots.appendChild(dot);
        }
      }
    }
    svg.appendChild(gDots);

    if (!opts.hubs) return;

    // arcs de connexion + étincelle mobile
    var gArcs = el("g", {});
    ARCS.forEach(function (pair, i) {
      var a = HUBS[pair[0]], b = HUBS[pair[1]];
      var x1 = px(a.c), y1 = py(a.r), x2 = px(b.c), y2 = py(b.r);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var dist = Math.hypot(x2 - x1, y2 - y1);
      var cx = mx, cy = my - dist * 0.32;
      var d = "M" + x1.toFixed(1) + " " + y1.toFixed(1) +
              " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1);

      var glow = el("path", { d: d, fill: "none", stroke: "rgba(216,179,72,.18)", "stroke-width": 1.4 });
      var arc = el("path", { d: d, fill: "none", stroke: "url(#gold)", "stroke-width": 1.3,
        "stroke-linecap": "round", class: "arc" });
      arc.style.animationDelay = (i * 0.4).toFixed(1) + "s";
      gArcs.appendChild(glow);
      gArcs.appendChild(arc);

      // étincelle qui circule
      var spark = el("circle", { r: 2.6, fill: "#f7e6b0", class: "spark" });
      var motion = el("animateMotion", {
        dur: (4 + Math.random() * 3).toFixed(1) + "s", repeatCount: "indefinite",
        path: d, begin: (i * 0.5).toFixed(1) + "s"
      });
      spark.appendChild(motion);
      gArcs.appendChild(spark);
    });
    svg.appendChild(gArcs);

    // hubs lumineux pulsants
    var gHubs = el("g", {});
    HUBS.forEach(function (h, i) {
      var x = px(h.c), y = py(h.r);
      var halo = el("circle", { cx: x, cy: y, r: 4, fill: "rgba(216,179,72,.5)", class: "hub-halo" });
      halo.style.animationDelay = (i * 0.3).toFixed(1) + "s";
      var core = el("circle", { cx: x, cy: y, r: 3.2, fill: "#f7e6b0", class: "hub-core" });
      core.style.animationDelay = (i * 0.3).toFixed(1) + "s";
      gHubs.appendChild(halo);
      gHubs.appendChild(core);
    });
    svg.appendChild(gHubs);
  }

  /* ----------------------------------------------------------
     SKYLINE — quartier d'affaires (gratte-ciels + fenêtres)
  ---------------------------------------------------------- */
  function buildSkyline(svg) {
    if (!svg) return;
    var vb = (svg.getAttribute("viewBox") || "0 0 1200 360").split(/\s+/).map(Number);
    var W = vb[2], H = vb[3];

    function layer(seed, opacity, minH, maxH, winOpacity, lit) {
      var g = el("g", { opacity: opacity });
      var x = -20 + Math.random() * 20;
      while (x < W + 20) {
        var w = 32 + Math.random() * 40;
        var h = minH + Math.random() * (maxH - minH);
        var bx = x, by = H - h;
        var b = el("rect", { x: bx.toFixed(1), y: by.toFixed(1), width: w.toFixed(1),
          height: h.toFixed(1), fill: "url(#gold)" });
        g.appendChild(b);
        // toit / antenne parfois
        if (Math.random() < 0.4) {
          g.appendChild(el("rect", { x: (bx + w / 2 - 1).toFixed(1), y: (by - 10).toFixed(1),
            width: 2, height: 10, fill: "url(#gold)" }));
        }
        // fenêtres
        var pad = 6, ww = 4, wh = 6, gx = 8, gy = 11;
        for (var fy = by + pad; fy < H - 8; fy += gy) {
          for (var fx = bx + pad; fx < bx + w - pad; fx += gx) {
            var win = el("rect", { x: fx.toFixed(1), y: fy.toFixed(1), width: ww, height: wh,
              fill: "#fbeeb6", opacity: winOpacity });
            if (Math.random() < lit) {
              win.setAttribute("class", "win-on");
              win.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
            } else if (Math.random() < 0.5) {
              win.setAttribute("opacity", (winOpacity * 0.4).toFixed(2));
            }
            g.appendChild(win);
          }
        }
        x += w + 8 + Math.random() * 16;
      }
      return g;
    }

    // couche arrière (plus sombre, immeubles plus bas) puis couche avant
    svg.appendChild(layer(1, 0.16, 90, 190, 0.5, 0.16));
    svg.appendChild(layer(2, 0.30, 150, 300, 0.7, 0.22));
  }

  /* ----------------------------------------------------------
     INITIALISATION
  ---------------------------------------------------------- */
  buildWorld(document.getElementById("worldMap"), { hubs: true, dot: 0.18, twinkle: 0.18, opacity: 0.9 });
  buildWorld(document.getElementById("heroMap"), { hubs: false, dot: 0.16, twinkle: 0.12, opacity: 0.5, shiftY: -10 });
  buildSkyline(document.getElementById("heroSkyline"));

  /* --- Année footer --- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Header au scroll --- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Menu mobile --- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Révélation au scroll --- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add("in"); }, Math.min(i * 70, 280));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (e) { io.observe(e); });
  } else {
    revealEls.forEach(function (e) { e.classList.add("in"); });
  }

  /* --- Formulaire de contact (envoi AJAX vers contact.php) --- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !message) {
        status.textContent = "Merci de renseigner votre nom, un email valide et un message.";
        status.className = "form-status err";
        return;
      }
      if (!form.consent.checked) {
        status.textContent = "Merci d'accepter la politique de confidentialité pour envoyer votre demande.";
        status.className = "form-status err";
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";
      status.textContent = "";
      status.className = "form-status";

      fetch(form.getAttribute("action") || "contact.php", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (data) {
          if (data.ok) {
            status.textContent = data.msg || "Merci, votre message a bien été envoyé.";
            status.className = "form-status ok";
            form.reset();
          } else {
            status.textContent = data.msg || "Une erreur est survenue. Merci de réessayer.";
            status.className = "form-status err";
          }
        })
        .catch(function () {
          status.textContent = "Connexion impossible. Écrivez-nous à Contact@monarch-consulting-io.com.";
          status.className = "form-status err";
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = original;
        });
    });
  }
})();
