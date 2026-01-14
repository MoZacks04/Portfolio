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
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

async function typeCommand(prompt, command, speed = 5) {
  if (!terminalBody) return;

  const id = `cmd_${Math.random().toString(16).slice(2)}`;
  append(`<div id="${id}">${makeLine(prompt, "", true)}</div>`);
  const lineEl = document.getElementById(id);

  let typed = "";
  for (const ch of command) {
    typed += ch;
    if (lineEl) lineEl.innerHTML = makeLine(prompt, typed, true);
    await sleep(speed);
  }
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

  if (reducedMotion) {
    append(makeLine(prompt, "whoami"));
    append(makeOut(scriptSteps[0].out));
    append(makeLine(prompt, "show skills --compact"));
    append(makeOut(scriptSteps[4].out));
    return;
  }

  while (true) {
    clearTerminalSoft();

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
   NEW: 1-Bit Full Adder Playground
========================= */
(function initFullAdderPlayground() {
  // Buttons
  const btnA = document.getElementById("faToggleA");
  const btnB = document.getElementById("faToggleB");
  const btnCin = document.getElementById("faToggleCin");

  // Output pills + values
  const sumPill = document.getElementById("faSumPill");
  const sumDot  = document.getElementById("faSumDot");
  const sumVal  = document.getElementById("faSumValue");

  const coutPill = document.getElementById("faCoutPill");
  const coutDot  = document.getElementById("faCoutDot");
  const coutVal  = document.getElementById("faCoutValue");

  // Inputs label + readouts
  const inputsBinary = document.getElementById("faInputsBinary");
  const readA   = document.getElementById("faReadA");
  const readB   = document.getElementById("faReadB");
  const readCin = document.getElementById("faReadCin");
  const readSum = document.getElementById("faReadSum");
  const readCout= document.getElementById("faReadCout");

  // SVG wires
  const wireA   = document.getElementById("faWireA");
  const wireB   = document.getElementById("faWireB");
  const wireCin = document.getElementById("faWireCin");
  const wireSum = document.getElementById("faWireSum");
  const wireCout= document.getElementById("faWireCout");

  // Sequence chips
  const seqRead  = document.getElementById("faSeqRead");
  const seqXor1  = document.getElementById("faSeqXor1");
  const seqSum   = document.getElementById("faSeqSum");
  const seqCarry = document.getElementById("faSeqCarry");

  // Truth table rows
  const truthBody = document.getElementById("faTruthBody");
  const rows = truthBody ? Array.from(truthBody.querySelectorAll(".nand__tr")) : [];

  // If section isn't on the page, do nothing
  if (!btnA || !btnB || !btnCin || !sumPill || !coutPill) return;

  // Local state
  let A = 0;
  let B = 0;
  let Cin = 0;

  const COLORS = {
    red: "rgb(239, 68, 68)",
    whiteDim: "rgba(255, 255, 255, 0.22)",
    green: "rgb(52, 211, 153)",
  };

  function fullAdder(a, b, cin) {
    const sum = (a ^ b) ^ cin;
    const cout = (a & b) | (a & cin) | (b & cin);
    return { sum, cout };
  }

  function setPressed(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("is-on", !!on);
  }

  function setPill(pill, dot, valueEl, on) {
    if (valueEl) valueEl.textContent = String(on ? 1 : 0);
    pill.classList.toggle("is-green", !!on);
    if (dot) dot.classList.toggle("is-green", !!on);
  }

  function highlightTruthRow(a, b, c) {
    if (!rows.length) return;
    rows.forEach(r => r.classList.remove("is-active"));
    const match = rows.find(r =>
      r.getAttribute("data-a") === String(a) &&
      r.getAttribute("data-b") === String(b) &&
      r.getAttribute("data-c") === String(c)
    );
    if (match) match.classList.add("is-active");
  }

  function updateUI() {
    const { sum, cout } = fullAdder(A, B, Cin);

    // Inputs binary
    if (inputsBinary) inputsBinary.textContent = `${A}${B}${Cin}`;

    // Readouts
    if (readA) readA.textContent = String(A);
    if (readB) readB.textContent = String(B);
    if (readCin) readCin.textContent = String(Cin);
    if (readSum) readSum.textContent = String(sum);
    if (readCout) readCout.textContent = String(cout);

    // Buttons
    setPressed(btnA, A === 1);
    setPressed(btnB, B === 1);
    setPressed(btnCin, Cin === 1);

    // Output pills
    setPill(sumPill, sumDot, sumVal, sum === 1);
    setPill(coutPill, coutDot, coutVal, cout === 1);

    // Wires: inputs red when 1
    if (wireA) wireA.style.stroke = A ? COLORS.red : COLORS.whiteDim;
    if (wireB) wireB.style.stroke = B ? COLORS.red : COLORS.whiteDim;
    if (wireCin) wireCin.style.stroke = Cin ? COLORS.red : COLORS.whiteDim;

    // Output wires: green when 1, red when 0
    if (wireSum) wireSum.style.stroke = sum ? COLORS.green : COLORS.red;
    if (wireCout) wireCout.style.stroke = cout ? COLORS.green : COLORS.red;

    // Sequence chips
    const x1 = (A ^ B);
    if (seqRead) seqRead.textContent = `read A=${A}, B=${B}, Cin=${Cin}`;
    if (seqXor1) seqXor1.textContent = `X1 = A ⊕ B = ${x1}`;
    if (seqSum) seqSum.textContent = `SUM = X1 ⊕ Cin = ${sum}`;
    if (seqCarry) seqCarry.textContent = `COUT = (AB + AC + BC) = ${cout}`;

    // Truth table highlight
    highlightTruthRow(A, B, Cin);
  }

  btnA.addEventListener("click", () => { A = A ? 0 : 1; updateUI(); });
  btnB.addEventListener("click", () => { B = B ? 0 : 1; updateUI(); });
  btnCin.addEventListener("click", () => { Cin = Cin ? 0 : 1; updateUI(); });

  // Initial paint
  updateUI();
})();

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

