// Shared quiz engine for Data Visualization lessons.
// Multiple choice: .quiz > .options > button.opt[data-correct="true|false"] (+ optional data-note)
// Free response: .quiz.free with textarea + .reveal-btn + .model-answer

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quiz:not(.free)").forEach(initChoiceQuiz);
  document.querySelectorAll(".quiz.free").forEach(initFreeQuiz);
  updateScore();
});

function initChoiceQuiz(quiz) {
  const opts = quiz.querySelectorAll(".opt");
  const feedback = quiz.querySelector(".feedback");
  opts.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (quiz.dataset.answered) return;
      quiz.dataset.answered = "true";
      const isCorrect = btn.dataset.correct === "true";
      opts.forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === "true") b.classList.add("correct");
      });
      if (!isCorrect) btn.classList.add("wrong");
      if (feedback) {
        feedback.classList.add("show", isCorrect ? "good" : "bad");
        feedback.textContent = btn.dataset.note
          ? btn.dataset.note
          : isCorrect
          ? "ถูก."
          : "ผิด. ดูตัวเลือกที่ทำเครื่องหมายไว้.";
      }
      quiz.dataset.result = isCorrect ? "correct" : "wrong";
      updateScore();
    });
  });
}

function initFreeQuiz(quiz) {
  const btn = quiz.querySelector(".reveal-btn");
  const model = quiz.querySelector(".model-answer");
  if (!btn || !model) return;
  btn.addEventListener("click", () => {
    model.classList.toggle("show");
    btn.textContent = model.classList.contains("show")
      ? "ซ่อนคำตอบ"
      : "เฉลย";
    if (model.classList.contains("show") && !quiz.dataset.result) {
      quiz.dataset.result = "reviewed";
      updateScore();
    }
  });
}

function updateScore() {
  const scoreEl = document.querySelector(".quiz-score");
  if (!scoreEl) return;
  const all = document.querySelectorAll(".quiz");
  const done = document.querySelectorAll(".quiz[data-result]");
  const correct = document.querySelectorAll('.quiz[data-result="correct"]').length;
  scoreEl.textContent = `ตอบแล้ว ${done.length}/${all.length} ข้อ · ถูก ${correct} ข้อ`;
}
