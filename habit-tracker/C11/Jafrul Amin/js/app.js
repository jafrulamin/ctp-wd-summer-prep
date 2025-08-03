// simple ID generator
function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

let habits = [];

// load from localStorage
function loadHabits() {
  const data = localStorage.getItem('habits');
  if (data) {
    habits = JSON.parse(data);
  }
}

// save to localStorage
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// render all habits
function renderHabits() {
  const ul = document.getElementById('habits');
  ul.innerHTML = '';

  habits.forEach(h => {
    const li = document.createElement('li');
    li.className = 'habit-item';

    const info = document.createElement('div');
    info.className = 'habit-info';
    info.innerHTML = `<strong>${h.name}</strong> (${h.frequency})<br>
      Streak: ${calcCurrentStreak(h)} | Longest: ${h.longestStreak || 0}`;

    const actions = document.createElement('div');
    actions.className = 'habit-actions';

    // mark complete button for today
    const markBtn = document.createElement('button');
    markBtn.textContent = '✓ Today';
    markBtn.onclick = () => {
      toggleComplete(h.id, today());
      saveHabits();
      renderHabits();
    };

    // delete
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      habits = habits.filter(x => x.id !== h.id);
      saveHabits();
      renderHabits();
    };

    actions.append(markBtn, delBtn);
    li.append(info, actions);
    ul.append(li);
  });
}

// toggle today's completion
function toggleComplete(id, date) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  const idx = h.entries.indexOf(date);
  if (idx > -1) {
    h.entries.splice(idx, 1);
  } else {
    h.entries.push(date);
  }
  updateLongest(h);
}

// calculate current streak (days)
function calcCurrentStreak(habit) {
  let streak = 0;
  let d = new Date(today());
  while (habit.entries.includes(formatDate(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// update longest streak
function updateLongest(habit) {
  const dates = habit.entries.slice().sort();
  let max = 0, curr = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1]), currD = new Date(dates[i]);
    if ((currD - prev) === 24*60*60*1000) {
      curr++;
    } else {
      max = Math.max(max, curr);
      curr = 1;
    }
  }
  habit.longestStreak = Math.max(max, curr);
}

// helper for YYYY-MM-DD
function formatDate(d) {
  return d.toISOString().split('T')[0];
}
function today() {
  return formatDate(new Date());
}

// form submit
document.getElementById('habit-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('habit-name').value.trim();
  const freq = document.getElementById('habit-frequency').value;
  if (!name) return;
  habits.push({
    id: uuid(),
    name,
    frequency: freq,
    entries: [],
    longestStreak: 0
  });
  saveHabits();
  renderHabits();
  e.target.reset();
});

// init
loadHabits();
renderHabits();
