/* =========================
   Mobile nav
========================= */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

function closeMenu() {
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu on link click
  navMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => closeMenu());
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target) return;
    const clickedInside = navMenu.contains(target) || navToggle.contains(target);
    if (!clickedInside) closeMenu();
  });

  // Close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* =========================
   Scroll reveal
========================= */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute("data-reveal-delay");
      if (delay) entry.target.style.transitionDelay = `${Number(delay)}ms`;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  }
}, { threshold: 0.10 });

revealEls.forEach(el => io.observe(el));

/* =========================
   Terminal Visual (typing)
========================= */
const terminalBody = document.getElementById("terminalBody");

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function makeLine(prompt, cmd, withCursor = false) {
  const cursor = withCursor ? `<span class="cursor">█</span>` : "";
  return `
    <div class="termLine">
      <span class="termPrompt">${escapeHtml(prompt)}</span>
      <span class="termCmd">${escapeHtml(cmd)}</span>${cursor}
    </div>
  `;
}

function makeOut(text) {
  return `<div class="termOut">${escapeHtml(text)}</div>`;
}

function append(html) {
  if (!terminalBody) return;
  terminalBody.insertAdjacentHTML("beforeend", html);
  // Keep the latest content visible-ish without scrolling bars
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

async function typeCommand(prompt, command, speed = 22) {
  if (!terminalBody) return;

  // Insert empty line with cursor
  const id = `cmd_${Math.random().toString(16).slice(2)}`;
  append(`<div id="${id}">${makeLine(prompt, "", true)}</div>`);
  const lineEl = document.getElementById(id);

  let typed = "";
  for (const ch of command) {
    typed += ch;
    if (lineEl) lineEl.innerHTML = makeLine(prompt, typed, true);
    await sleep(speed);
  }
  // Remove cursor
  if (lineEl) lineEl.innerHTML = makeLine(prompt, typed, false);
  await sleep(220);
}

function clearTerminalSoft() {
  if (!terminalBody) return;
  terminalBody.innerHTML = "";
}

const scriptSteps = [
  {
    cmd: "whoami",
    out:
`zack_moss

Computer Engineering (TMU, 2022–2026)
Focus: RTL / FPGA / VLSI | GPA: 3.8/4.0`
  },
  {
    cmd: "ls projects",
    out:
`matrix_mul_accel.sv
cpu_microarch.vhd
cmos_alu_130nm/
pll_cdr_serial_link/
autonomous_drone_gates/
fpga_cache_controller.vhd
digital_pong_fpga.vhd`
  },
  {
    cmd: "cat projects/matrix_mul_accel.sv | head",
    out:
`✔ Designed a matrix multiplication accelerator module
✔ Verified functionality using Verilator
✔ Debugged dataflow in GTKWave until behavior matched spec`
  },
  {
    cmd: "cat projects/pll_cdr_serial_link/README.md",
    out:
`Phase-tracking PLL CDR (transition-based recovery)
- Timing embedded in data stream
- Reused CTLE + slicer front-end
- Implemented PLL phase alignment + lock behavior`
  },
  {
    cmd: "show skills --compact",
    out:
`RTL/HDL: SystemVerilog (strongest), VHDL
FPGA/EDA: Xilinx ISE (Spartan-3E), Intel Quartus Prime
Sim/Debug: Verilator, GTKWave
VLSI: Cadence Virtuoso (130nm), DRC/LVS`
  },
  {
    cmd: "echo \"Let's build something clean & correct.\"",
    out: "Let's build something clean & correct."
  }
];

async function runTerminalLoop() {
  if (!terminalBody) return;

  const prompt = "zack@portfolio:~$";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // If reduced motion, show a static version
  if (reducedMotion) {
    append(makeLine(prompt, "whoami"));
    append(makeOut(scriptSteps[0].out));
    append(makeLine(prompt, "show skills --compact"));
    append(makeOut(scriptSteps[4].out));
    return;
  }

  while (true) {
    clearTerminalSoft();

    // Intro banner
    append(makeOut(
`Welcome.
Type-cycled portfolio preview:
• projects • skills • highlights`
    ));

    for (const step of scriptSteps) {
      await sleep(320);
      await typeCommand(prompt, step.cmd, 18);
      append(makeOut(step.out));
    }

    await sleep(1200);
  }
}

runTerminalLoop();

/* =========================
   Contact form -> mailto
========================= */
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(contactForm);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    // Update this email to your real one:
    const to = "you@example.com";
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(
`Hi Zack,

${message}

— ${name}
${email}`
    );

    // Opens the user's email client
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    if (formNote) {
      formNote.textContent = "Opened your email client with a pre-filled draft.";
    }
  });
}

/* =========================
   Footer year
========================= */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
