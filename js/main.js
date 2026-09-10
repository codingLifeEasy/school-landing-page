/* =========================================================
   Ghoksadanga Pramanik High School (H.S.)
   Vanilla JS. No dependencies, no build step.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var list = document.getElementById("navList");

  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    // close after choosing a destination on small screens
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        list.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Active section in the nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var targets = links
    .map(function (a) {
      var id = a.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function markActive() {
    var pos = window.scrollY + 140;
    var currentId = "";

    targets.forEach(function (section) {
      if (section.offsetTop <= pos) currentId = "#" + section.id;
    });

    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === currentId);
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");

  function markScrolled() {
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 420);
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- One rAF-throttled scroll handler ---------- */
  var queued = false;
  window.addEventListener(
    "scroll",
    function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        markActive();
        markScrolled();
        queued = false;
      });
    },
    { passive: true }
  );
  markActive();
  markScrolled();

  /* ---------- Scroll reveal ----------
     Progressive enhancement. Content ships visible; we only add
     the hidden ".reveal" class to things that are still below the
     fold, and a timeout guarantees everything is shown even if the
     observer never fires. The page can never be left blank. */
  var candidates = document.querySelectorAll(
    ".board, .about__body, .about__facts, .foundmark, .founder__text," +
      ".principal__card, .principal__body, .luminary, .facility, .stats__cell"
  );

  var hidden = [];
  Array.prototype.forEach.call(candidates, function (el) {
    var box = el.getBoundingClientRect();
    if (box.top > window.innerHeight) {
      el.classList.add("reveal");
      hidden.push(el);
    }
  });

  function showAll() {
    hidden.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (hidden.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    hidden.forEach(function (el) {
      io.observe(el);
    });
    setTimeout(showAll, 4000); // safety net
  } else {
    showAll();
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var FOUNDED = 1953;

  /* =========================================================
     Lazy images
     Each photo sits in a .ph frame that shimmers until the file
     arrives, then fades in. Images already in cache fire no load
     event, so complete images are marked straight away.
     ========================================================= */
  function watchImages() {
    var frames = document.querySelectorAll(".ph");
    Array.prototype.forEach.call(frames, function (frame) {
      var img = frame.querySelector("img");
      if (!img) return;

      var done = function () { frame.classList.add("is-loaded"); };

      if (img.complete && img.naturalWidth > 0) {
        done();
      } else {
        img.addEventListener("load", done, { once: true });
        // a broken file should not leave the frame shimmering for ever
        img.addEventListener("error", done, { once: true });
      }
    });
  }
  watchImages();

  /* =========================================================
     Notice spotlight - rotates the newest announcements
     ========================================================= */
  (function spotlight() {
    var root = document.getElementById("spotlight");
    var dotWrap = document.getElementById("spotlightDots");
    if (!root || !dotWrap) return;

    var items = root.querySelectorAll(".spotlight__item");
    if (items.length < 2) return;

    var index = 0;
    var timer = null;
    var DELAY = 5200;

    var dots = [];
    Array.prototype.forEach.call(items, function (_, i) {
      var b = document.createElement("button");
      b.className = "spotlight__dot" + (i === 0 ? " is-active" : "");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Notice " + (i + 1));
      b.addEventListener("click", function () {
        show(i);
        restart();
      });
      dotWrap.appendChild(b);
      dots.push(b);
    });

    function show(next) {
      items[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = (next + items.length) % items.length;
      items[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }

    function tick() { show(index + 1); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(tick, DELAY);
    }

    restart();
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
  })();

  /* =========================================================
     Hero card - turns itself over every few seconds
     ========================================================= */
  (function heroCard() {
    var card = document.getElementById("heroCard");
    var capEl = document.getElementById("heroCardCap");
    var barEl = document.getElementById("heroCardBar");
    if (!card || !capEl || !barEl) return;

    var shots = card.querySelectorAll(".hcard__img");
    if (shots.length < 2) return;

    var HOLD = 4200;
    var at = 0;
    var timer = null;
    var started = 0;
    var raf = null;

    function show(next) {
      shots[at].classList.remove("is-on");
      at = next % shots.length;
      shots[at].classList.add("is-on");
      capEl.textContent = shots[at].getAttribute("data-cap") || "";
    }

    function sweep(now) {
      var pct = Math.min((now - started) / HOLD, 1) * 100;
      barEl.style.width = pct + "%";
      raf = window.requestAnimationFrame(sweep);
    }

    function run() {
      started = performance.now();
      if (raf) cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(sweep);
      timer = setTimeout(function () {
        show(at + 1);
        run();
      }, HOLD);
    }

    function stop() {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    }

    run();
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", run);

    // don't burn frames while the tab is in the background
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else run();
    });
  })();

  /* =========================================================
     Stats count up when they scroll into view
     ========================================================= */
  (function counters() {
    var cells = document.querySelectorAll(".stats__num[data-count]");
    if (!cells.length) return;

    // the final figures are already in the markup, so for anyone who
    // asked for less motion we simply leave them alone
    if (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;

      // years read better counting up from a nearby year than from zero
      var from = target > 1900 ? target - 60 : 0;
      var dur = 1100;
      var t0 = performance.now();

      (function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      })(t0);
    }

    if (!("IntersectionObserver" in window)) return; // numbers are already in the HTML

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            run(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    Array.prototype.forEach.call(cells, function (c) { io.observe(c); });
  })();

  /* =========================================================
     Gallery - filter chips and lightbox
     ========================================================= */
  (function gallery() {
    var grid = document.getElementById("galleryGrid");
    var filters = document.getElementById("galleryFilters");
    var box = document.getElementById("lightbox");
    if (!grid || !box) return;

    var tiles = Array.prototype.slice.call(grid.querySelectorAll(".tile"));
    var img = document.getElementById("lightboxImg");
    var cap = document.getElementById("lightboxCap");
    var current = 0;

    /* ---- filters ---- */
    if (filters) {
      filters.addEventListener("click", function (e) {
        var chip = e.target.closest(".gallery__chip");
        if (!chip) return;

        var want = chip.getAttribute("data-filter");
        filters.querySelectorAll(".gallery__chip").forEach(function (c) {
          c.classList.toggle("is-active", c === chip);
        });
        tiles.forEach(function (t) {
          var show = want === "all" || t.getAttribute("data-cat") === want;
          t.classList.toggle("is-hidden", !show);
        });
      });
    }

    /* ---- lightbox ---- */
    function visibleTiles() {
      return tiles.filter(function (t) { return !t.classList.contains("is-hidden"); });
    }

    function open(tile) {
      var list = visibleTiles();
      current = list.indexOf(tile);
      paint(list[current]);
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
    }

    function paint(tile) {
      if (!tile) return;
      img.src = tile.getAttribute("data-full");
      img.alt = tile.querySelector("img") ? tile.querySelector("img").alt : "";
      cap.innerHTML = tile.getAttribute("data-cap") || "";
    }

    function step(dir) {
      var list = visibleTiles();
      if (!list.length) return;
      current = (current + dir + list.length) % list.length;
      paint(list[current]);
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      img.src = "";
    }

    grid.addEventListener("click", function (e) {
      var tile = e.target.closest(".tile");
      if (tile) open(tile);
    });

    document.getElementById("lbClose").addEventListener("click", close);
    document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
    document.getElementById("lbNext").addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  })();

  /* =========================================================
     Opening sequence
     The gate swings open on the school's Nth year. Built entirely
     in JS, so if this fails the visitor simply gets the site.
     Plays once per browser tab session.
     ========================================================= */
  (function intro() {
    var reduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    try {
      if (sessionStorage.getItem("gphs-intro") === "seen") return;
      sessionStorage.setItem("gphs-intro", "seen");
    } catch (err) {
      // private mode - just play it
    }

    var years = new Date().getFullYear() - FOUNDED;

    var el = document.createElement("div");
    el.className = "intro";
    el.innerHTML =
      '<div class="intro__leaf intro__leaf--l"></div>' +
      '<div class="intro__leaf intro__leaf--r"></div>' +
      '<div class="intro__veil"></div>' +
      '<div class="intro__center">' +
        '<div>' +
          '<span class="intro__ribbon">1953 &ndash; ' + new Date().getFullYear() + '</span>' +
          '<div class="intro__years">' + years + '</div>' +
          '<div class="intro__label">Years of Learning</div>' +
          '<div class="intro__bn">' + years + ' বছরের পথচলা</div>' +
          '<div class="intro__school">Ghoksadanga Pramanik High School (H.S.)</div>' +
        '</div>' +
      '</div>' +
      '<button class="intro__skip" type="button">Skip &rsaquo;</button>';

    // Set on the elements themselves so the path resolves against the
    // page, which keeps it correct under a project sub-path too.
    var gate = "url('assets/img/gate-wide.jpg')";
    el.querySelector(".intro__leaf--l").style.backgroundImage = gate;
    el.querySelector(".intro__leaf--r").style.backgroundImage = gate;

    document.body.appendChild(el);
    document.body.classList.add("is-locked");

    /* confetti */
    var colours = ["#ce9915", "#ffd964", "#ffffff", "#5ba3d9", "#ff6f59"];
    for (var i = 0; i < 46; i++) {
      var bit = document.createElement("span");
      bit.className = "intro__bit";
      bit.style.setProperty("--x", Math.random() * 100 + "%");
      bit.style.setProperty("--w", (5 + Math.random() * 6).toFixed(1) + "px");
      bit.style.setProperty("--h", (9 + Math.random() * 9).toFixed(1) + "px");
      bit.style.setProperty("--c", colours[i % colours.length]);
      bit.style.setProperty("--dur", (2.6 + Math.random() * 2).toFixed(2) + "s");
      bit.style.setProperty("--delay", (0.35 + Math.random() * 1.5).toFixed(2) + "s");
      bit.style.setProperty("--spin", Math.round(360 + Math.random() * 720) + "deg");
      el.appendChild(bit);
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      el.classList.add("is-done");
      document.body.classList.remove("is-locked");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 700);
    }

    el.querySelector(".intro__skip").addEventListener("click", finish);
    el.addEventListener("click", finish);
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        document.removeEventListener("keydown", onKey);
        finish();
      }
    });

    // gates finish opening at 3.6s
    setTimeout(finish, 3800);
  })();
})();
