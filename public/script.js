// script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const submitBtn = document.getElementById('submit-btn');
    const loadingIndicator = document.getElementById('loading');
    const subtaskList = document.getElementById('subtask-list');
    const resultsTitle = document.getElementById('results-title');

    submitBtn.addEventListener('click', decomposeTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            decomposeTask();
        }
    });

    async function decomposeTask() {
        const task = taskInput.value.trim();
        if (!task) {
            alert('Please enter a task.');
            return;
        }

        // Reset UI
        subtaskList.innerHTML = '';
        resultsTitle.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            const response = await fetch('/api/decompose-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: task }),
            });

            if (!response.ok) {
                throw new Error('Something went wrong on the server.');
            }

            const subtasks = await response.json();
            displaySubtasks(subtasks);

        } catch (error) {
            console.error('Error:', error);
            subtaskList.innerHTML = '<li>Failed to get a plan. Please try again.</li>';
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function displaySubtasks(subtasks) {
        if (subtasks.length === 0) {
            resultsTitle.classList.remove('hidden');
            subtaskList.innerHTML = '<li>This task seems simple enough! You got this.</li>';
            return;
        }
        
        resultsTitle.classList.remove('hidden');
        subtasks.forEach(item => {
            const li = document.createElement('li');
            
            const taskName = document.createElement('span');
            taskName.className = 'task-name';
            taskName.textContent = item.subtask;
            
            const taskTime = document.createElement('span');
            taskTime.className = 'task-time';
            taskTime.textContent = item.time;
            
            li.appendChild(taskName);
            li.appendChild(taskTime);
            
            subtaskList.appendChild(li);
        });
    }
});