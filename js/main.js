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
    ".board, .about__body, .about__facts, .founder__statue, .founder__text," +
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
})();
