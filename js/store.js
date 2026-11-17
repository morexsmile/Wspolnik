
/* =========================================
   WSPÓLNIK — DATA STORE
   Wspólne dane i zapis w localStorage
========================================= */

(() => {
    "use strict";

    const STORAGE_KEY = "wspolnik_app_data_v1";

    let state = {
        projects: [],
        tasks: [],
        members: []
    };

    const listeners = [];

    function createId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            listeners.forEach(listener => listener(getState()));
        } catch (error) {
            console.error("Nie udało się zapisać danych Wspólnika:", error);
        }
    }

    function getState() {
        return JSON.parse(JSON.stringify(state));
    }

    function readInitialData() {
        const projects = [
            ...document.querySelectorAll(".projects-list .project-item")
        ].map(item => ({
            id: createId("project"),
            name: item.querySelector(".project-details h3")?.textContent.trim() || "Nowy projekt",
            description: item.querySelector(".project-details > span")?.textContent.trim() || "",
            progress: Number(
                item.querySelector(".progress-fill")?.style.width.replace("%", "")
            ) || 0,
            status: item.querySelector(".status-badge")?.textContent.trim() || "W trakcie"
        }));

        const tasks = [
            ...document.querySelectorAll(".tasks-table tbody tr")
        ].map(row => {
            const cells = row.querySelectorAll("td");

            return {
                id: createId("task"),
                title: cells[0]?.querySelector(".task-name strong")?.textContent.trim() || "",
                project: cells[1]?.textContent.trim() || "",
                priority: cells[2]?.textContent.trim() || "Średni",
                date: cells[3]?.textContent.trim() || "",
                status: cells[4]?.textContent.trim() || "Do zrobienia",
                completed: cells[4]?.textContent.trim() === "Ukończone"
            };
        });

        const members = [
            ...document.querySelectorAll(".team-section .team-member")
        ].map(item => ({
            id: createId("member"),
            name: item.querySelector(".member-info strong")?.textContent.trim() || "",
            email: item.querySelector(".member-info span")?.textContent.trim() || "",
            status: item.querySelector(".member-online") ? "online" : "offline"
        }));

        return { projects, tasks, members };
    }

    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);

                if (
                    Array.isArray(parsed.projects) &&
                    Array.isArray(parsed.tasks) &&
                    Array.isArray(parsed.members)
                ) {
                    state = parsed;
                    return;
                }
            }
        } catch (error) {
            console.warn("Nie udało się odczytać zapisanych danych. Przywracam dane początkowe.", error);
        }

        state = readInitialData();
        save();
    }

    function addTask(task) {
        const newTask = {
            id: createId("task"),
            title: task.title,
            project: task.project || "",
            priority: task.priority || "Średni",
            date: task.date || "",
            status: "Do zrobienia",
            completed: false
        };

        state.tasks.unshift(newTask);
        save();

        return { ...newTask };
    }

    function updateTask(id, changes) {
        const task = state.tasks.find(item => item.id === id);
        if (!task) return null;

        Object.assign(task, changes);

        if (typeof changes.completed === "boolean") {
            task.status = changes.completed ? "Ukończone" : "Do zrobienia";
        }

        save();
        return { ...task };
    }

    function removeTask(id) {
        state.tasks = state.tasks.filter(task => task.id !== id);
        save();
    }

    function addProject(project) {
        const newProject = {
            id: createId("project"),
            name: project.name,
            description: project.description || "",
            progress: Number(project.progress) || 0,
            status: project.status || "W trakcie"
        };

        state.projects.push(newProject);
        save();

        return { ...newProject };
    }

    function updateProject(id, changes) {
        const project = state.projects.find(item => item.id === id);
        if (!project) return null;

        Object.assign(project, changes);
        save();

        return { ...project };
    }

    function addMember(member) {
        const newMember = {
            id: createId("member"),
            name: member.name,
            email: member.email,
            status: "offline"
        };

        state.members.push(newMember);
        save();

        return { ...newMember };
    }

    function subscribe(callback) {
        if (typeof callback !== "function") return;

        listeners.push(callback);

        return () => {
            const index = listeners.indexOf(callback);
            if (index !== -1) listeners.splice(index, 1);
        };
    }

    document.addEventListener("DOMContentLoaded", () => {
        load();

        window.WspolnikStore = {
            getState,
            subscribe,
            addTask,
            updateTask,
            removeTask,
            addProject,
            updateProject,
            addMember
        };

        console.log("Wspólnik — wspólny magazyn danych został uruchomiony.");
    });
})();
