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

class Calendar {
  constructor(root, calendar_slug) {
    this.root = root;
    this.slug = calendar_slug;
    this.error = root.querySelector('.calendar-error');
    this.empty = root.querySelector('.calendar-empty');
    this.view = root.querySelector('.calendar-view');
    this.carousel_el = root.querySelector('.carousel');
    this.inner = root.querySelector('.carousel-inner');
    this.indicators = root.querySelector('.carousel-indicators');
    this.prev_btn = root.querySelector('.carousel-control-prev');
    this.next_btn = root.querySelector('.carousel-control-next');
    this.desktop = window.matchMedia('(min-width: 768px)');
    this.months = [];
    this.slides = [];
    this.carousel = null;
    // Index into this.months of the first month on screen. Survives a rebuild,
    // which is what keeps the reader on the same month when the layout flips
    // between one and three months per slide.
    this.first_month = 0;
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
      this.first_month = this.openingIndex();
      this.bind();
      this.build();
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
    return this.desktop.matches ? 3 : 1;
  }

  clamp(index) {
    const max = Math.max(0, this.months.length - this.visibleCount());
    return Math.min(Math.max(index, 0), max);
  }

  bind() {
    // Three months per slide on desktop, one on mobile, so crossing the
    // breakpoint changes how many slides there are and the whole carousel has
    // to be rebuilt around whichever month is on screen.
    this.desktop.addEventListener('change', () => this.build());
    this.carousel_el.addEventListener('slid.bs.carousel', (e) => {
      this.first_month = e.to * this.visibleCount();
      this.updateControls(e.to);
    });
  }

  // Chunks the months into slides, paints them with the one holding
  // this.first_month active, and hands the result to Bootstrap.
  build() {
    const size = this.visibleCount();
    this.slides = [];
    for (let i = 0; i < this.months.length; i += size) {
      this.slides.push(this.months.slice(i, i + size));
    }
    const active = Math.floor(this.first_month / size);
    // Snap to the first month of the slide, so a later rebuild lands on the
    // same slide it came from instead of drifting.
    this.first_month = active * size;

    if (this.carousel) {
      this.carousel.dispose();
    }
    this.renderSlides(active);
    this.carousel = new bootstrap.Carousel(this.carousel_el, {
      interval: false,
      ride: false,
      wrap: false,
      touch: true
    });
    this.updateControls(active);
  }

  renderSlides(active) {
    this.inner.replaceChildren();
    this.indicators.replaceChildren();
    this.slides.forEach((slide, index) => {
      this.inner.appendChild(this.renderSlide(slide, index === active));
      this.indicators.appendChild(this.renderIndicator(slide, index, index === active));
    });
  }

  renderSlide(slide, active) {
    const item = document.createElement('div');
    item.className = active ? 'carousel-item active' : 'carousel-item';

    const months = document.createElement('div');
    months.className = 'calendar-months';
    slide.forEach((month) => months.appendChild(this.renderMonth(month)));
    item.appendChild(months);

    return item;
  }

  renderIndicator(slide, index, active) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.bsTarget = '#' + this.carousel_el.id;
    button.dataset.bsSlideTo = index;
    button.setAttribute('aria-label', this.slideLabel(slide));
    if (active) {
      button.className = 'active';
      button.setAttribute('aria-current', 'true');
    }
    return button;
  }

  slideLabel(slide) {
    const first = slide[0];
    const last = slide[slide.length - 1];
    if (slide.length === 1) {
      return CALENDAR_MONTH_NAMES[first.month] + ' de ' + first.year;
    }
    return 'De ' + CALENDAR_MONTH_NAMES[first.month] + ' de ' + first.year
      + ' a ' + CALENDAR_MONTH_NAMES[last.month] + ' de ' + last.year;
  }

  // Bootstrap does not disable its own controls when wrap is off, and the
  // calendar is supposed to show that it has a beginning and an end.
  updateControls(index) {
    this.prev_btn.disabled = index === 0;
    this.next_btn.disabled = index >= this.slides.length - 1;
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
