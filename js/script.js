const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const yearNodes = document.querySelectorAll("[data-current-year]");
const GA4_ID = "G-PF00CB2V46";
const COOKIE_BANNER_ENABLED = true;
const CONSENT_KEY = "cleanflow_cookie_consent";
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

const EUR_TO_BGN_RATE = 1.96;

const formatPrice = (eurAmount) => {
  const bgnAmount = Math.round(eurAmount * EUR_TO_BGN_RATE);
  return bgnAmount;
};

const formatPriceRange = (eurMin, eurMax) => {
  const bgnMin = formatPrice(eurMin);
  const bgnMax = formatPrice(eurMax);
  return { bgnMin, bgnMax };
};

document.documentElement.classList.add("js");

const closeMenu = () => {
  if (!navToggle || !siteNav) {
    return;
  }

  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");

  document.body.classList.remove("menu-open");
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");

    document.body.classList.toggle("menu-open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen = siteNav.classList.contains("is-open");
    if (!isOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!siteNav.contains(target) && !navToggle.contains(target)) {
      closeMenu();
    }
  });
}

const currentPath = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav__list a, .footer-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPath) {
    link.classList.add("is-active");
    if (link.closest(".nav__list")) {
      link.setAttribute("aria-current", "page");
    }
  }
});

window.addEventListener(
  "scroll",
  () => {
    if (!header) {
      return;
    }

    header.classList.toggle("site-header--scrolled", window.scrollY > 8);
  },
  { passive: true },
);

yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const revealNodes = Array.from(document.querySelectorAll(".reveal"));
if (revealNodes.length > 0) {
  const showNode = (node) => {
    node.classList.add("is-visible");
  };

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach(showNode);
  } else {
    revealNodes.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          showNode(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    const viewportRevealEdge = window.innerHeight * 0.92;
    revealNodes.forEach((node) => {
      if (node.getBoundingClientRect().top < viewportRevealEdge) {
        showNode(node);
      } else {
        revealObserver.observe(node);
      }
    });
  }
}

const loadGa4 = () => {
  if (!GA4_ID || GA4_ID === "G-XXXXXXXXXX") {
    return;
  }

  if (window.__gaLoaded) {
    return;
  }

  window.__gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;

  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA4_ID, { anonymize_ip: true });
};

const setConsent = (value) => {
  localStorage.setItem(CONSENT_KEY, value);
  if (value === "accepted") {
    loadGa4();
  }
};

const currentConsent = localStorage.getItem(CONSENT_KEY);
if (currentConsent === "accepted") {
  loadGa4();
}

if (COOKIE_BANNER_ENABLED && !currentConsent) {
  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Съгласие за бисквитки");
  banner.innerHTML = `
    <p>Използваме необходими бисквитки и аналитични бисквитки (Google Analytics) след съгласие. Вижте <a href="cookies.html">Политика за бисквитки</a>.</p>
    <div class="cookie-banner__actions">
      <button type="button" class="btn btn--primary" data-cookie-accept>Приемам</button>
      <button type="button" class="btn btn--secondary" data-cookie-decline>Отказвам</button>
    </div>
  `;

  document.body.appendChild(banner);

  const acceptBtn = banner.querySelector("[data-cookie-accept]");
  const declineBtn = banner.querySelector("[data-cookie-decline]");

  if (acceptBtn instanceof HTMLButtonElement) {
    acceptBtn.addEventListener("click", () => {
      setConsent("accepted");
      banner.remove();
    });
  }

  if (declineBtn instanceof HTMLButtonElement) {
    declineBtn.addEventListener("click", () => {
      setConsent("declined");
      banner.remove();
    });
  }
}

document.querySelectorAll("form.quote-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    const statusNode = form.querySelector(".form-status");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const action = (form.getAttribute("action") || "").trim();
    if (!action) {
      event.preventDefault();
      if (statusNode) {
        statusNode.textContent =
          "Missing form endpoint. Set a valid Formspree endpoint in the form action.";
      }
      return;
    }

    let endpoint;
    try {
      endpoint = new URL(action, window.location.href);
    } catch (error) {
      event.preventDefault();
      if (statusNode) {
        statusNode.textContent =
          "Invalid form endpoint URL. Check the form action attribute.";
      }
      return;
    }

    const isFormspreeEndpoint =
      endpoint.hostname === "formspree.io" ||
      endpoint.hostname.endsWith(".formspree.io");
    if (!isFormspreeEndpoint) {
      return;
    }

    if (/placeholder|your-form-id|changeme/i.test(action)) {
      event.preventDefault();
      if (statusNode) {
        statusNode.textContent =
          "Formspree endpoint is not configured. Replace PLACEHOLDER_FORM_ID with the real Formspree form ID.";
      }
      return;
    }

    event.preventDefault();
    if (statusNode) {
      statusNode.textContent = "Sending request...";
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = true;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(endpoint.toString(), {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        if (statusNode) {
          statusNode.textContent =
            "Thank you. Your request was sent successfully. We will contact you soon.";
        }
      } else {
        let detail = "";
        try {
          const payload = await response.json();
          if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
            detail = payload.errors
              .map((err) => err?.message)
              .filter(Boolean)
              .join(" ");
          }
        } catch (error) {
          // Keep generic message when server does not return JSON details.
        }

        if (statusNode) {
          statusNode.textContent = detail
            ? "Submission failed (" + response.status + "): " + detail
            : "Submission failed (" +
              response.status +
              "). Check Formspree configuration and try again.";
        }
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      if (statusNode) {
        statusNode.textContent =
          "Network or configuration error while submitting. Check connectivity and access to formspree.io.";
      }
    } finally {
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = false;
      }
    }
  });
});

const callFabToggle = document.querySelector("[data-call-fab-toggle]");
const callFabGroup = document.querySelector(".call-fab-group");
const callFabMenu = document.querySelector(".call-fab-menu");
const callFabLinks = document.querySelectorAll(".call-fab-menu .call-fab");

const closeCallFabMenu = () => {
  if (!callFabToggle || !callFabGroup) {
    return;
  }
  callFabGroup.classList.remove("is-open");
  callFabToggle.setAttribute("aria-expanded", "false");
};

if (callFabToggle && callFabGroup && callFabMenu) {
  callFabToggle.addEventListener("click", () => {
    const isOpen = callFabGroup.classList.contains("is-open");
    callFabGroup.classList.toggle("is-open", !isOpen);
    callFabToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  callFabLinks.forEach((link) => {
    link.addEventListener("click", closeCallFabMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCallFabMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen = callFabGroup.classList.contains("is-open");
    if (!isOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!callFabGroup.contains(target) && !callFabToggle.contains(target)) {
      closeCallFabMenu();
    }
  });
}
