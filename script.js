const courses = [
  {
    title: "Power Automate",
    type: "Office",
    start: "2026-06-22",
    end: "2026-06-22",
    duration: "1 nap",
    mode: "Nyílt képzés",
  },
  {
    title: "Üzemeltetési feladatok automatizálása PowerShellel",
    type: "IT",
    start: "2026-06-22",
    end: "2026-06-26",
    duration: "5 nap",
    mode: "Nyílt képzés",
  },
  {
    title: "Alap Excel VBA programozás tanfolyam",
    type: "Office",
    start: "2026-06-22",
    end: "2026-06-23",
    duration: "2 nap",
    mode: "Nyílt képzés",
  },
  {
    title: "PowerShell programozás-alap",
    type: "IT",
    start: "2026-06-29",
    end: "2026-07-03",
    duration: "5 nap",
    mode: "Nyílt képzés",
  },
  {
    title: "Office 365 üzemeltetőknek/adminisztrátoroknak",
    type: "IT",
    start: "2026-06-30",
    end: "2026-07-02",
    duration: "3 nap",
    mode: "Nyílt képzés",
  },
  {
    title: "ITIL 4 Foundation tanfolyam és vizsga csomag",
    type: "Vezetői",
    start: "2026-07-01",
    end: "2026-07-02",
    duration: "2 nap",
    mode: "Tanfolyam + vizsga",
  },
  {
    title: "ITIL 5 Foundation tanfolyam és vizsga csomag",
    type: "Vezetői",
    start: "2026-07-01",
    end: "2026-07-02",
    duration: "2 nap",
    mode: "Tanfolyam + vizsga",
  },
  {
    title: "Képzési iránytű HR kollégáknak és vezetőknek",
    type: "Soft skill",
    start: "2026-09-08",
    end: "2026-09-08",
    duration: "1 nap",
    mode: "Workshop",
  },
];

const state = {
  filter: "all",
  view: "calendar",
  selectedDate: null,
  activeMonth: "2026-06",
};

