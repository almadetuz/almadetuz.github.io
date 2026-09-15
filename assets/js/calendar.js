const CALENDAR_MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
const CALENDAR_WEEKDAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const CALENDAR_STATUS_CLASS = { available: 'calendar-free', busy: 'calendar-busy' };
const CALENDAR_STATUS_LABEL = { available: 'libre', busy: 'ocupado' };
// Six weeks of seven days: the most any month can need, and a fixed height.
const CALENDAR_GRID_CELLS = 42;

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

// The months are a strip of cards like the songs and the testimonials, so the
// carousel itself is CardCarousel: three months on screen on desktop, one on
// mobile, and every step moves one month. Unlike those two the strip does not
// loop -- the tour has a first and a last month -- so it runs with wrap off and
// the arrows go dead at both ends.
class Calendar {
  constructor(root, calendar_slug) {
    this.root = root;
    this.slug = calendar_slug;
    this.error = root.querySelector('.calendar-error');
    this.empty = root.querySelector('.calendar-empty');
    this.view = root.querySelector('.calendar-view');
    this.inner = root.querySelector('.carousel-inner');
    this.months = [];
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
      this.renderMonths();
      this.error.hidden = true;
      // Before the carousel starts: with the view hidden the months have no
      // width and the strip cannot be positioned.
      this.view.hidden = false;
      const carousel = new CardCarousel(this.root, {
        list: '.calendar-months',
        card: '.calendar-month',
        single_class: 'calendar-single',
        label: '.calendar-month-name',
        interval: false,
        wrap: false
      });
      carousel.index = this.openingIndex();
      carousel.start();
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
  // CardCarousel is the one that clamps it to the last full window.
  openingIndex() {
    const today = new Date();
    const key = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const index = this.months.findIndex((month) => month.key === key);
    if (index >= 0) {
      return index;
    }
    return key < this.months[0].key ? 0 : this.months.length - 1;
  }

  // Every month in one flat strip; the windowing is CardCarousel's job.
  renderMonths() {
    const months = document.createElement('div');
    months.className = 'calendar-months';
    this.months.forEach((month) => months.appendChild(this.renderMonth(month)));
    this.inner.replaceChildren(months);
  }

  renderMonth(month) {
    const el = document.createElement('div');
    el.className = 'calendar-month';
    // Viewed months are tracked by key (2026-10). CardCarousel observes them
    // when it builds the strip.
    el.dataset.engageType = 'calendar';
    el.dataset.engageName = month.key;

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

    // Pad to a full six-week grid. A month needs four, five or six rows
    // depending on where it starts, and without this the block changes height
    // from slide to slide and shoves the text underneath around.
    const used = first + month.days.length;
    for (let i = used; i < CALENDAR_GRID_CELLS; i++) {
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
