
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const bootScreen = document.querySelector('#bootScreen');
const bootText = document.querySelector('#bootText');
const bootProgress = document.querySelector('#bootProgress');
const bootStatus = document.querySelector('#bootStatus');
const enterButton = document.querySelector('#enterButton');
const skipButton = document.querySelector('#skipBoot');
const heroContent = document.querySelector('#heroContent');

let bootTimers = [];
let bootFinished = false;

document.title = 'chitha.exe — Creative Digital Studio';

function later(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  bootTimers.push(timer);
}

function enterSite() {
  if (bootFinished) return;
  bootFinished = true;

  bootTimers.forEach(clearTimeout);
  bootTimers = [];

  if (bootScreen) bootScreen.classList.add('boot-finished');
  if (heroContent) heroContent.classList.add('is-entered');

  revealElements.forEach((element) => {
    element.classList.add('visible');
  });
}

const revealElements = document.querySelectorAll(
  '.eyebrow, .hero h1, .hero-bottom, .hero-stamp, ' +
  '.section-heading, .project-card, .about, .footer'
);

if (bootScreen && heroContent && !reduceMotion) {
  const messages = [
  'Booting chitha.exe...',
  'Loading imagination modules...',
  'Connecting Premiere Pro + After Effects...',
  'Creative system online. Welcome, human.'
];

  messages.forEach((message, index) => {
    later(() => {
      if (bootFinished) return;

      bootText.textContent = '> ' + message;
      bootProgress.style.width = ((index + 1) / messages.length) * 100 + '%';
    }, 500 + index * 650);
  });

  later(() => {
    if (bootFinished) return;

    bootStatus.innerHTML = 'SYSTEM READY <span class="blink">_</span>';
    enterButton.hidden = false;
  }, 500 + messages.length * 650);

  enterButton.addEventListener('click', enterSite);
  skipButton.addEventListener('click', enterSite);
} else {
  enterSite();
}

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((element) => {
  element.classList.add('reveal');
  revealObserver.observe(element);
});

// Link hover feedback
document.querySelectorAll('.nav-contact, .work-link, '.concat('.footer > a'))
  .forEach((link) => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('is-hovered');
    });

    link.addEventListener('mouseleave', () => {
      link.classList.remove('is-hovered');
    });
  });

// Portrait stamp movement on desktop
const stamp = document.querySelector('.hero-stamp');

if (stamp && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    stamp.style.translate = `${x}px ${y}px`;
  });
}

// Editorial portrait: subtle pointer-controlled tilt
const portraitStage = document.querySelector('.portrait-stage');

if (
  portraitStage &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  portraitStage.addEventListener('pointermove', (event) => {
    const rect = portraitStage.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;

    portraitStage.style.setProperty('--pointer-x', `${rotateY}deg`);
    portraitStage.style.setProperty('--pointer-y', `${rotateX}deg`);
  });

  portraitStage.addEventListener('pointerleave', () => {
    portraitStage.style.setProperty('--pointer-x', '0deg');
    portraitStage.style.setProperty('--pointer-y', '0deg');
  });
}

/* CHITHA.EXE — CURSOR TRACKER */

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

const desktopPointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (cursorDot && cursorRing && desktopPointer.matches && !reducedMotion) {
  document.body.classList.add('custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let pointerActive = false;

  document.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    pointerActive = true;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(animateRing);
  }

  animateRing();

  const hoverTargets = document.querySelectorAll(
    'a, button, .project-card, .portrait-stage'
  );

  hoverTargets.forEach((target) => {
    target.addEventListener('pointerenter', () => {
      cursorRing.classList.add('cursor-hover');

      if (target.classList.contains('project-card')) {
        cursorRing.dataset.label = 'VIEW';
      } else if (target.classList.contains('portrait-stage')) {
        cursorRing.dataset.label = 'HEY!';
      } else {
        cursorRing.dataset.label = '';
      }
    });

    target.addEventListener('pointerleave', () => {
      cursorRing.classList.remove('cursor-hover');
      cursorRing.dataset.label = '';
    });
  });

  document.addEventListener('pointerdown', () => {
    cursorRing.classList.add('cursor-click');
  });

  document.addEventListener('pointerup', () => {
    cursorRing.classList.remove('cursor-click');
  });

  document.addEventListener('pointerleave', () => {
    if (!pointerActive) return;
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });

  document.addEventListener('pointerenter', () => {
    if (pointerActive) {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
  });
}

/* CHITHA.EXE — PROJECT TILT */

const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;

        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 5;
        const rotateX = (0.5 - y) * 5;

        card.style.transform =
            `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
        card.style.transform = '';
    });
});

/* CHITHA.EXE — MAGNETIC BUTTON INTERACTION */

const magneticButtons = document.querySelectorAll(
    '.enter-button, .nav-contact, .magnetic-btn'
);

magneticButtons.forEach((button) => {
    button.classList.add('magnetic-btn');

    button.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = button.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transform =
            `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    button.addEventListener('pointerleave', () => {
        button.style.transform = '';
    });
});

