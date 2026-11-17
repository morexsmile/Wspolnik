
/* =========================================
   WSPÓLNIK — MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ===================================== */

    const sidebar = document.getElementById("sidebar");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const sidebarClose = document.getElementById("sidebarClose");

    const newTaskButton = document.getElementById("newTaskButton");
    const inviteMemberButton = document.getElementById("inviteMemberButton");

    const searchInput = document.querySelector(".search-box input");

    const tasksTable = document.querySelector(".tasks-table tbody");
    const projectsList = document.querySelector(".projects-list");
    const teamSection = document.querySelector(".team-section");

    if (!sidebar || !tasksTable) return;


    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);

    function openSidebar() {
        sidebar.classList.add("active");
        overlay.classList.add("active");
        document.body.classList.add("menu-open");
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("menu-open");
    }

    mobileMenuButton?.addEventListener("click", openSidebar);
    sidebarClose?.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            closeSidebar();
        }
    });


    /* =====================================
       NAVIGATION
    ===================================== */

    const navigationLinks = document.querySelectorAll(
        ".sidebar-navigation .nav-link"
    );

    navigationLinks.forEach(link => {

        link.addEventListener("click", () => {

            navigationLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            closeSidebar();
        });

    });


    /* =====================================
       DIALOG SYSTEM
    ===================================== */

    function createDialog(title, content) {

        const existingDialog = document.querySelector(".app-dialog");

        existingDialog?.remove();

        const dialog = document.createElement("dialog");

        dialog.className = "app-dialog";

        dialog.innerHTML = `
            <div class="dialog-content">

                <div class="dialog-header">
                    <h2>${title}</h2>

                    <button
                        type="button"
                        class="dialog-close"
                        aria-label="Zamknij"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                ${content}

            </div>
        `;

        document.body.appendChild(dialog);

        const closeButton = dialog.querySelector(".dialog-close");

        closeButton.addEventListener("click", () => {
            dialog.close();
            dialog.remove();
        });

        dialog.addEventListener("click", event => {
            if (event.target === dialog) {
                dialog.close();
                dialog.remove();
            }
        });

        dialog.addEventListener("close", () => {
            dialog.remove();
        });

        dialog.showModal();

        return dialog;
    }


    /* =====================================
       TASK COUNTERS
    ===================================== */

    function updateTaskCounters() {

        const rows = [...tasksTable.querySelectorAll("tr")];

        const totalTasks = rows.length;

        const completedTasks = rows.filter(row =>
            row.dataset.completed === "true"
        ).length;

        const allTasksCard = document.querySelectorAll(".stat-card")[0];
        const completedCard = document.querySelectorAll(".stat-card")[2];

        if (allTasksCard) {
            allTasksCard.querySelector(".stat-value").textContent = totalTasks;
        }

        if (completedCard) {
            completedCard.querySelector(".stat-value").textContent = completedTasks;
        }

    }


    /* =====================================
       TASK CHECKBOXES
    ===================================== */

    function setupTaskCheckbox(checkbox) {

        const row = checkbox.closest("tr");

        if (!row) return;

        const taskName = row.querySelector(".task-name strong");
        const status = row.querySelector(".task-status");

        const isCompleted = row.dataset.completed === "true";

        checkbox.setAttribute("role", "checkbox");
        checkbox.setAttribute("tabindex", "0");
        checkbox.setAttribute("aria-checked", String(isCompleted));

        function toggleTask() {

            const completed = row.dataset.completed !== "true";

            row.dataset.completed = String(completed);

            checkbox.setAttribute("aria-checked", String(completed));

            checkbox.classList.toggle("checked", completed);

            if (taskName) {
                taskName.classList.toggle("task-completed", completed);
            }

            if (status) {
                status.textContent = completed
                    ? "Ukończone"
                    : "Do zrobienia";

                status.classList.toggle("status-completed", completed);
                status.classList.toggle("status-todo", !completed);
                status.classList.remove("status-progress");
            }

            updateTaskCounters();
        }

        checkbox.addEventListener("click", toggleTask);

        checkbox.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleTask();
            }
        });

    }


    document.querySelectorAll(".task-checkbox").forEach(checkbox => {

        const row = checkbox.closest("tr");

        if (row) {
            row.dataset.completed =
                row.querySelector(".task-status")?.textContent.trim() === "Ukończone"
                    ? "true"
                    : "false";
        }

        setupTaskCheckbox(checkbox);

    });

    updateTaskCounters();


    /* =====================================
       ADD NEW TASK
    ===================================== */

    newTaskButton?.addEventListener("click", () => {

        const dialog = createDialog(
            "Dodaj nowe zadanie",
            `
                <form id="newTaskForm" class="dialog-form">

                    <div class="form-group">
                        <label for="taskTitle">Nazwa zadania</label>

                        <input
                            type="text"
                            id="taskTitle"
                            name="taskTitle"
                            placeholder="Np. Przygotować prezentację"
                            required
                            maxlength="100"
                        >
                    </div>

                    <div class="form-group">
                        <label for="taskProject">Projekt</label>

                        <select id="taskProject" name="taskProject">
                            <option>Redesign strony</option>
                            <option>Aplikacja mobilna</option>
                            <option>Marketing</option>
                        </select>
                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label for="taskPriority">Priorytet</label>

                            <select id="taskPriority" name="taskPriority">
                                <option value="low">Niski</option>
                                <option value="medium" selected>Średni</option>
                                <option value="high">Wysoki</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="taskDate">Termin</label>

                            <input
                                type="date"
                                id="taskDate"
                                name="taskDate"
                            >
                        </div>

                    </div>

                    <div class="dialog-actions">
                        <button type="button" class="btn btn-secondary cancel-dialog">
                            Anuluj
                        </button>

                        <button type="submit" class="btn btn-primary">
                            <i class="fa-solid fa-plus"></i>
                            Dodaj zadanie
                        </button>
                    </div>

                </form>
            `
        );

        const form = dialog.querySelector("#newTaskForm");

        dialog.querySelector(".cancel-dialog").addEventListener("click", () => {
            dialog.close();
            dialog.remove();
        });

        form.addEventListener("submit", event => {

            event.preventDefault();

            const formData = new FormData(form);

            const title = formData.get("taskTitle").trim();
            const project = formData.get("taskProject");
            const priority = formData.get("taskPriority");
            const date = formData.get("taskDate");

            if (!title) return;

            const priorityLabels = {
                high: "Wysoki",
                medium: "Średni",
                low: "Niski"
            };

            const priorityClasses = {
                high: "priority-high",
                medium: "priority-medium",
                low: "priority-low"
            };

            const row = document.createElement("tr");

            row.dataset.completed = "false";

            const taskCell = document.createElement("td");
            const taskName = document.createElement("div");
            taskName.className = "task-name";

            const checkbox = document.createElement("span");
            checkbox.className = "task-checkbox";

            const taskTitle = document.createElement("strong");
            taskTitle.textContent = title;

            taskName.append(checkbox, taskTitle);
            taskCell.appendChild(taskName);

            const projectCell = document.createElement("td");
            projectCell.textContent = project;

            const priorityCell = document.createElement("td");
            const priorityBadge = document.createElement("span");

            priorityBadge.className = `priority ${priorityClasses[priority]}`;
            priorityBadge.textContent = priorityLabels[priority];

            priorityCell.appendChild(priorityBadge);

            const dateCell = document.createElement("td");

            if (date) {
                const selectedDate = new Date(`${date}T12:00:00`);

                dateCell.textContent = selectedDate.toLocaleDateString(
                    "pl-PL",
                    {
                        day: "numeric",
                        month: "short"
                    }
                );
            } else {
                dateCell.textContent = "—";
            }

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.className = "task-status status-todo";
            statusBadge.textContent = "Do zrobienia";

            statusCell.appendChild(statusBadge);

            row.append(
                taskCell,
                projectCell,
                priorityCell,
                dateCell,
                statusCell
            );

            tasksTable.prepend(row);

            setupTaskCheckbox(checkbox);
            updateTaskCounters();

            dialog.close();
            dialog.remove();

        });

        dialog.querySelector("#taskTitle").focus();

    });


    /* =====================================
       SEARCH TASKS AND PROJECTS
    ===================================== */

    searchInput?.addEventListener("input", () => {

        const query = searchInput.value
            .trim()
            .toLocaleLowerCase("pl");

        const taskRows = tasksTable.querySelectorAll("tr");

        taskRows.forEach(row => {

            const text = row.textContent.toLocaleLowerCase("pl");

            row.style.display = text.includes(query) ? "" : "none";

        });

        projectsList?.querySelectorAll(".project-item").forEach(project => {

            const text = project.textContent.toLocaleLowerCase("pl");

            project.style.display = text.includes(query) ? "" : "none";

        });

    });


    /* =====================================
       INVITE TEAM MEMBER
    ===================================== */

    inviteMemberButton?.addEventListener("click", () => {

        const dialog = createDialog(
            "Zaproś osobę do zespołu",
            `
                <form id="inviteForm" class="dialog-form">

                    <p class="dialog-description">
                        Dodaj nową osobę do przestrzeni roboczej
                        Studio Kreatywne.
                    </p>

                    <div class="form-group">
                        <label for="memberName">Imię i nazwisko</label>

                        <input
                            type="text"
                            id="memberName"
                            name="memberName"
                            placeholder="Np. Jan Kowalski"
                            required
                            maxlength="80"
                        >
                    </div>

                    <div class="form-group">
                        <label for="memberEmail">Adres e-mail</label>

                        <input
                            type="email"
                            id="memberEmail"
                            name="memberEmail"
                            placeholder="jan@example.com"
                            required
                        >
                    </div>

                    <div class="dialog-actions">

                        <button type="button" class="btn btn-secondary cancel-dialog">
                            Anuluj
                        </button>

                        <button type="submit" class="btn btn-primary">
                            <i class="fa-solid fa-user-plus"></i>
                            Dodaj osobę
                        </button>

                    </div>

                </form>
            `
        );

        const form = dialog.querySelector("#inviteForm");

        dialog.querySelector(".cancel-dialog").addEventListener("click", () => {
            dialog.close();
            dialog.remove();
        });

        form.addEventListener("submit", event => {

            event.preventDefault();

            const formData = new FormData(form);

            const name = formData.get("memberName").trim();
            const email = formData.get("memberEmail").trim();

            if (!name || !email) return;

            const initials = name
                .split(/\s+/)
                .map(part => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

            const member = document.createElement("div");
            member.className = "team-member";

            const avatar = document.createElement("div");
            avatar.className = "avatar avatar-six";
            avatar.textContent = initials;

            const info = document.createElement("div");
            info.className = "member-info";

            const memberName = document.createElement("strong");
            memberName.textContent = name;

            const memberEmail = document.createElement("span");
            memberEmail.textContent = email;

            const indicator = document.createElement("span");
            indicator.className = "member-offline";

            info.append(memberName, memberEmail);
            member.append(avatar, info, indicator);

            teamSection?.querySelector(".team-link")?.before(member);

            dialog.close();
            dialog.remove();

        });

        dialog.querySelector("#memberName").focus();

    });


    /* =====================================
       KEYBOARD SHORTCUT — SEARCH
    ===================================== */

    document.addEventListener("keydown", event => {

        const isMac = navigator.platform.toUpperCase().includes("MAC");
        const modifier = isMac ? event.metaKey : event.ctrlKey;

        if (modifier && event.key.toLowerCase() === "k") {

            event.preventDefault();
            searchInput?.focus();

        }

        if (event.key === "Escape") {
            closeSidebar();
        }

    });


    /* =====================================
       INITIALIZATION
    ===================================== */

    console.log("Wspólnik — aplikacja została uruchomiona.");

});
