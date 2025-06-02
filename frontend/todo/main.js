// checks if the slected length is zero or not if it is it make it go back to its natural state


//  function that displays the number.of boxes selected;

// Utility functions
function showAlert(message) {
    const alert = document.querySelector('.alert');
    const alertMessage = document.querySelector('.alert-message');
    alertMessage.textContent = message;
    alert.classList.add('show');
}

function hideAlert() {
    const alert = document.querySelector('.alert');
    alert.classList.remove('show');
}

function createTaskElement(value, isCompleted = false) {
    const div = document.createElement('div');
    div.className = `task-item ${isCompleted ? 'completed-task' : ''}`;
    div.draggable = true;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    
    const label = document.createElement('span');
    label.className = `task-text ${isCompleted ? 'completed' : ''}`;
    label.textContent = value;
    
    div.appendChild(checkbox);
    div.appendChild(label);

    // Add drag event listeners
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', value);
        div.classList.add('dragging');
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
    });
    
    return div;
}

function updateColumnActions(columnClass, show) {
    const column = document.querySelector(`.${columnClass}`);
    const actions = column.querySelector('.column-actions');
    const title = column.querySelector('.column-title');
    const checkboxes = column.querySelectorAll('input[type="checkbox"]:checked');
    
    if (show && checkboxes.length > 0) {
        actions.style.display = 'flex';
        title.textContent = `${checkboxes.length} Selected`;
    } else {
        actions.style.display = 'none';
        title.textContent = columnClass === 'board-column:first-child' ? 'TO DO' : 'COMPLETED';
        updateTaskCount();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    reload();
    
    // Add task on Enter
    const addInput = document.querySelector(".addingValue");
    if (addInput) {
        addInput.addEventListener("keydown", async (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                await addtask();
            }
        });
    }
    
    // Setup drag and drop containers
    const todoContainer = document.querySelector(".taskcreate");
    const completedContainer = document.querySelector(".listele");

    [todoContainer, completedContainer].forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) {
                e.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over');
            }
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
    });

    // Handle dropping in completed container
    completedContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        completedContainer.classList.remove('drag-over');
        const taskText = e.dataTransfer.getData('text/plain');
        const sourceElement = document.querySelector('.dragging');
        
        if (!taskText || !sourceElement) return;
        
        try {
            const response = await axios.post("http://localhost:3001/markCompleted", { 
                value: taskText 
            });
            
            if (response.data.success || response.data === "sucess") {
                const taskElement = createTaskElement(taskText, true);
                completedContainer.appendChild(taskElement);
                sourceElement.remove();
                updateTaskCount();
            } else {
                throw new Error("Server returned unsuccessful response");
            }
        } catch (err) {
            console.error("Error completing task:", err);
            showAlert("Failed to move task. Please try again.");
            // Revert the UI if the server request failed
            if (sourceElement) {
                sourceElement.classList.remove('dragging');
            }
        }
    });

    // Handle dropping in todo container
    todoContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        todoContainer.classList.remove('drag-over');
        const taskText = e.dataTransfer.getData('text/plain');
        const sourceElement = document.querySelector('.dragging');
        
        if (!taskText || !sourceElement) return;
        
        try {
            const response = await axios.post("http://localhost:3001/ReversetoTodo", { 
                value: taskText 
            });
            
            if (response.data.success || response.data === "sucess") {
                const taskElement = createTaskElement(taskText, false);
                todoContainer.appendChild(taskElement);
                sourceElement.remove();
                updateTaskCount();
            } else {
                throw new Error("Server returned unsuccessful response");
            }
        } catch (err) {
            console.error("Error reversing task:", err);
            showAlert("Failed to move task. Please try again.");
            // Revert the UI if the server request failed
            if (sourceElement) {
                sourceElement.classList.remove('dragging');
            }
        }
    });

    // Existing checkbox event listeners
    document.querySelector(".taskcreate").addEventListener("change", (event) => {
        if (event.target.matches('input[type="checkbox"]')) {
            const checkboxes = document.querySelectorAll(".taskcreate input[type=checkbox]:checked");
            const actions = document.querySelector('.board-column:first-child .column-actions');
            const title = document.querySelector('.todosub');
            
            if (checkboxes.length > 0) {
                actions.style.display = 'flex';
                title.textContent = `${checkboxes.length} Selected`;
            } else {
                actions.style.display = 'none';
                title.textContent = "TO DO";
                updateTaskCount();
            }
        }
    });
    
    document.querySelector(".listele").addEventListener("change", (event) => {
        if (event.target.matches('input[type="checkbox"]')) {
            const checkboxes = document.querySelectorAll(".listele input[type=checkbox]:checked");
            const actions = document.querySelector('.board-column:last-child .column-actions');
            const title = document.querySelector('.completesub');
            
            if (checkboxes.length > 0) {
                actions.style.display = 'flex';
                title.textContent = `${checkboxes.length} Selected`;
            } else {
                actions.style.display = 'none';
                title.textContent = "COMPLETED";
                updateTaskCount();
            }
        }
    });
});