/* ===== CHITHA.EXE SKILLS LAB INTERACTION ===== */

const skillModules = {
    editing: {
        number: "MODULE_01",
        title: "VIDEO EDITING",
        description:
            "Turning raw footage into visual stories with rhythm, pacing and purpose.",
        tools: ["PREMIERE PRO", "STORYTELLING", "SHORT-FORM"],
        terminal: "creative_mode.initialize()"
    },

    motion: {
        number: "MODULE_02",
        title: "MOTION DESIGN",
        description:
            "Exploring movement, transitions and animated visuals to bring ideas to life.",
        tools: ["AFTER EFFECTS", "ANIMATION", "VISUAL EFFECTS"],
        terminal: "motion_engine.load()"
    },

    web: {
        number: "MODULE_03",
        title: "WEB DESIGN",
        description:
            "Designing digital experiences that combine visual identity, usability and detail.",
        tools: ["WEB DESIGN", "UI", "RESPONSIVE LAYOUTS"],
        terminal: "interface.render()"
    },

    code: {
        number: "MODULE_04",
        title: "CREATIVE CODE",
        description:
            "Building interactive web experiences by combining code, experimentation and design.",
        tools: ["HTML", "CSS", "JAVASCRIPT"],
        terminal: "ideas.execute()"
    }
};

const skillTabs = document.querySelectorAll(".skill-tab");

const skillNumber = document.getElementById("skillNumber");
const skillTitle = document.getElementById("skillTitle");
const skillDescription = document.getElementById("skillDescription");
const skillTools = document.getElementById("skillTools");
const skillTerminal = document.getElementById("skillTerminal");
const skillStatus = document.getElementById("skillStatus");

function activateSkill(key) {
    const skill = skillModules[key];

    if (!skill) return;

    skillTabs.forEach((tab) => {
        const isActive = tab.dataset.skill === key;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });

    skillStatus.textContent = "MODULE LOADED";
    skillNumber.textContent = skill.number;
    skillTitle.textContent = skill.title;
    skillDescription.textContent = skill.description;
    skillTerminal.textContent = skill.terminal;

    skillTools.replaceChildren(
        ...skill.tools.map((tool) => {
            const tag = document.createElement("span");
            tag.textContent = tool;
            return tag;
        })
    );
}

skillTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activateSkill(tab.dataset.skill);
    });
});

/* ===== CHITHA.EXE — SCROLL REVEALS ===== */

document.addEventListener("DOMContentLoaded", () => {
    const revealItems = document.querySelectorAll(
    ".about, .skills-lab, .project-card"
);

    revealItems.forEach((item) => {
        item.classList.add("reveal-on-scroll");
    });

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => {
            item.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealItems.forEach((item) => observer.observe(item));
});

/* ===== CONTACT SECTION REVEAL ===== */

const contactSection = document.querySelector(".contact-section");

if (contactSection) {
    if ("IntersectionObserver" in window) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    contactSection.classList.add("contact-visible");
                    contactObserver.unobserve(contactSection);
                }
            });
        }, {
            threshold: 0.15
        });

        contactObserver.observe(contactSection);
    } else {
        contactSection.classList.add("contact-visible");
    }
}
