// ====== Utils ======

function $(id) {
  return document.getElementById(id);
}

function saveData(data) {
  localStorage.setItem("techelevateData", JSON.stringify(data));
}

function loadData() {
  const d = localStorage.getItem("techelevateData");
  if (d) return JSON.parse(d);
  // Initialize structure if no data
  return {
    users: [],          // {username, role, activities:[], progress:[], questions:[]}
    materials: [],      // {id, title, url, description, date}
    questions: []       // {id, username, question, answer, date}
  };
}

function getUser(data, username) {
  return data.users.find(u => u.username === username);
}

function addUser(data, username, role) {
  let user = getUser(data, username);
  if (!user) {
    user = { username, role, activities: [], progress: [] };
    data.users.push(user);
  }
  return user;
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ====== App State ======
let appData = loadData();
let currentUser = null;

// ====== DOM Elements ======
const loginSection = $("login-section");
const dashboardSection = $("dashboard");

const usernameInput = $("username");
const roleSelect = $("role");
const loginForm = $("login-form");

const welcomeMsg = $("welcome-msg");
const logoutBtn = $("logout-btn");

const sidebar = $("sidebar");
const activitiesList = $("activities-list");
const activityInput = $("activity-input");
const addActivityBtn = $("add-activity-btn");

const teacherView = $("teacher-view");
const studentView = $("student-view");

// Teacher elements
const postMaterialForm = $("post-material-form");
const materialTitleInput = $("material-title");
const materialUrlInput = $("material-url");
const materialDescInput = $("material-desc");
const materialsList = $("materials-list");
const searchMaterialsInput = $("search-materials");
const questionsList = $("questions-list");

// Student elements
const searchStudentMaterialsInput = $("search-student-materials");
const studentMaterialsList = $("student-materials-list");

const askQuestionForm = $("ask-question-form");
const questionText = $("question-text");

const studentQuestionsList = $("student-questions-list");

const progressForm = $("progress-form");
const progressText = $("progress-text");
const progressList = $("progress-list");

// ====== Initialization ======

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  welcomeMsg.textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;

  if (currentUser.role === "teacher") {
    sidebar.classList.add("hidden");
    teacherView.classList.remove("hidden");
    studentView.classList.add("hidden");
    renderMaterials();
    renderQuestions();
  } else {
    sidebar.classList.remove("hidden");
    teacherView.classList.add("hidden");
    studentView.classList.remove("hidden");
    renderStudentMaterials();
    renderStudentQuestions();
    renderProgress();
    renderActivities();
  }
}

// ====== Login Handler ======

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const role = roleSelect.value;

  if (!username) {
    alert("Please enter username.");
    return;
  }

  currentUser = addUser(appData, username, role);
  saveData(appData);
  showDashboard();
  loginForm.reset();
});

// ====== Logout Handler ======

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  showLogin();
});

// ====== Teacher: Post Materials ======

postMaterialForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = materialTitleInput.value.trim();
  const url = materialUrlInput.value.trim();
  const desc = materialDescInput.value.trim();

  if (!title || !url) {
    alert("Title and URL are required.");
    return;
  }

  appData.materials.push({
    id: generateId(),
    title,
    url,
    description: desc,
    date: new Date().toISOString(),
  });

  saveData(appData);
  renderMaterials();
  materialTitleInput.value = "";
  materialUrlInput.value = "";
  materialDescInput.value = "";
});

// ====== Render Teacher Materials ======

function renderMaterials(filter = "") {
  const filtered = appData.materials.filter(m =>
    m.title.toLowerCase().includes(filter.toLowerCase()) ||
    m.description.toLowerCase().includes(filter.toLowerCase())
  );
  materialsList.innerHTML = filtered
    .map(
      m => `
    <li>
      <strong>${m.title}</strong> <br/>
      <a href="${m.url}" target="_blank" rel="noopener noreferrer">${m.url}</a><br/>
      <small>${m.description || ""}</small>
    </li>
  `
    )
    .join("");
}

searchMaterialsInput.addEventListener("input", () => {
  renderMaterials(searchMaterialsInput.value);
});

// ====== Student: Render Materials ======

function renderStudentMaterials(filter = "") {
  const filtered = appData.materials.filter(m =>
    m.title.toLowerCase().includes(filter.toLowerCase()) ||
    m.description.toLowerCase().includes(filter.toLowerCase())
  );
  studentMaterialsList.innerHTML = filtered
    .map(
      m => `
    <li>
      <strong>${m.title}</strong> <br/>
      <a href="${m.url}" target="_blank" rel="noopener noreferrer">${m.url}</a><br/>
      <small>${m.description || ""}</small>
    </li>
  `
    )
    .join("");
}