async function addtask() {
    const input = document.querySelector(".addingValue");
    const value = input.value.trim();
    
    if (!value) {
        showAlert("Please enter a task");
        return;
    }
    
    try {
        input.disabled = true;
        const response = await axios.post("http://localhost:3001/add", { value });
        
        if (response.data === "sucess" || response.data.success) {
            const taskElement = createTaskElement(value);
            document.querySelector(".taskcreate").appendChild(taskElement);
            input.value = "";
            updateTaskCount();
            
            // Show empty state message if needed
            const emptyState = document.querySelector(".taskcreate .empty-state");
            if (emptyState) {
                emptyState.remove();
            }
        } else {
            throw new Error("Failed to add task");
        }
    } catch (error) {
        console.error("Error adding task:", error);
        showAlert(error.response?.data?.message || "Failed to add task. Please try again.");
    } finally {
        input.disabled = false;
        input.focus();
    }
}

async function completeTodo() {
    try {
        const checkboxes = document.querySelectorAll(".taskcreate input[type=checkbox]:checked");
        if (checkboxes.length === 0) {
            showAlert("Please select tasks to complete");
            return;
        }

        for (const checkbox of checkboxes) {
            const taskText = checkbox.nextElementSibling.textContent;
            try {
                const response = await axios.post("http://localhost:3001/markCompleted", { 
                    value: taskText 
                });
                
                if (response.data.success || response.data === "sucess") {
                    const taskElement = createTaskElement(taskText, true);
                    document.querySelector(".listele").appendChild(taskElement);
                    checkbox.closest('.task-item').remove();
                }
            } catch (err) {
                console.error("Error completing task:", taskText, err);
                showAlert(`Failed to complete task: ${taskText}`);
            }
        }

        document.querySelector('.todosub').textContent = "TO DO";
        const actions = document.querySelector('.board-column:first-child .column-actions');
        if (actions) actions.style.display = 'none';
        updateTaskCount();
        
    } catch (error) {
        showAlert(error.response?.data?.message || "Failed to complete tasks. Please try again.");
    }
}

async function reverse() {
    try {
        const checkboxes = document.querySelectorAll(".listele input[type=checkbox]:checked");
        if (checkboxes.length === 0) {
            showAlert("Please select tasks to reverse");
            return;
        }

        for (const checkbox of checkboxes) {
            const taskText = checkbox.nextElementSibling.textContent;
            try {
                const response = await axios.post("http://localhost:3001/ReversetoTodo", { 
                    value: taskText 
                });
                
                if (response.data.success || response.data === "sucess") {
                    const taskElement = createTaskElement(taskText, false);
                    document.querySelector(".taskcreate").appendChild(taskElement);
                    checkbox.closest('.task-item').remove();
                }
            } catch (err) {
                console.error("Error reversing task:", taskText, err);
                showAlert(`Failed to reverse task: ${taskText}`);
            }
        }

        document.querySelector('.completesub').textContent = "COMPLETED";
        const actions = document.querySelector('.board-column:last-child .column-actions');
        if (actions) actions.style.display = 'none';
        updateTaskCount();
    } catch (error) {
        showAlert(error.response?.data?.message || "Failed to reverse tasks. Please try again.");
    }
}

async function deleteCompButton() {
    try {
        const checkboxes = document.querySelectorAll(".listele input[type=checkbox]:checked");
        if (checkboxes.length === 0) {
            showAlert("Please select completed tasks to delete");
            return;
        }

        for (const checkbox of checkboxes) {
            const taskText = checkbox.nextElementSibling.textContent;
            try {
                const response = await axios.post("http://localhost:3001/deleteCompleted", { 
                    value: taskText 
                });
                
                if (response.data.success || response.data === "success") {
                    checkbox.closest('.task-item').remove();
                }
            } catch (err) {
                console.error("Error deleting completed task:", taskText, err);
                showAlert(`Failed to delete completed task: ${taskText}`);
            }

        }

        document.querySelector('.completesub').textContent = "COMPLETED";
        const actions = document.querySelector('.board-column:last-child .column-actions');
        if (actions) actions.style.display = 'none';
        updateTaskCount();
    } catch (error) {
        showAlert(error.response?.data?.message || "Failed to delete completed tasks. Please try again.");
    }
}

