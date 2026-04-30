/**
 * Main Application Logic
 */

// --- State Management ---
let tasks = [
    { id: 1, name: 'Algorithms', hours: 3, marks: 20 },
    { id: 2, name: 'Operating Systems', hours: 4, marks: 25 },
    { id: 3, name: 'Computer Networks', hours: 3, marks: 18 },
    { id: 4, name: 'Database Systems', hours: 2, marks: 15 },
    { id: 5, name: 'Artificial Intelligence', hours: 5, marks: 30 },
    { id: 6, name: 'Web Development', hours: 2, marks: 12 }
];

let nextId = 7;

// --- DOM Elements ---
const inputScreen = document.getElementById('input-screen');
const resultsScreen = document.getElementById('results-screen');
const addTaskForm = document.getElementById('add-task-form');
const taskList = document.getElementById('task-list');
const optimizeBtn = document.getElementById('optimize-btn');
const totalStudyHoursInput = document.getElementById('total-study-hours');
const editTasksBtn = document.getElementById('edit-tasks-btn');

// Results DOM
const selectedTasksContainer = document.getElementById('selected-tasks-container');
const skippedTasksContainer = document.getElementById('skipped-tasks-container');
const dpVisualizationTable = document.getElementById('dp-visualization-table');
const resTotalMarks = document.getElementById('res-total-marks');
const resHoursUsed = document.getElementById('res-hours-used');
const resEfficiency = document.getElementById('res-efficiency');
const dpMaxScoreSpan = document.getElementById('dp-max-score');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderTaskList();
});

// --- Event Handlers ---
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('subject-name').value;
    const hours = parseInt(document.getElementById('hours-needed').value);
    const marks = parseInt(document.getElementById('marks-weightage').value);

    if (name && hours > 0 && marks > 0) {
        tasks.push({ id: nextId++, name, hours, marks });
        renderTaskList();
        addTaskForm.reset();
    }
});

optimizeBtn.addEventListener('click', () => {
    const totalHours = parseInt(totalStudyHoursInput.value);
    if (isNaN(totalHours) || totalHours < 1) {
        alert("Please enter a valid amount of study hours.");
        return;
    }

    if (tasks.length === 0) {
        alert("Please add at least one task.");
        return;
    }

    const dpResult = dpOptimize(tasks, totalHours);
    const greedyResult = greedyCompare(tasks, totalHours);

    showResults(dpResult, greedyResult, totalHours);
});

editTasksBtn.addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    inputScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Functions ---

function renderTaskList() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const mph = (task.marks / task.hours).toFixed(2);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>${task.hours}h</td>
            <td>${task.marks}</td>
            <td>${mph}</td>
            <td>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;
        taskList.appendChild(tr);
    });
}

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    renderTaskList();
};

function showResults(dpResult, greedyResult, totalHours) {
    inputScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Summary stats
    resTotalMarks.textContent = dpResult.maxMarks;
    resHoursUsed.textContent = `${dpResult.hoursUsed}h / ${totalHours}h`;
    const efficiency = totalHours > 0 ? ((dpResult.hoursUsed / totalHours) * 100).toFixed(0) : 0;
    resEfficiency.textContent = `${efficiency}%`;
    dpMaxScoreSpan.textContent = dpResult.maxMarks;

    // Selected Tasks
    selectedTasksContainer.innerHTML = '';
    dpResult.selected.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-card-header">${task.name}</div>
            <div class="task-card-details">
                <span>⏱ ${task.hours} Hours</span> • 
                <span>🏆 ${task.marks} Marks</span>
            </div>
        `;
        selectedTasksContainer.appendChild(card);
    });

    // Skipped Tasks
    skippedTasksContainer.innerHTML = '';
    const selectedIds = new Set(dpResult.selected.map(t => t.id));
    const skipped = tasks.filter(t => !selectedIds.has(t.id));
    
    if (skipped.length === 0) {
        skippedTasksContainer.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">No tasks were skipped!</p>';
    } else {
        skipped.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card skipped';
            card.innerHTML = `
                <div class="task-card-header">${task.name}</div>
                <div class="task-card-details">
                    <span>⏱ ${task.hours} Hours</span> • 
                    <span>🏆 ${task.marks} Marks</span>
                </div>
            `;
            skippedTasksContainer.appendChild(card);
        });
    }

    // DP Table
    renderDPTable(dpResult, totalHours);
}

function renderDPTable(result, totalHours) {
    const { dp, pathCells } = result;
    let html = '<thead><tr><th>Subject \\ Hours</th>';
    
    // Header row (Hours)
    for (let j = 0; j <= totalHours; j++) {
        html += `<th>${j}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Data rows
    for (let i = 0; i <= tasks.length; i++) {
        const subjectName = i === 0 ? "Initial" : tasks[i-1].name;
        html += `<tr><td>${subjectName}</td>`;
        for (let j = 0; j <= totalHours; j++) {
            const isPath = pathCells.has(`${i},${j}`);
            const cellClass = isPath ? 'path-highlight' : '';
            html += `<td class="${cellClass}">${dp[i][j]}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody>';
    dpVisualizationTable.innerHTML = html;
}


