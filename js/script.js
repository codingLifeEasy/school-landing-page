// Sunrise Public School — landing page interactions
// Vanilla JS, no dependencies, keeps things fast.
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu after tapping a link (mobile)
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- School bell ring animation ---------- */
  var bell = document.getElementById("bellIcon");
  function ringBell() {
    if (!bell) return;
    bell.classList.remove("rung");
    // force reflow so the animation can restart
    void bell.offsetWidth;
    bell.classList.add("rung");
  }
  if (bell) {
    bell.addEventListener("click", ringBell);
    bell.addEventListener("mouseenter", ringBell);
    // gentle welcome ring shortly after load
    window.addEventListener("load", function () {
      setTimeout(ringBell, 600);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".nav-link");

  function setActiveLink() {
    var scrollPos = window.scrollY + 120;
    var current = "";
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) {
        current = sec.getAttribute("id");
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  /* ---------- Back to top button ---------- */
  var backToTop = document.getElementById("backToTop");
  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("visible", window.scrollY > 400);
  }
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        setActiveLink();
        toggleBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  setActiveLink();
  toggleBackToTop();

  /* ---------- Scroll-reveal for cards/sections ----------
     Progressive enhancement: content is visible by default (see CSS),
     JS only adds the "reveal" (hidden) class to elements that are
     currently off-screen, then reveals them as they scroll into view.
     A short safety-net timeout guarantees everything is shown even if
     IntersectionObserver never fires (throttled/background tab, old
     browser, etc.) so the page can never end up permanently blank. */
  var revealTargets = document.querySelectorAll(
    ".about-card, .feature-card, .timeline-item, .contact-form, .contact-info, .hero-copy, .hero-art, .playground-art, .playground-feature"
  );

  var toObserve = [];
  revealTargets.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      // Already on screen on load — show immediately, no animation delay.
      el.classList.add("in-view");
    } else {
      el.classList.add("reveal");
      toObserve.push(el);
    }
  });

  if (toObserve.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    toObserve.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: never leave content permanently hidden.
    setTimeout(function () {
      toObserve.forEach(function (el) {
        el.classList.add("in-view");
      });
    }, 4000);
  } else {
    toObserve.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        status.style.color = "#ff6f59";
        status.textContent = "Please fill in all required fields correctly.";
        form.reportValidity();
        return;
      }

      var nameVal = document.getElementById("name").value.trim();
      status.style.color = "#4caf7d";
      status.textContent =
        "Thanks, " + nameVal.split(" ")[0] + "! We've received your message and will reply soon.";
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