searchStudentMaterialsInput.addEventListener("input", () => {
  renderStudentMaterials(searchStudentMaterialsInput.value);
});

// ====== Student: Ask Question ======

askQuestionForm.addEventListener("submit", e => {
  e.preventDefault();
  const question = questionText.value.trim();
  if (!question) {
    alert("Please enter a question.");
    return;
  }
  appData.questions.push({
    id: generateId(),
    username: currentUser.username,
    question,
    answer: null,
    date: new Date().toISOString(),
  });
  saveData(appData);
  questionText.value = "";
  renderStudentQuestions();
  renderQuestions(); // update teacher's question list if teacher logged in
});

// ====== Student: Render Own Questions and Answers ======

function renderStudentQuestions() {
  const myQuestions = appData.questions.filter(q => q.username === currentUser.username);
  if (myQuestions.length === 0) {
    studentQuestionsList.innerHTML = "<li>No questions asked yet.</li>";
    return;
  }
  studentQuestionsList.innerHTML = myQuestions
    .map(
      q => `
      <li>
        <strong>Q:</strong> ${q.question} <br/>
        <strong>A:</strong> ${q.answer ? q.answer : "<em>Not answered yet</em>"}
      </li>
    `
    )
    .join("");
}

// ====== Teacher: Render All Questions with answer option ======

function renderQuestions() {
  if (currentUser.role !== "teacher") return;

  if (appData.questions.length === 0) {
    questionsList.innerHTML = "<li>No questions from students.</li>";
    return;
  }

  questionsList.innerHTML = appData.questions
    .map(
      q => `
      <li data-id="${q.id}">
        <strong>${q.username} asks:</strong> ${q.question} <br/>
        <strong>Answer:</strong> ${
          q.answer
            ? q.answer
            : `<textarea placeholder="Type answer here..." class="answer-input"></textarea>
               <button class="answer-btn">Submit Answer</button>`
        }
      </li>
    `
    )
    .join("");

  // Add event listeners for answer buttons
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const li = e.target.closest("li");
      const id = Number(li.getAttribute("data-id"));
      const answerText = li.querySelector(".answer-input").value.trim();
      if (!answerText) {
        alert("Please enter an answer.");
        return;
      }
      // Save answer
      const q = appData.questions.find(q => q.id === id);
      if (q) {
        q.answer = answerText;
        saveData(appData);
        renderQuestions();
        renderStudentQuestions(); // update student's view if logged in
      }
    });
  });
}

// ====== Student: Progress ======

progressForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = progressText.value.trim();
  if (!text) {
    alert("Please describe your progress.");
    return;
  }

  if (!currentUser.progress) currentUser.progress = [];
  currentUser.progress.push({ id: generateId(), text, date: new Date().toISOString() });
  // Update user in appData.users
  const userIdx = appData.users.findIndex(u => u.username === currentUser.username);
  if (userIdx > -1) {
    appData.users[userIdx] = currentUser;
  }
  saveData(appData);
  progressText.value = "";
  renderProgress();
});

function renderProgress() {
  if (!currentUser.progress || currentUser.progress.length === 0) {
    progressList.innerHTML = "<li>No progress recorded yet.</li>";
    return;
  }
  progressList.innerHTML = currentUser.progress
    .map(p => `<li>${p.text} <small>(${new Date(p.date).toLocaleDateString()})</small></li>`)
    .join("");
}

// ====== Student: Activities (Sidebar) ======

addActivityBtn.addEventListener("click", () => {
  const act = activityInput.value.trim();
  if (!act) return alert("Enter an activity.");
  currentUser.activities.push({ id: generateId(), activity: act, date: new Date().toISOString() });

  // Update user in appData.users
  const userIdx = appData.users.findIndex(u => u.username === currentUser.username);
  if (userIdx > -1) {
    appData.users[userIdx] = currentUser;
  }

  saveData(appData);
  activityInput.value = "";
  renderActivities();
});

function renderActivities() {
  if (!currentUser.activities || currentUser.activities.length === 0) {
    activitiesList.innerHTML = "<li>No activities yet.</li>";
    return;
  }
  activitiesList.innerHTML = currentUser.activities
    .map(a => `<li>${a.activity} <small>(${new Date(a.date).toLocaleDateString()})</small></li>`)
    .join("");
}

// ====== On page load ======

showLogin();
