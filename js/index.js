
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
       DATA STORE
    ===================================== */

    const store = window.WspolnikStore;

    if (!store) {
        console.error("Wspólnik Store nie został uruchomiony.");
        return;
    }


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
       NAVIGATION — SINGLE PAGE VIEWS
    ===================================== */

    const dashboardContent = document.querySelector(".dashboard-content");
    const topbar = document.querySelector(".topbar");
    const breadcrumbTitle = document.querySelector(".breadcrumb strong");

    const calendarSection = document.querySelector(".calendar-section");

    const pageView = document.createElement("div");
    pageView.className = "dashboard-content";
    pageView.id = "appPageView";
    pageView.style.display = "none";

    if (topbar) {
        topbar.insertAdjacentElement("afterend", pageView);
    }

    const pageTitles = {
        dashboard: "Przegląd",
        projects: "Projekty",
        "all-projects": "Wszystkie projekty",
        tasks: "Moje zadania",
        "all-tasks": "Wszystkie zadania",
        calendar: "Kalendarz",
        "full-calendar": "Kalendarz",
        team: "Zespół",
        "all-team": "Cały zespół",
        messages: "Wiadomości",
        files: "Pliki",
        settings: "Ustawienia",
        upgrade: "Rozwijaj swój zespół"
    };

    function createPageHeading(title, description) {
        const heading = document.createElement("section");
        heading.className = "welcome-section";

        heading.innerHTML = `
            <div>
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
        `;

        return heading;
    }

    function showPage(page) {
        if (!pageTitles[page]) return;

        if (page === "dashboard") {
            pageView.style.display = "none";
            dashboardContent.style.display = "";

            if (breadcrumbTitle) {
                breadcrumbTitle.textContent = "Przegląd";
            }

        } else {
            dashboardContent.style.display = "none";
            pageView.style.display = "";

            pageView.replaceChildren();

            const titles = {
                projects: [
                    "Projekty",
                    "Zarządzaj projektami swojego zespołu."
                ],
                "all-projects": [
                    "Wszystkie projekty",
                    "Przeglądaj i zarządzaj wszystkimi projektami."
                ],
                tasks: [
                    "Moje zadania",
                    "Zadania przypisane do Ciebie."
                ],
                "all-tasks": [
                    "Wszystkie zadania",
                    "Zarządzaj zadaniami całego zespołu."
                ],
                calendar: [
                    "Kalendarz",
                    "Sprawdź nadchodzące terminy."
                ],
                "full-calendar": [
                    "Kalendarz",
                    "Sprawdź nadchodzące terminy."
                ],
                team: [
                    "Zespół",
                    "Poznaj członków swojej przestrzeni roboczej."
                ],
                "all-team": [
                    "Cały zespół",
                    "Zarządzaj członkami zespołu."
                ],
                messages: [
                    "Wiadomości",
                    "Komunikacja w Twoim zespole."
                ],
                files: [
                    "Pliki",
                    "Dokumenty i materiały projektowe."
                ],
                settings: [
                    "Ustawienia",
                    "Zarządzaj przestrzenią roboczą."
                ],
                upgrade: [
                    "Rozwijaj swój zespół",
                    "Poznaj możliwości Wspólnika."
                ]
            };

            const [title, description] = titles[page];

            pageView.appendChild(
                createPageHeading(title, description)
            );

            const sourceSections = {
                projects: projectsList?.closest(".projects-section"),
                "all-projects": projectsList?.closest(".projects-section"),
                tasks: tasksTable?.closest(".tasks-section"),
                "all-tasks": tasksTable?.closest(".tasks-section"),
                calendar: calendarSection,
                "full-calendar": calendarSection,
                team: teamSection
            };

            const source = sourceSections[page];

            if (source) {
                const clone = source.cloneNode(true);

                clone.removeAttribute("id");

                clone.querySelectorAll("[id]").forEach(element => {
                    element.removeAttribute("id");
                });

                pageView.appendChild(clone);

                clone.querySelectorAll(".task-checkbox").forEach(checkbox => {
                    setupTaskCheckbox(checkbox);
                });

            } else {
                const message = document.createElement("section");
                message.className = "content-card";

                message.innerHTML = `
                    <h2>${title}</h2>
                    <p>Ta sekcja zostanie rozbudowana w kolejnym etapie.</p>
                `;

                pageView.appendChild(message);
            }

            if (breadcrumbTitle) {
                breadcrumbTitle.textContent = title;
            }
        }

        document.querySelectorAll(".sidebar .nav-link").forEach(link => {
            link.classList.remove("active");

            const target = link.getAttribute("href")?.replace("#", "");

            const activePages = {
                projects: ["projects", "all-projects"],
                tasks: ["tasks", "all-tasks"],
                calendar: ["calendar", "full-calendar"],
                team: ["team", "all-team"]
            };

            if (
                target === page ||
                activePages[target]?.includes(page)
            ) {
                link.classList.add("active");
            }

            if (page === "dashboard" && target === "dashboard") {
                link.classList.add("active");
            }
        });

        closeSidebar();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    const availablePages = Object.keys(pageTitles);

    document.addEventListener("click", event => {
        const link = event.target.closest('a[href^="#"]');

        if (!link) return;

        const page = link.getAttribute("href").slice(1);

        if (!availablePages.includes(page)) return;

        event.preventDefault();

        showPage(page);
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
        const tasks = store.getState().tasks;

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(task =>
            task.completed || task.status === "Ukończone"
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

            taskName?.classList.toggle("task-completed", completed);

            if (status) {
                status.textContent = completed
                    ? "Ukończone"
                    : "Do zrobienia";

                status.classList.toggle("status-completed", completed);
                status.classList.toggle("status-todo", !completed);
                status.classList.remove("status-progress");
            }

            if (row.dataset.taskId) {
                store.updateTask(row.dataset.taskId, {
                    completed
                });
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


    /* =====================================
       CREATE TASK ROW
    ===================================== */

    function createTaskRow(task) {
        const row = document.createElement("tr");

        const completed =
            task.completed || task.status === "Ukończone";

        row.dataset.taskId = task.id;
        row.dataset.completed = String(completed);

        // Nazwa zadania

        const taskCell = document.createElement("td");

        const taskName = document.createElement("div");
        taskName.className = "task-name";

        const checkbox = document.createElement("span");

        checkbox.className = `task-checkbox${completed ? " checked" : ""}`;

        const taskTitle = document.createElement("strong");
        taskTitle.textContent = task.title;

        taskTitle.classList.toggle("task-completed", completed);

        taskName.append(checkbox, taskTitle);
        taskCell.appendChild(taskName);

        // Projekt

        const projectCell = document.createElement("td");
        projectCell.textContent = task.project || "—";

        // Priorytet

        const priorityCell = document.createElement("td");

        const priorityBadge = document.createElement("span");

        const priorityMap = {
            "Wysoki": "priority-high",
            "Średni": "priority-medium",
            "Niski": "priority-low",
            "high": "priority-high",
            "medium": "priority-medium",
            "low": "priority-low"
        };

        priorityBadge.className =
            `priority ${priorityMap[task.priority] || "priority-medium"}`;

        priorityBadge.textContent = task.priority || "Średni";

        priorityCell.appendChild(priorityBadge);

        // Termin

        const dateCell = document.createElement("td");

        if (task.date) {
            const parsedDate = new Date(`${task.date}T12:00:00`);

            dateCell.textContent = !isNaN(parsedDate.getTime())
                ? parsedDate.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short"
                })
                : task.date;

        } else {
            dateCell.textContent = "—";
        }

        // Status

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className =
            `task-status ${completed ? "status-completed" : "status-todo"}`;

        statusBadge.textContent = completed
            ? "Ukończone"
            : "Do zrobienia";

        statusCell.appendChild(statusBadge);

        row.append(
            taskCell,
            projectCell,
            priorityCell,
            dateCell,
            statusCell
        );

        setupTaskCheckbox(checkbox);

        return row;
    }


    /* =====================================
       RENDER TASKS FROM STORE
    ===================================== */

    function renderTasks() {
        const tasks = store.getState().tasks;

        tasksTable.replaceChildren(
            ...tasks.map(task => createTaskRow(task))
        );

        updateTaskCounters();
    }

    renderTasks();


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

                        <button
                            type="button"
                            class="btn btn-secondary cancel-dialog"
                        >
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

            // Zapis nowego zadania w Store

            const savedTask = store.addTask({
                title,
                project,
                priority: priorityLabels[priority],
                date
            });

            // Wyświetlenie zadania

            tasksTable.prepend(
                createTaskRow(savedTask)
            );

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

                        <button
                            type="button"
                            class="btn btn-secondary cancel-dialog"
                        >
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