const monthNames = new Intl.DateTimeFormat("hu-HU", {
  month: "long",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("hu-HU", {
  month: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("hu-HU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const eventList = $("[data-event-list]");
const eventCount = $("[data-event-count]");
const nextCourse = $("[data-next-course]");
const calendarDays = $("[data-calendar-days]");
const monthTabs = $("[data-month-tabs]");
const calendarLayout = $(".calendar-layout");
const panelTitle = $("[data-panel-title]");
const clearDateButton = $("[data-clear-date]");
const menuToggle = $(".menu-toggle");
const navMenu = $(".nav-menu");

function toDate(value) {
  return new Date(`${value}T00:00:00`);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function classNameForType(type) {
  return type.replace(/\s+/g, "-");
}

function courseMatchesDate(course, isoDate) {
  const target = toDate(isoDate).getTime();
  return toDate(course.start).getTime() <= target && target <= toDate(course.end).getTime();
}

function filteredCourses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = courses
    .filter((course) => toDate(course.end).getTime() >= today.getTime())
    .sort((a, b) => toDate(a.start) - toDate(b.start));

  const base = upcoming.length ? upcoming : [...courses].sort((a, b) => toDate(a.start) - toDate(b.start));

  return base.filter((course) => {
    const filterMatch = state.filter === "all" || course.type === state.filter;
    const dateMatch = !state.selectedDate || courseMatchesDate(course, state.selectedDate);
    return filterMatch && dateMatch;
  });
}

function availableMonths() {
  return [...new Set(courses.map((course) => monthKey(toDate(course.start))))].sort();
}

function setNextCourse() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = courses
    .filter((course) => toDate(course.end).getTime() >= today.getTime())
    .sort((a, b) => toDate(a.start) - toDate(b.start))[0];

  if (next) {
    nextCourse.textContent = longDateFormatter.format(toDate(next.start));
  }
}

function courseDateLabel(course) {
  const start = toDate(course.start);
  const end = toDate(course.end);

  if (course.start === course.end) {
    return longDateFormatter.format(start);
  }

  return `${dayFormatter.format(start)} - ${dayFormatter.format(end)}`;
}

function renderEvents() {
  const visibleCourses = filteredCourses();
  eventCount.textContent = String(visibleCourses.length);

  if (state.selectedDate) {
    panelTitle.textContent = `${longDateFormatter.format(toDate(state.selectedDate))} képzései`;
    clearDateButton.hidden = false;
  } else {
    panelTitle.textContent = "Következő képzések";
    clearDateButton.hidden = true;
  }

  eventList.innerHTML = "";

  if (!visibleCourses.length) {
    eventList.innerHTML = `<p class="empty-state">Erre a szűrésre nincs megjeleníthető képzés.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  visibleCourses.forEach((course) => {
    const start = toDate(course.start);
    const article = document.createElement("article");
    article.className = "course-card";
    article.innerHTML = `
      <div class="course-date" aria-hidden="true">
        <strong>${String(start.getDate()).padStart(2, "0")}</strong>
        <span>${start.toLocaleDateString("hu-HU", { month: "short" })}</span>
      </div>
      <div>
        <h4>${course.title}</h4>
        <ul class="course-meta">
          <li>${courseDateLabel(course)}</li>
          <li>${course.duration}</li>
          <li class="course-type ${classNameForType(course.type)}">${course.type}</li>
          <li>${course.mode}</li>
        </ul>
      </div>
    `;
    fragment.append(article);
  });

  eventList.append(fragment);
}

function renderMonthTabs() {
  const fragment = document.createDocumentFragment();

  availableMonths().forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `month-button${state.activeMonth === key ? " active" : ""}`;
    button.dataset.month = key;
    button.textContent = monthNames.format(date);
    fragment.append(button);
  });

  monthTabs.innerHTML = "";
  monthTabs.append(fragment);
}

function eventsForDay(isoDate) {
  return courses.filter((course) => {
    const filterMatch = state.filter === "all" || course.type === state.filter;
    return filterMatch && courseMatchesDate(course, isoDate);
  });
}

function renderCalendar() {
  const [year, month] = state.activeMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  calendarDays.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1;
    const date = new Date(year, month - 1, dayNumber);
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= lastDay.getDate();
    const iso = toISODate(date);
    const dayEvents = isCurrentMonth ? eventsForDay(iso) : [];
    const cell = document.createElement(dayEvents.length ? "button" : "div");
    cell.className = [
      "day-cell",
      isCurrentMonth ? "" : "is-muted",
      dayEvents.length ? "has-events" : "",
      state.selectedDate === iso ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (dayEvents.length) {
      cell.type = "button";
      cell.dataset.date = iso;
      cell.setAttribute("aria-label", `${longDateFormatter.format(date)} - ${dayEvents.length} képzés`);
    }

    const eventPreview = dayEvents
      .slice(0, 2)
      .map((course) => `<span class="day-event ${classNameForType(course.type)}">${course.title}</span>`)
      .join("");

    const extraCount =
      dayEvents.length > 2 ? `<span class="day-event">+${dayEvents.length - 2} további</span>` : "";

    cell.innerHTML = `
      <span class="day-number">${isCurrentMonth ? date.getDate() : ""}</span>
      <span class="day-events">${eventPreview}${extraCount}</span>
    `;
    fragment.append(cell);
  }

  calendarDays.append(fragment);
}

function render() {
  renderMonthTabs();
  renderCalendar();
  renderEvents();
  calendarLayout.dataset.viewMode = state.view;
}

function setActiveButton(buttons, activeValue, dataKey) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[dataKey] === activeValue);
  });
}

$$(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    state.selectedDate = null;
    setActiveButton($$(".filter-button"), state.filter, "filter");
    render();
  });
});

$$(".view-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    setActiveButton($$(".view-button"), state.view, "view");
    render();
  });
});

monthTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-month]");
  if (!button) {
    return;
  }

  state.activeMonth = button.dataset.month;
  state.selectedDate = null;
  render();
});

calendarDays.addEventListener("click", (event) => {
  const day = event.target.closest("[data-date]");
  if (!day) {
    return;
  }

  state.selectedDate = day.dataset.date;
  render();
});

clearDateButton.addEventListener("click", () => {
  state.selectedDate = null;
  render();
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navMenu.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navMenu.addEventListener("click", (event) => {
  if (!event.target.closest("a")) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
});

setNextCourse();
render();
