const CALENDAR_MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
const CALENDAR_WEEKDAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const CALENDAR_STATUS_CLASS = { available: 'calendar-free', busy: 'calendar-busy' };
const CALENDAR_STATUS_LABEL = { available: 'libre', busy: 'ocupado' };

// "2026-10-02" parsed with new Date() is UTC, which shifts the day in negative
// offsets. Split it by hand so the day is always the local one.
function calendarParseDate(iso_date) {
  const [y, m, d] = iso_date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// 0 = Monday, 6 = Sunday
function calendarWeekday(date) {
  return (date.getDay() + 6) % 7;
}

function calendarDaysApart(from, to) {
  return Math.round((to - from) / 86400000);
}

class Calendar {
  constructor(root, calendar_slug) {
    this.root = root;
    this.slug = calendar_slug;
    this.error = root.querySelector('.calendar-error');
    this.empty = root.querySelector('.calendar-empty');
    this.view = root.querySelector('.calendar-view');
    this.months_el = root.querySelector('.calendar-months');
    this.prev_btn = root.querySelector('.calendar-arrow-prev');
    this.next_btn = root.querySelector('.calendar-arrow-next');
    this.months = [];
    this.start = 0;
    this.touch_x = null;
  }

  async load() {
    let response;
    try {
      response = await api_calendar_get(this.slug);
    } catch (errors) {
      return;
    }
    try {
      const availability = (response.data || {}).availability || [];
      this.months = this.groupByMonth(availability);
      if (!this.months.length) {
        return;
      }
      if (!availability.some((day) => day.status === 'available')) {
        this.error.hidden = true;
        this.empty.hidden = false;
        return;
      }
      this.start = this.openingIndex();
      this.bind();
      this.render();
      this.error.hidden = true;
      this.view.hidden = false;
    } catch (errors) {
      console.error(errors);
    }
  }

  groupByMonth(availability) {
    const months = [];
    let current = null;
    availability.forEach((entry) => {
      if (typeof entry.date !== 'string') {
        return;
      }
      const key = entry.date.slice(0, 7);
      if (!current || current.key !== key) {
        const date = calendarParseDate(entry.date);
        current = { key: key, year: date.getFullYear(), month: date.getMonth(), days: [] };
        months.push(current);
      }
      current.days.push({
        date: calendarParseDate(entry.date),
        // Anything outside the three known values is treated as not bookable.
        status: CALENDAR_STATUS_CLASS[entry.status] ? entry.status : 'no'
      });
    });
    return months;
  }

  // Opens on the current month when it falls inside the window, on the first
  // month when the window is still ahead, on the last one when it is past.
  openingIndex() {
    const today = new Date();
    const key = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const index = this.months.findIndex((month) => month.key === key);
    if (index >= 0) {
      return this.clamp(index);
    }
    return key < this.months[0].key ? 0 : this.clamp(this.months.length - 1);
  }

  visibleCount() {
    return window.matchMedia('(min-width: 768px)').matches ? 3 : 1;
  }

  clamp(index) {
    const max = Math.max(0, this.months.length - this.visibleCount());
    return Math.min(Math.max(index, 0), max);
  }

  bind() {
    this.prev_btn.addEventListener('click', () => this.move(-1));
    this.next_btn.addEventListener('click', () => this.move(1));
    window.addEventListener('resize', () => {
      this.start = this.clamp(this.start);
      this.render();
    });
    this.months_el.addEventListener('touchstart', (e) => {
      this.touch_x = e.changedTouches[0].clientX;
    }, { passive: true });
    this.months_el.addEventListener('touchend', (e) => {
      if (this.touch_x === null) {
        return;
      }
      const delta = e.changedTouches[0].clientX - this.touch_x;
      this.touch_x = null;
      if (Math.abs(delta) > 40) {
        this.move(delta < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  move(step) {
    const next = this.clamp(this.start + step);
    if (next === this.start) {
      return;
    }
    this.start = next;
    this.render();
  }

  render() {
    const visible = this.visibleCount();
    this.months_el.replaceChildren();
    this.months.slice(this.start, this.start + visible).forEach((month) => {
      this.months_el.appendChild(this.renderMonth(month));
    });
    this.prev_btn.disabled = this.start === 0;
    this.next_btn.disabled = this.start >= this.months.length - visible;
  }

  renderMonth(month) {
    const el = document.createElement('div');
    el.className = 'calendar-month';

    const name = document.createElement('h3');
    name.className = 'calendar-month-name';
    name.textContent = CALENDAR_MONTH_NAMES[month.month] + ' ' + month.year;
    el.appendChild(name);

    const weekdays = document.createElement('div');
    weekdays.className = 'calendar-weekdays';
    weekdays.setAttribute('aria-hidden', 'true');
    CALENDAR_WEEKDAY_NAMES.forEach((day) => {
      const cell = document.createElement('div');
      cell.textContent = day;
      weekdays.appendChild(cell);
    });
    el.appendChild(weekdays);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    this.fillGrid(grid, month);
    el.appendChild(grid);

    return el;
  }

  fillGrid(grid, month) {
    const first = calendarWeekday(month.days[0].date);
    for (let i = 0; i < first; i++) {
      grid.appendChild(document.createElement('div'));
    }

    this.buildRuns(month.days).forEach((run) => {
      grid.appendChild(run.status === 'no' ? this.renderOffDay(run) : this.renderRun(run));
    });

    const last = calendarWeekday(month.days[month.days.length - 1].date);
    for (let i = last + 1; i < 7; i++) {
      grid.appendChild(document.createElement('div'));
    }
  }

  // Contiguous days with the same status become one pill. A pill is also cut at
  // the end of a week and at the end of a month, because the grid wraps there.
  buildRuns(days) {
    const runs = [];
    let current = null;
    days.forEach((day) => {
      const contiguous = current
        && current.status === day.status
        && day.status !== 'no'
        && calendarWeekday(day.date) !== 0
        && calendarDaysApart(current.days[current.days.length - 1].date, day.date) === 1;
      if (contiguous) {
        current.days.push(day);
        return;
      }
      current = { status: day.status, days: [day] };
      runs.push(current);
    });
    return runs;
  }

  renderOffDay(run) {
    const el = document.createElement('div');
    el.className = 'calendar-day';
    el.textContent = run.days[0].date.getDate();
    return el;
  }

  renderRun(run) {
    const el = document.createElement('div');
    el.className = 'calendar-run ' + CALENDAR_STATUS_CLASS[run.status];
    el.style.gridColumn = 'span ' + run.days.length;
    el.setAttribute('aria-label', this.runLabel(run));
    run.days.forEach((day) => {
      const cell = document.createElement('div');
      cell.className = 'calendar-run-day';
      cell.textContent = day.date.getDate();
      el.appendChild(cell);
    });
    return el;
  }

  runLabel(run) {
    const first = run.days[0].date;
    const last = run.days[run.days.length - 1].date;
    const state = CALENDAR_STATUS_LABEL[run.status];
    const month = CALENDAR_MONTH_NAMES[last.getMonth()];
    if (run.days.length === 1) {
      return first.getDate() + ' de ' + month + ' de ' + last.getFullYear() + ', ' + state;
    }
    return 'Del ' + first.getDate() + ' al ' + last.getDate() + ' de ' + month
      + ' de ' + last.getFullYear() + ', ' + state;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.calendar[data-calendar-slug]').forEach((root) => {
    new Calendar(root, root.dataset.calendarSlug).load();
  });
});
