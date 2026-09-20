/* =========================================================================
   WOY Consulting - interaction layer
   No scroll listeners anywhere: everything observable uses IntersectionObserver.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------- footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --------------------------------------------------------- theme toggle */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");

  function storedTheme() {
    try { return localStorage.getItem("woy-theme"); } catch (e) { return null; }
  }
  function storeTheme(v) {
    try { localStorage.setItem("woy-theme", v); } catch (e) { /* private mode */ }
  }
  function systemDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function paintToggle() {
    if (!toggle) return;
    var isDark = root.getAttribute("data-theme") === "dark" ||
                 (!root.hasAttribute("data-theme") && systemDark());
    var icon = toggle.querySelector("i");
    if (icon) icon.className = isDark ? "ph ph-sun" : "ph ph-moon";
    toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  var saved = storedTheme();
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  paintToggle();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark" ||
                   (!root.hasAttribute("data-theme") && systemDark());
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      paintToggle();
    });
  }

  /* --------------------------------------------------------- sticky nav -- */
  var nav = document.getElementById("nav");
  if (nav) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* --------------------------------------------------------- mobile menu - */
  var burger = document.getElementById("navBurger");
  var mobileNav = document.getElementById("mobileNav");

  function closeMenu() {
    if (!burger || !mobileNav) return;
    burger.setAttribute("aria-expanded", "false");
    mobileNav.removeAttribute("data-open");
    mobileNav.hidden = true;
    var icon = burger.querySelector("i");
    if (icon) icon.className = "ph ph-list";
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); return; }
      burger.setAttribute("aria-expanded", "true");
      mobileNav.hidden = false;
      mobileNav.setAttribute("data-open", "true");
      var icon = burger.querySelector("i");
      if (icon) icon.className = "ph ph-x";
    });

    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------- hero loop economics - */
  /* Pause the logo animation while it is off screen so it costs nothing
     during the rest of the scroll. */
  var stage = document.querySelector(".markstage");
  if (stage && !reduced) {
    new IntersectionObserver(function (entries) {
      stage.classList.toggle("is-paused", !entries[0].isIntersecting);
    }, { rootMargin: "120px" }).observe(stage);
  }

  /* --------------------------------------------------------- 4D accordion */
  var accButtons = document.querySelectorAll(".acc__btn");
  accButtons.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;

    if (btn.getAttribute("aria-expanded") === "true") panel.setAttribute("data-open", "true");

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      accButtons.forEach(function (other) {
        var op = document.getElementById(other.getAttribute("aria-controls"));
        other.setAttribute("aria-expanded", "false");
        if (op) op.removeAttribute("data-open");
      });

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.setAttribute("data-open", "true");
      }
    });
  });

  /* ----------------------------------------------------- case study tabs - */
  var tabList = document.querySelector(".tabs__rail");
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));

    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panel) {
          panel.hidden = !on;
          panel.classList.toggle("is-active", on);
        }
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
    });

    tabList.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  }

  /* --------------------------------------------- logo philosophy linkage - */
  var philoMark = document.getElementById("philoMark");
  var philoItems = Array.prototype.slice.call(document.querySelectorAll(".philo-item"));

  if (philoMark && philoItems.length) {
    function focusPart(item) {
      philoItems.forEach(function (i) { i.classList.toggle("is-active", i === item); });
      philoMark.setAttribute("data-focus", item.getAttribute("data-part"));
    }

    philoItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () { focusPart(item); });
      item.addEventListener("focusin", function () { focusPart(item); });
    });

    /* On scroll-through, the item nearest the middle of the viewport leads. */
    var philoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) focusPart(entry.target);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    philoItems.forEach(function (item) { philoObserver.observe(item); });
  }

  /* --------------------------------------------------------- reveal on -- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (reduced) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var siblings = Array.prototype.slice.call(entry.target.parentNode.children)
            .filter(function (n) { return n.classList && n.classList.contains("reveal"); });
          var idx = siblings.indexOf(entry.target);
          entry.target.style.setProperty("--d", Math.max(0, idx) * 70 + "ms");
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ------------------------------------------------------- contact form -- */
  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");

  var RULES = {
    name: {
      test: function (v) { return v.trim().length >= 2; },
      msg: "Please enter your full name."
    },
    mobile: {
      test: function (v) {
        var digits = v.replace(/[^\d]/g, "");
        return /^[+\d][\d\s\-().]*$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
      },
      msg: "Please enter a valid mobile number."
    },
    email: {
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      msg: "Please enter a valid email address."
    }
  };

  function fieldError(input, message) {
    var err = document.getElementById("err-" + input.name);
    if (!err) return;
    if (message) {
      input.setAttribute("aria-invalid", "true");
      err.textContent = message;
      err.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      err.textContent = "";
      err.hidden = true;
    }
  }

  function validateField(input) {
    var rule = RULES[input.name];
    if (!rule) return true;
    var ok = rule.test(input.value);
    fieldError(input, ok ? null : rule.msg);
    return ok;
  }

  Object.keys(RULES).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", function () { validateField(input); });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") validateField(input);
    });
  });

  function setStatus(kind, message) {
    if (!statusEl) return;
    if (!kind) { statusEl.hidden = true; statusEl.removeAttribute("data-kind"); return; }
    statusEl.textContent = message;
    statusEl.setAttribute("data-kind", kind);
    statusEl.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus(null);

    var firstBad = null;
    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      if (input && !validateField(input) && !firstBad) firstBad = input;
    });

    if (firstBad) {
      firstBad.focus();
      setStatus("bad", "Please correct the highlighted fields.");
      return;
    }

    var endpoint = (form.getAttribute("data-endpoint") || "").trim();
    form.classList.add("is-busy");

    var done = function (ok) {
      form.classList.remove("is-busy");
      if (ok) {
        form.reset();
        setStatus("ok", "Thank you. A partner will be in touch shortly.");
      } else {
        setStatus("bad", "Something went wrong. Please try again, or email us directly.");
      }
    };

    if (!endpoint) {
      /* No handler wired yet. See README for how to connect one. */
      console.warn("[WOY] contact form has no data-endpoint. Running in demo mode.");
      window.setTimeout(function () { done(true); }, 700);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form)
    })
      .then(function (res) { done(res.ok); })
      .catch(function () { done(false); });
  });
})();
