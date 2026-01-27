let round = 0;
let selectedModel = null;

const NEXT_DELAY_MS = 600;

// ---------- MODEL DEFINITIONS ----------

const MODEL_IDS = ["A", "B", "C", "D"];

// Visible model names
const MODEL_NAMES = {
  A: "Gab AI",
  B: "Grok",
  C: "GPT",
  D: "Claude"
};

// Color classes (unchanged)
const COLOR_CLASSES = ["purple", "blue", "orange", "green"];

// Randomize model order ONCE per participant
const modelOrder = [...MODEL_IDS].sort(() => Math.random() - 0.5);

// ---------- REVERSED QUESTION ORDER ----------
// data.js: Political (0–3), Non-political (4–7)
// Reversed = Non-political → Political
const ORDERED_DATA = [
  ...window.LLM_DATA.slice(4), // Non-political
  ...window.LLM_DATA.slice(0, 4) // Political
];

// ---------- DOM REFERENCES ----------

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

// ---------- UTIL ----------

const timestamp = () => Date.now();

// ---------- LOG MODEL ORDER ----------

window.parent.postMessage(
  {
    type: "model_order",
    value: modelOrder.join(","),
    timestamp: timestamp()
  },
  "*"
);

// ---------- LOAD ROUND ----------

function loadRound() {
  const q = ORDERED_DATA[round];
  promptEl.textContent = q.prompt;

  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;
  generateBtn.disabled = false;

  const wrappers = document.querySelectorAll(".answer-wrapper");

  modelOrder.forEach((modelId, i) => {
    const wrapper = wrappers[i];
    const label = wrapper.querySelector(".model-label");
    const card = wrapper.querySelector(".answer-card");

    // Reset classes
    wrapper.className = "answer-wrapper";
    label.className = "model-label";

    // Apply color
    wrapper.classList.add(COLOR_CLASSES[i]);
    label.classList.add(COLOR_CLASSES[i]);

    // Assign model
    wrapper.dataset.model = modelId;

    // Named labels
    label.textContent = MODEL_NAMES[modelId];

    // Answer text
    card.textContent = q.answers[modelId];
    card.classList.remove("selected");
  });
}

// ---------- GENERATE RESPONSES ----------

generateBtn.addEventListener("click", () => {
  generateBtn.disabled = true;
  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");
  }, 700);
});

// ---------- SELECT ANSWER ----------

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
  wrapper.addEventListener("click", () => {
    document.querySelectorAll(".answer-card")
      .forEach(c => c.classList.remove("selected"));

    wrapper.querySelector(".answer-card").classList.add("selected");
    selectedModel = wrapper.dataset.model;

    window.parent.postMessage(
      {
        type: "choiceMade",
        fieldName: `choice_round_${round + 1}`,
        value: selectedModel,
        modelName: MODEL_NAMES[selectedModel],
        timestamp: timestamp()
      },
      "*"
    );

    setTimeout(() => {
      nextBtn.classList.remove("hidden");
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }, NEXT_DELAY_MS);
  });
});

// ---------- NEXT QUESTION ----------

nextBtn.addEventListener("click", () => {
  round++;

  if (round >= ORDERED_DATA.length) {
    window.parent.postMessage(
      { type: "finishedAllRounds", timestamp: timestamp() },
      "*"
    );

    document.getElementById("app").innerHTML =
      "<h2>Thank you, you may now proceed to the next task.</h2>";
    return;
  }

  loadRound();
});

// ---------- INIT ----------

console.log("Condition: NAMED MODELS, NON-POLITICAL FIRST");
loadRound();
