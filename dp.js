/**
 * Dynamic Programming 0/1 Knapsack Algorithm for Study Optimization
 */

/**
 * Optimizes the study schedule using Dynamic Programming
 * @param {Array} tasks - Array of task objects {name, hours, marks}
 * @param {number} totalHours - Total available hours
 * @returns {Object} Result object containing dp table, pathCells, selected tasks, maxMarks, and hoursUsed
 */
function dpOptimize(tasks, totalHours) {
    const n = tasks.length;
    // Create DP table initialized to 0
    // rows: 0 to n (tasks), cols: 0 to totalHours (capacity)
    const dp = Array.from({ length: n + 1 }, () => Array(totalHours + 1).fill(0));

    // Fill the table using 0/1 Knapsack logic
    for (let i = 1; i <= n; i++) {
        const { hours, marks } = tasks[i - 1];
        for (let w = 0; w <= totalHours; w++) {
            if (hours <= w) {
                // Task can be included
                dp[i][w] = Math.max(marks + dp[i - 1][w - hours], dp[i - 1][w]);
            } else {
                // Task cannot be included
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Trace back to find selected tasks and optimal path
    const selected = [];
    const pathCells = new Set();
    let w = totalHours;
    let hoursUsed = 0;

    for (let i = n; i > 0; i--) {
        // Add the current cell to path
        pathCells.add(`${i},${w}`);
        
        // If the value changed from the row above, the task was selected
        if (dp[i][w] !== dp[i - 1][w]) {
            selected.push(tasks[i - 1]);
            hoursUsed += tasks[i - 1].hours;
            w -= tasks[i - 1].hours;
        }
    }
    // Add the final cell in row 0
    pathCells.add(`0,${w}`);

    return {
        dp,
        pathCells,
        selected: selected.reverse(),
        maxMarks: dp[n][totalHours],
        hoursUsed
    };
}

/**
 * Compares with Greedy approach (sorting by marks/hour ratio)
 * @param {Array} tasks - Array of task objects {name, hours, marks}
 * @param {number} totalHours - Total available hours
 * @returns {Object} Result object containing selected tasks, totalMarks, and hoursUsed
 */
function greedyCompare(tasks, totalHours) {
    // Sort tasks by marks/hours ratio descending
    const sortedTasks = [...tasks].sort((a, b) => (b.marks / b.hours) - (a.marks / a.hours));
    
    const selected = [];
    let remainingHours = totalHours;
    let totalMarks = 0;
    let hoursUsed = 0;

    for (const task of sortedTasks) {
        if (task.hours <= remainingHours) {
            selected.push(task);
            remainingHours -= task.hours;
            totalMarks += task.marks;
            hoursUsed += task.hours;
        }
    }

    return {
        selected,
        totalMarks,
        hoursUsed
    };
}
