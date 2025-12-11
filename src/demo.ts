

import './components/berthing-schedule';
import { BerthingSchedule } from './components/berthing-schedule';
import { demoConfiguration, demoSchedules } from './demo-data';
import type { VesselClickEvent, ScrollEvent, DateFormat } from './components/types';

const scheduleElement = document.getElementById('schedule') as BerthingSchedule;
const zoomSlider = document.getElementById('zoom') as HTMLInputElement;
const zoomValue = document.getElementById('zoom-value') as HTMLSpanElement;
const dateFormatSelect = document.getElementById(
  'dateFormat'
) as HTMLSelectElement;
const resetViewButton = document.getElementById(
  'resetView'
) as HTMLButtonElement;

let currentConfig = { ...demoConfiguration };
scheduleElement.configuration = currentConfig;
scheduleElement.schedules = demoSchedules;

scheduleElement.addEventListener('vessel-click', ((
  event: CustomEvent<VesselClickEvent>
) => {
  console.log('Vessel clicked:', event.detail);
}) as EventListener);

let scrollTimeout: number;
scheduleElement.addEventListener('scroll', ((event: CustomEvent<ScrollEvent>) => {
  clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    const { visibleStartTime, visibleEndTime } = event.detail;
    console.log(
      'Scroll',
      `Visible: ${visibleStartTime.toLocaleDateString()} - ${visibleEndTime.toLocaleDateString()}`
    );
  }, 500);
}) as EventListener);

scheduleElement.addEventListener('loading-complete', () => {
  console.log('Schedule loaded');
});

zoomSlider.addEventListener('input', () => {
  const zoomLevel = parseFloat(zoomSlider.value);
  zoomValue.textContent = `${zoomLevel.toFixed(1)}x`;

  scheduleElement.setZoom(zoomLevel);
  console.log('Zoom Changed', `${zoomLevel.toFixed(1)}x`);
});

dateFormatSelect.addEventListener('change', () => {
  const format = dateFormatSelect.value as DateFormat;
  currentConfig = {
    ...currentConfig,
    timeLine: {
      ...currentConfig.timeLine,
      dateFormat: format,
    },
  };
  scheduleElement.configuration = currentConfig;
  console.log('Date Format Changed', format);
});

resetViewButton.addEventListener('click', () => {
  
  zoomSlider.value = '1';
  zoomValue.textContent = '1.0x';
  scheduleElement.setZoom(1);

  dateFormatSelect.value = 'DayMonth';
  currentConfig = {
    ...currentConfig,
    timeLine: {
      ...currentConfig.timeLine,
      dateFormat: 'DayMonth',
    },
  };
  scheduleElement.configuration = currentConfig;

  const container = scheduleElement.shadowRoot?.querySelector(
    '.schedule-container'
  ) as HTMLElement;
  if (container) {
    container.scrollTop = 0;
    container.scrollLeft = 0;
  }

  console.log('View Reset', 'All settings restored to default');
});

console.log('Demo initialized with configuration:', currentConfig);
console.log('Demo schedules:', demoSchedules);
