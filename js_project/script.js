// --- STATE MANAGEMENT ---
let tasksByDate = JSON.parse(localStorage.getItem("mern_v_final_tasks")) || {};
let profile = JSON.parse(localStorage.getItem("user_v_final_profile")) || {
  name: "Productive Hero",
  image: `https://ui-avatars.com/api/?name=Hero&background=0D8ABC&color=fff&size=512`,
  xp: 0,
};
let selectedDate = new Date().toISOString().split("T")[0];
let isDark = localStorage.getItem("theme") === "dark";

// --- VISUAL NOTIFICATIONS ---
const notify = (msg, icon = "✨") => {
  const toast = document.getElementById("toast");
  document.getElementById("toastIcon").innerText = icon;
  document.getElementById("toastMsg").innerText = msg;
  toast.classList.replace("translate-y-[200%]", "translate-y-0");
  toast.classList.replace("opacity-0", "opacity-100");
  setTimeout(() => {
    toast.classList.replace("translate-y-0", "translate-y-[200%]");
    toast.classList.replace("opacity-100", "opacity-0");
  }, 3000);
};

const celebrate = () => {
  const scalar = 2;
  const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });
  confetti({
    shapes: [triangle],
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#2563eb", "#ffffff", "#000000"],
  });
};

// --- CORE APP ENGINE ---
const initApp = () => {
  document.documentElement.classList.toggle("dark", isDark);
  document.getElementById("datePicker").value = selectedDate;
  updateGlobalUI();
};

const updateGlobalUI = () => {
  renderProfile();
  renderTasks();
  renderSidebarHistory();
  calculateStats();
};

const renderProfile = () => {
  const level = Math.floor(profile.xp / 100) + 1;
  const rank =
    level > 10 ? "Elite Architect" : level > 4 ? "Pro Dev" : "Novice";

  // Multi-point injection for profile state
  document.getElementById("welcomeTitle").innerText =
    `Hi, ${profile.name.split(" ")[0]}!`;
  document.getElementById("sideName").innerText = profile.name;
  document.getElementById("sideRank").innerText = `${rank} • LVL ${level}`;
  document.getElementById("xpCounter").innerText = `${profile.xp} XP`;
  document.getElementById("xpProgress").style.width = (profile.xp % 100) + "%";

  document
    .querySelectorAll("#sideAvatar, #mainAvatar, #editAvatar")
    .forEach((img) => (img.src = profile.image));
  document.getElementById("nameInput").value = profile.name;
};

// REACTION: Live-sync profile name while typing
document.getElementById("nameInput").addEventListener("input", (e) => {
  profile.name = e.target.value;
  renderProfile(); // Instant feedback loop
});

const renderTasks = () => {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  const dailyData = tasksByDate[selectedDate] || [];

  if (dailyData.length === 0) {
    list.innerHTML = `
            <div class="text-center py-20 animate-pulse">
                <div class="text-8xl mb-6 opacity-20">📂</div>
                <p class="font-black text-slate-300 dark:text-gray-700 uppercase tracking-[0.5em] text-sm">Agenda is empty</p>
            </div>`;
  }

  dailyData.forEach((t) => {
    const li = document.createElement("li");
    li.className = `flex justify-between items-center p-8 rounded-4xl border-4 transition-all duration-300 group ${t.completed ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 shadow-inner" : "bg-white dark:bg-gray-800 border-slate-50 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none"}`;
    li.innerHTML = `
            <div class="flex items-center gap-8">
                <div onclick="toggleTask(${t.id})" class="w-12 h-12 rounded-2xl border-[5px] cursor-pointer flex items-center justify-center transition-all ${t.completed ? "bg-blue-600 border-blue-600 rotate-[360deg] scale-110" : "border-slate-200 dark:border-gray-600 hover:border-blue-500"}">
                    ${t.completed ? '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>' : ""}
                </div>
                <span class="text-2xl font-black ${t.completed ? "line-through text-slate-400 opacity-40" : "text-slate-800 dark:text-white"}">${t.text}</span>
            </div>
            <button onclick="deleteTask(${t.id})" class="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        `;
    list.appendChild(li);
  });
};

const addTask = () => {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return notify("Please type something!", "⚠️");
  if (!tasksByDate[selectedDate]) tasksByDate[selectedDate] = [];

  tasksByDate[selectedDate].unshift({
    id: Date.now(),
    text: input.value.trim(),
    completed: false,
  });
  input.value = "";
  saveAndSync();
  notify("Task Locked In", "🎯");
};