async function deletetaskButton() {
    try {
        const checkboxes = document.querySelectorAll(".taskcreate input[type=checkbox]:checked");
        if (checkboxes.length === 0) {
            showAlert("Please select tasks to delete");
            return;
        }

        for (const checkbox of checkboxes) {
            const taskText = checkbox.nextElementSibling.textContent;
            try {
                const response = await axios.post("http://localhost:3001/deletetodo", { 
                    value: taskText 
                });
                
                if (response.data.success || response.data === "success") {
                    checkbox.closest('.task-item').remove();
                }
            } catch (err) {
                console.error("Error deleting task:", taskText, err);
                showAlert(`Failed to delete task: ${taskText}`);
            }
        }

        document.querySelector('.todosub').textContent = "TO DO";
        const actions = document.querySelector('.board-column:first-child .column-actions');
        if (actions) actions.style.display = 'none';
        updateTaskCount();
        
    } catch (error) {
        showAlert(error.response?.data?.message || "Failed to delete tasks. Please try again.");
    }
}

async function removeCookie() {
    try {
        const response = await axios.delete("/logout");
        if (response.status === 200) {
            window.location.href = '/auth';
        } else {
            throw new Error("Logout failed");
        }
    } catch (error) {
        showAlert(error.response?.data?.message || error.message || "Failed to log out. Please try again.");
    }
}

function updateTaskCount() {
    const todoCount = document.querySelectorAll(".taskcreate .task-item").length;
    const completedCount = document.querySelectorAll(".listele .task-item").length;
    
    document.querySelector('.todosub').textContent = todoCount === 0 ? "TO DO" : `TO DO (${todoCount})`;
    document.querySelector('.completesub').textContent = completedCount === 0 ? "COMPLETED" : `COMPLETED (${completedCount})`;
    
}

async function reload() {
    try {
        // Get the container elements
        const todoContainer = document.querySelector(".taskcreate");
        const completedContainer = document.querySelector(".listele");
        
        // Show loading states
        todoContainer.innerHTML = '<div class="empty-state">Loading tasks...</div>';
        completedContainer.innerHTML = '<div class="empty-state">Loading completed tasks...</div>';
        
        // Fetch tasks
        const response = await axios.get("http://localhost:3001/reload");
        const tasks = response.data.message || [];
        
        // Clear containers
        todoContainer.innerHTML = '';
        completedContainer.innerHTML = '';
        
        // Count tasks
        let todoCount = 0;
        let completedCount = 0;
        
        // Process tasks
        tasks.forEach(task => {
            const taskElement = createTaskElement(task.message, task.done === "1");
            if (task.done === "1") {
                completedContainer.appendChild(taskElement);
                completedCount++;
            } else {
                todoContainer.appendChild(taskElement);
                todoCount++;
            }
        });
        
        // Handle empty states after processing all tasks
        if (todoCount === 0) {
            todoContainer.innerHTML = '<div class="empty-state">No tasks yet. Add your first task above!</div>';
        }
        
        if (completedCount === 0) {
            completedContainer.innerHTML = '<div class="empty-state">Complete some tasks to see them here</div>';
        }
        
        // Update headers with counts
        const todoHeader = document.querySelector('.todosub');
        const completedHeader = document.querySelector('.completesub');
        
        todoHeader.textContent = todoCount === 0 ? "TO DO" : `TO DO (${todoCount})`;
        completedHeader.textContent = completedCount === 0 ? "COMPLETED" : `COMPLETED (${completedCount})`;
        
    } catch (error) {
        console.error("Error loading tasks:", error);
        showAlert(error.response?.data?.message || "Failed to load tasks. Please try again.");
        
        // Show error states
        document.querySelector(".taskcreate").innerHTML = '<div class="empty-state">Error loading tasks</div>';
        document.querySelector(".listele").innerHTML = '<div class="empty-state">Error loading tasks</div>';
    }
}





