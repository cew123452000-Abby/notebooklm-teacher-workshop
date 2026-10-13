const storageKey = "notebooklm-workshop-v1";
const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
state.completed ??= [];
state.notes ??= {};
state.level ??= "beginner";

const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
const moduleNames = [
  "建立筆記本", "匯入與理解教材", "教材心智圖", "AI 協作教案",
  "教學資源製作", "核心概念影片", "成果分享與反思"
];

function updateProgress() {
  const count = state.completed.length;
  const percent = Math.round((count / 7) * 100);
  document.querySelector("#progressText").textContent = `${count}／7`;
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector("#topProgress").textContent = `${percent}%`;
}

document.querySelectorAll("[data-complete]").forEach(input => {
  const id = Number(input.dataset.complete);
  input.checked = state.completed.includes(id);
  input.addEventListener("change", () => {
    state.completed = input.checked
      ? [...new Set([...state.completed, id])].sort((a, b) => a - b)
      : state.completed.filter(item => item !== id);
    save(); updateProgress();
  });
});

function applyLevel(level) {
  state.level = level;
  document.querySelectorAll(".level-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.level === level));
  document.querySelectorAll(".beginner-task").forEach(el => el.hidden = level !== "beginner");
  document.querySelectorAll(".advanced-task").forEach(el => el.hidden = level !== "advanced");
  save();
}
document.querySelectorAll(".level-btn").forEach(btn => btn.addEventListener("click", () => applyLevel(btn.dataset.level)));
applyLevel(state.level);

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = btn.closest(".prompt-card").querySelector("pre").textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast("已複製提示詞");
    } catch {
      const area = document.createElement("textarea");
      area.value = text; document.body.appendChild(area); area.select();
      document.execCommand("copy"); area.remove(); showToast("已複製提示詞");
    }
  });
});

document.querySelectorAll(".resource-tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    document.querySelectorAll(".resource-tabs button").forEach(item => item.setAttribute("aria-selected", String(item === btn)));
    document.querySelectorAll("[data-panel]").forEach(panel => panel.hidden = panel.dataset.panel !== target);
  });
});

document.querySelectorAll("[data-note]").forEach(area => {
  area.value = state.notes[area.dataset.note] || "";
  area.addEventListener("input", () => { state.notes[area.dataset.note] = area.value; save(); });
});

const menuBtn = document.querySelector("#menuBtn");
const sideNav = document.querySelector("#sideNav");
menuBtn.addEventListener("click", () => {
  const open = sideNav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
sideNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  sideNav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
}));

const links = [...sideNav.querySelectorAll("nav a")];
const targets = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
}, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .2, .5] });
targets.forEach(target => observer.observe(target));

const dialog = document.querySelector("#summaryDialog");
function openSummary() {
  document.querySelector("#dialogCount").textContent = state.completed.length;
  document.querySelector("#dialogList").innerHTML = moduleNames.map((name, index) => {
    const done = state.completed.includes(index + 1);
    return `<div class="${done ? "done" : ""}">${String(index + 1).padStart(2, "0")}　${name}　${done ? "已完成" : "尚未完成"}</div>`;
  }).join("");
  dialog.showModal();
}
document.querySelector("#summaryBtn").addEventListener("click", openSummary);
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector("#dialogPrint").addEventListener("click", () => window.print());
document.querySelector("#printBtn").addEventListener("click", () => window.print());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

updateProgress();
