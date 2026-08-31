// Exam / drill engine. Pairs with exam.css. Used by everything in ../exams/.
//
// Markup contract:
//   .exq[data-points="3"]  → one question
//     .exq-reveal          → button that opens .exq-answer
//     .exq-answer          → model answer + rubric + traps (hidden until revealed)
//     .selfgrade           → auto-injected after reveal; buttons carry data-credit
//   .scorebar              → auto-populated running score (optional, one per page)
//
// Self-graded because every answer is free-response prose/equations — no auto-marking.

document.addEventListener("DOMContentLoaded", () => {
  const questions = Array.from(document.querySelectorAll(".exq"));
  questions.forEach(initQuestion);
  buildScorebar(questions);
  updateScore();
});

function initQuestion(exq) {
  const btn = exq.querySelector(".exq-reveal");
  const answer = exq.querySelector(".exq-answer");
  if (!btn || !answer) return;

  btn.addEventListener("click", () => {
    const open = answer.classList.toggle("show");
    btn.textContent = open ? "ซ่อนเฉลย" : "ดูเฉลย";
    if (open && !exq.querySelector(".selfgrade")) injectSelfGrade(exq, answer);
  });
}

function injectSelfGrade(exq, answer) {
  const pts = parseFloat(exq.dataset.points || "1");
  const wrap = document.createElement("div");
  wrap.className = "selfgrade";
  wrap.innerHTML =
    `<span class="sg-q">ให้คะแนนตัวเอง (เต็ม ${pts}):</span>` +
    `<button data-credit="full">ถูกครบ · ${pts}</button>` +
    `<button data-credit="half">ถูกบางส่วน · ${round(pts / 2)}</button>` +
    `<button data-credit="zero">ยังไม่ได้ · 0</button>`;

  wrap.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach((x) => x.classList.remove("picked"));
      b.classList.add("picked");
      exq.dataset.credit = b.dataset.credit;
      updateScore();
    });
  });
  answer.appendChild(wrap);
}

function creditValue(exq) {
  const pts = parseFloat(exq.dataset.points || "1");
  switch (exq.dataset.credit) {
    case "full": return pts;
    case "half": return pts / 2;
    case "zero": return 0;
    default: return null; // not yet graded
  }
}

function buildScorebar(questions) {
  const bar = document.querySelector(".scorebar");
  if (!bar) return;
  const total = questions.reduce((s, q) => s + parseFloat(q.dataset.points || "1"), 0);
  bar.innerHTML =
    `<span class="sb-score" data-role="score">0 / ${round(total)} คะแนน</span>` +
    `<span class="sb-bar"><span class="sb-fill"></span></span>` +
    `<span data-role="progress" style="color:var(--ink-soft)">ตรวจแล้ว 0/${questions.length} ข้อ</span>` +
    `<button data-role="reset">ล้างคำตอบทั้งหมด</button>`;

  bar.querySelector('[data-role="reset"]').addEventListener("click", () => {
    if (!confirm("ล้างคำตอบและคะแนนทั้งหมดในชุดนี้?")) return;
    questions.forEach((q) => {
      delete q.dataset.credit;
      const ta = q.querySelector("textarea");
      if (ta) ta.value = "";
      const ans = q.querySelector(".exq-answer");
      if (ans) ans.classList.remove("show");
      const rb = q.querySelector(".exq-reveal");
      if (rb) rb.textContent = "ดูเฉลย";
      q.querySelectorAll(".selfgrade button").forEach((b) => b.classList.remove("picked"));
    });
    updateScore();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function updateScore() {
  const bar = document.querySelector(".scorebar");
  const questions = Array.from(document.querySelectorAll(".exq"));
  const total = questions.reduce((s, q) => s + parseFloat(q.dataset.points || "1"), 0);
  const graded = questions.filter((q) => creditValue(q) !== null);
  const earned = graded.reduce((s, q) => s + creditValue(q), 0);

  if (bar) {
    bar.querySelector('[data-role="score"]').textContent =
      `${round(earned)} / ${round(total)} คะแนน`;
    bar.querySelector('[data-role="progress"]').textContent =
      `ตรวจแล้ว ${graded.length}/${questions.length} ข้อ`;
    const pct = total > 0 ? (earned / total) * 100 : 0;
    bar.querySelector(".sb-fill").style.width = pct + "%";
  }

  const summary = document.querySelector('[data-role="summary"]');
  if (summary) {
    if (graded.length === 0) {
      summary.textContent = "ยังไม่ได้ตรวจข้อไหนเลย — ทำให้ครบก่อนแล้วค่อยกดเฉลยทีละข้อ";
    } else {
      const pct = Math.round((earned / total) * 100);
      const missed = questions
        .filter((q) => q.dataset.credit === "zero" || q.dataset.credit === "half")
        .map((q) => q.querySelector(".exq-num")?.textContent.trim())
        .filter(Boolean);
      summary.innerHTML =
        `ได้ <strong>${round(earned)}/${round(total)}</strong> คะแนน (${pct}%) · ตรวจแล้ว ${graded.length}/${questions.length} ข้อ` +
        (missed.length ? `<br>ข้อที่ยังไม่เต็ม: <strong>${missed.join(", ")}</strong> — กลับไปอ่านหัวข้อที่ tag ไว้ของข้อนั้น` : "<br>เต็มทุกข้อที่ตรวจแล้ว");
    }
  }
}

function round(n) {
  return Math.round(n * 100) / 100;
}
