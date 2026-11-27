import { indiaDateKey } from './site-content.mjs';
import { renderHolidayScene } from './holiday-scenes.mjs';

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const chosenFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const eventDates = {
  '2026-11-08': { title: 'Diwali', scene: 'fireworks' },
  '2026-12-31': { title: "New Year's Eve", scene: 'fireworks' },
  '2027-02-06': { title: 'Lunar New Year', scene: 'lanterns' },
  '2027-10-29': { title: 'Diwali', scene: 'fireworks' },
};
function holidayFor(key) {
  if (key.endsWith('-12-25')) return { title: 'Christmas Day', scene: 'snow' };
  if (key.endsWith('-12-31')) return { title: "New Year's Eve", scene: 'fireworks' };
  return eventDates[key] || null;
}

function fromKey(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function asKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthDate(date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);
}

export function initDatePicker(input) {
  if (!input || input.dataset.calendarReady) return;
  input.dataset.calendarReady = 'true';

  const label = input.closest('.field-label');
  if (!label) return;
  const marker = document.createComment('VBK date picker');
  input.before(marker);
  const todayKey = indiaDateKey();
  const today = fromKey(todayKey);
  let displayedMonth = monthDate(input.value ? fromKey(input.value) : today);
  let open = false;
  let frame = 0;
  let sceneEvent = null;
  let sceneStartedAt = 0;

  const control = document.createElement('div');
  control.className = 'vbk-date-control';
  const row = document.createElement('div');
  row.className = 'vbk-date-input-row';
  const trigger = document.createElement('button');
  trigger.className = 'vbk-date-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', 'Open date calendar');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"/></svg>';
  const clear = document.createElement('button');
  clear.className = 'vbk-date-clear';
  clear.type = 'button';
  clear.textContent = 'Clear';
  clear.setAttribute('aria-label', 'Clear preferred date');

  input.type = 'text';
  input.readOnly = true;
  input.inputMode = 'none';
  input.autocomplete = 'off';
  input.placeholder = 'Select a date';
  input.setAttribute('aria-haspopup', 'dialog');
  input.setAttribute('aria-expanded', 'false');
  trigger.disabled = input.disabled;
  clear.disabled = input.disabled;

  const panel = document.createElement('div');
  panel.className = 'vbk-date-calendar';
  panel.hidden = true;
  panel.id = `vbk-date-calendar-${Math.random().toString(36).slice(2, 9)}`;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Choose a requested visit date');
  input.setAttribute('aria-controls', panel.id);
  panel.innerHTML = '<canvas class="vbk-calendar-scene" aria-hidden="true"></canvas><div class="vbk-calendar-content"><div class="vbk-calendar-topline"><span class="vbk-calendar-brand"><i aria-hidden="true"></i> VBK · REQUEST A VISIT</span><span class="vbk-calendar-season">YOUR DAY, YOUR WAY</span></div><div class="vbk-calendar-heading"><div class="vbk-calendar-heading-copy"><p class="vbk-calendar-kicker"></p><h3 aria-live="polite"></h3></div><div class="vbk-calendar-nav"><button type="button" class="vbk-month-nav vbk-today-nav" data-month="today">Today</button><button type="button" class="vbk-month-nav" data-month="previous" aria-label="Previous month"><span aria-hidden="true">‹</span></button><button type="button" class="vbk-month-nav" data-month="next" aria-label="Next month"><span aria-hidden="true">›</span></button></div></div><div class="vbk-calendar-grid vbk-calendar-weekdays" role="row"></div><div class="vbk-calendar-grid vbk-calendar-days" role="grid"></div><p class="vbk-calendar-note">Choose a date to request a visit. We’ll confirm availability with you.</p></div>';
  const canvas = panel.querySelector('.vbk-calendar-scene');
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'vbk-calendar-overlay';
  overlayCanvas.setAttribute('aria-hidden', 'true');
  panel.append(overlayCanvas);
  const headingKicker = panel.querySelector('.vbk-calendar-kicker');
  const headingTitle = panel.querySelector('.vbk-calendar-heading h3');
  const weekdays = panel.querySelector('.vbk-calendar-weekdays');
  const daysGrid = panel.querySelector('.vbk-calendar-days');
  weekdays.innerHTML = weekdayNames.map(day => `<span role="columnheader">${day}</span>`).join('');

  row.append(input, trigger, clear);
  control.append(row, panel);
  marker.replaceWith(control);

  function paintScene() {
    if (!open || panel.hidden) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const elapsed = Math.max(0, (performance.now() - sceneStartedAt) / 1000);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderHolidayScene(canvas, overlayCanvas, elapsed, sceneEvent, reduced);
    if (!reduced && !document.hidden) frame = requestAnimationFrame(paintScene);
  }

  function updateField() {
    clear.hidden = !input.value;
    if (input.value) displayedMonth = monthDate(fromKey(input.value));
  }

  function stopScene() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function closeCalendar({ returnFocus = false } = {}) {
    open = false;
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-expanded', 'false');
    stopScene();
    if (returnFocus) trigger.focus();
  }

  function renderCalendar() {
    const firstDay = monthDate(displayedMonth);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - mondayOffset, 12);
    const selectedEvent = input.value ? holidayFor(input.value) : null;
    panel.classList.toggle('is-winter', selectedEvent?.scene === 'snow');
    panel.classList.toggle('is-fireworks', selectedEvent?.scene === 'fireworks');
    panel.classList.toggle('is-lanterns', selectedEvent?.scene === 'lanterns');
    panel.dataset.scene = selectedEvent?.scene || 'ambient';
    headingKicker.textContent = input.value ? selectedEvent ? chosenFormatter.format(fromKey(input.value)).toUpperCase() : 'YOUR REQUESTED DATE' : 'A DATE THAT WORKS FOR YOU';
    headingTitle.textContent = selectedEvent?.title || monthFormatter.format(firstDay);
    headingTitle.setAttribute('aria-label', monthFormatter.format(firstDay));
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index, 12);
      const key = asKey(date);
      const outside = date.getMonth() !== displayedMonth.getMonth();
      const past = key < todayKey;
      const selected = key === input.value;
      const holiday = holidayFor(key);
      const classes = ['vbk-calendar-day', outside ? 'is-outside' : '', selected ? 'is-selected' : '', key === todayKey ? 'is-today' : '', holiday ? `has-event is-${holiday.scene}` : ''].filter(Boolean).join(' ');
      const label = `${chosenFormatter.format(date)}${key === todayKey ? ', today' : ''}${holiday ? `, ${holiday.title}` : ''}`;
      return `<button class="${classes}" type="button" data-date="${key}"${past ? ' disabled' : ''}${selected ? ' aria-pressed="true"' : ' aria-pressed="false"'} aria-label="${label}"${outside ? ' data-outside="true"' : ''}>${date.getDate()}${holiday ? '<i aria-hidden="true"></i>' : ''}</button>`;
    }).join('');
    const prev = panel.querySelector('[data-month="previous"]');
    prev.disabled = monthDate(displayedMonth, -1) < monthDate(today);
    daysGrid.setAttribute('aria-label', monthFormatter.format(firstDay));
    daysGrid.innerHTML = days;
  }

  function showCalendar() {
    if (input.disabled) return;
    if (input.value) displayedMonth = monthDate(fromKey(input.value));
    renderCalendar();
    open = true;
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-expanded', 'true');
    sceneEvent = input.value ? holidayFor(input.value) : null;
    sceneStartedAt = performance.now();
    paintScene();
    (panel.querySelector('.is-selected:not(:disabled)') || panel.querySelector('[data-date]:not(:disabled)'))?.focus();
  }

  trigger.addEventListener('click', () => open ? closeCalendar() : showCalendar());
  input.addEventListener('click', showCalendar);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showCalendar(); }
  });
  clear.addEventListener('click', () => {
    input.value = '';
    input.setCustomValidity('');
    clear.hidden = true;
    sceneEvent = null;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    closeCalendar();
    input.focus();
  });
  panel.addEventListener('click', event => {
    const monthButton = event.target.closest('[data-month]');
    if (monthButton) {
      if (monthButton.dataset.month === 'today') displayedMonth = monthDate(today);
      else displayedMonth = monthDate(displayedMonth, monthButton.dataset.month === 'next' ? 1 : -1);
      renderCalendar();
      panel.querySelector(`[data-month="${monthButton.dataset.month}"]`)?.focus();
      return;
    }
    const dayButton = event.target.closest('[data-date]');
    if (!dayButton || dayButton.disabled) return;
    input.value = dayButton.dataset.date;
    input.setCustomValidity('');
    updateField();
    sceneEvent = holidayFor(input.value);
    sceneStartedAt = performance.now();
    renderCalendar();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (!sceneEvent) closeCalendar({ returnFocus: true });
    else {
      paintScene();
      panel.querySelector(`[data-date="${input.value}"]`)?.focus();
    }
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeCalendar({ returnFocus: true }); }
  });
  document.addEventListener('pointerdown', event => {
    if (open && !control.contains(event.target)) closeCalendar();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopScene();
    else if (open && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) frame = requestAnimationFrame(paintScene);
  });
  window.addEventListener('resize', () => { if (open) { stopScene(); paintScene(); } });
  input.form?.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      input.setCustomValidity('');
      displayedMonth = monthDate(today);
      closeCalendar();
      updateField();
    });
  });
  new MutationObserver(() => { trigger.disabled = input.disabled; clear.disabled = input.disabled; }).observe(input, { attributes: true, attributeFilter: ['disabled'] });
  updateField();
}