const toggleTask = (id) => {
  const list = tasksByDate[selectedDate];
  const task = list.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      profile.xp += 20;
      saveProfile();
      // Check for Daily Perfection
      if (list.every((t) => t.completed)) {
        celebrate();
        notify("Daily Perfection Reached!", "🏆");
      }
    }
  }
  saveAndSync();
};

const deleteTask = (id) => {
  tasksByDate[selectedDate] = tasksByDate[selectedDate].filter(
    (t) => t.id !== id,
  );
  saveAndSync();
  notify("Task Removed", "🗑️");
};

const saveAndSync = () => {
  localStorage.setItem("mern_v_final_tasks", JSON.stringify(tasksByDate));
  updateGlobalUI();
};

const saveProfile = () => {
  localStorage.setItem("user_v_final_profile", JSON.stringify(profile));
  renderProfile();
};

const saveProfileChanges = () => {
  saveProfile();
  notify("Profile Synchronized", "💾");
};

const calculateStats = () => {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasksByDate[today] || [];
  const done = todayTasks.filter((t) => t.completed).length;
  const percent = todayTasks.length
    ? Math.round((done / todayTasks.length) * 100)
    : 0;

  document.getElementById("todayProgress").style.width = percent + "%";
  document.getElementById("todayPercent").innerText = percent + "%";
  document.getElementById("taskStatCount").innerText = (
    tasksByDate[selectedDate] || []
  ).filter((t) => !t.completed).length;
};

const renderSidebarHistory = () => {
  const container = document.getElementById("dateHistoryList");
  container.innerHTML = "";
  // Show only the 3 most recent active days
  Object.keys(tasksByDate)
    .sort()
    .reverse()
    .slice(0, 3)
    .forEach((date) => {
      const div = document.createElement("div");
      div.className = `p-5 rounded-3xl cursor-pointer border-4 transition-all active:scale-95 ${date === selectedDate ? "bg-blue-600 border-blue-600 text-white shadow-xl" : "bg-slate-50 dark:bg-gray-800/50 border-transparent hover:border-blue-500"}`;
      div.innerHTML = `<p class="text-[10px] font-black uppercase tracking-widest">${date}</p>`;
      div.onclick = () => {
        selectedDate = date;
        document.getElementById("datePicker").value = date;
        updateGlobalUI();
      };
      container.appendChild(div);
    });
};

// --- SYSTEM CONTROLS ---
document.getElementById("themeToggle").addEventListener("click", () => {
  isDark = !isDark;
  localStorage.setItem("theme", isDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", isDark);
  document.getElementById("themeIcon").innerText = isDark ? "☀️" : "🌙";
});

document.getElementById("imageUpload").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = (ev) => {
    profile.image = ev.target.result;
    saveProfile();
    notify("New Photo Set", "🖼️");
  };
  reader.readAsDataURL(e.target.files[0]);
});

const showPage = (id) => {
  document
    .querySelectorAll(".page-content")
    .forEach((p) => p.classList.add("hidden"));
  document.getElementById(`${id}-page`).classList.remove("hidden");
  toggleSidebar(false);
};

const toggleSidebar = (open) => {
  document
    .getElementById("sidebar")
    .classList.toggle("-translate-x-full", !open);
  document.getElementById("sidebarOverlay").classList.toggle("hidden", !open);
};

const openResetModal = () => {
  const modal = document.getElementById("resetModal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    document
      .getElementById("modalContent")
      .classList.replace("opacity-0", "opacity-100");
    document
      .getElementById("modalContent")
      .classList.replace("scale-90", "scale-100");
  }, 50);
};

const closeResetModal = () => {
  document.getElementById("resetModal").classList.add("hidden");
  document
    .getElementById("modalContent")
    .classList.replace("opacity-100", "opacity-0");
  document
    .getElementById("modalContent")
    .classList.replace("scale-100", "scale-90");
};

const executeReset = () => {
  document.getElementById("resetOptions").classList.add("hidden");
  document.getElementById("resetLoading").classList.remove("hidden");
  setTimeout(() => {
    localStorage.clear();
    location.reload();
  }, 2000);
};

document.getElementById("datePicker").addEventListener("change", (e) => {
  selectedDate = e.target.value;
  updateGlobalUI();
});
document
  .getElementById("taskInput")
  .addEventListener("keydown", (e) => e.key === "Enter" && addTask());

// BOOTSTRAP APP
initApp();
