// js/script.js

// Elements for progress
const progressForm = document.getElementById('progress-form');
const progressListUl = document.querySelector('#progress-list ul');

// Elements for questions
const questionForm = document.getElementById('question-form');
const questionsListUl = document.querySelector('#questions-list ul');

// Load saved progress from localStorage or initialize empty array
let progressEntries = JSON.parse(localStorage.getItem('progressEntries')) || [];
// Load saved questions from localStorage or initialize empty array
let questions = JSON.parse(localStorage.getItem('questions')) || [];

// Function to display progress entries in the list
function displayProgress() {
  progressListUl.innerHTML = '';
  if (progressEntries.length === 0) {
    progressListUl.innerHTML = '<li>No progress added yet.</li>';
    return;
  }
  // Sort by date descending
  progressEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  progressEntries.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.date}</strong>: ${entry.text}`;
    progressListUl.appendChild(li);
  });
}

// Function to display questions in the list
function displayQuestions() {
  questionsListUl.innerHTML = '';
  if (questions.length === 0) {
    questionsListUl.innerHTML = '<li>No questions posted yet.</li>';
    return;
  }
  // Show newest questions on top
  questions.slice().reverse().forEach(q => {
    const li = document.createElement('li');
    li.textContent = q;
    questionsListUl.appendChild(li);
  });
}

// Event listener for progress form submission
progressForm.addEventListener('submit', e => {
  e.preventDefault();
  const date = progressForm.date.value;
  const text = progressForm['progress-text'].value.trim();

  if (!date || !text) return;

  // Add new entry
  progressEntries.push({ date, text });
  localStorage.setItem('progressEntries', JSON.stringify(progressEntries));

  // Reset form and update display
  progressForm.reset();
  displayProgress();
});

// Event listener for question form submission
questionForm.addEventListener('submit', e => {
  e.preventDefault();
  const questionText = questionForm.question.value.trim();

  if (!questionText) return;

  questions.push(questionText);
  localStorage.setItem('questions', JSON.stringify(questions));

  questionForm.reset();
  displayQuestions();
});

// Initial display on page load
displayProgress();
displayQuestions();
