/**
 * Demo application for the berth schedule component
 */

import './components/berthing-schedule';
import { BerthingSchedule } from './components/berthing-schedule';
import { demoConfiguration, demoSchedules } from './demo-data';
import type { VesselClickEvent, ScrollEvent, DateFormat } from './components/types';

// Get references to DOM elements
const scheduleElement = document.getElementById('schedule') as BerthingSchedule;
const zoomSlider = document.getElementById('zoom') as HTMLInputElement;
const zoomValue = document.getElementById('zoom-value') as HTMLSpanElement;
const dateFormatSelect = document.getElementById(
  'dateFormat'
) as HTMLSelectElement;
const resetViewButton = document.getElementById(
  'resetView'
) as HTMLButtonElement;
const eventList = document.getElementById('eventList') as HTMLDivElement;

// Initialize the schedule
let currentConfig = { ...demoConfiguration };
scheduleElement.configuration = currentConfig;
scheduleElement.schedules = demoSchedules;

// Event logging
const logEvent = (eventName: string, details: string) => {
  const eventElement = document.createElement('div');
  eventElement.className = 'event';
  const timestamp = new Date().toLocaleTimeString();
  eventElement.innerHTML = `<strong>${eventName}</strong> @ ${timestamp}<br/>${details}`;

  eventList.insertBefore(eventElement, eventList.firstChild);

  // Keep only last 5 events
  while (eventList.children.length > 5) {
    eventList.removeChild(eventList.lastChild!);
  }
};

// Handle vessel click events
scheduleElement.addEventListener('vessel-click', ((
  event: CustomEvent<VesselClickEvent>
) => {
  const { vessel } = event.detail;
  logEvent(
    'Vessel Clicked',
    `${vessel.name}<br/>Start: ${vessel.startDate.toLocaleString()}<br/>End: ${vessel.endDate.toLocaleString()}`
  );
  console.log('Vessel clicked:', event.detail);
}) as EventListener);

// Handle scroll events (throttled)
let scrollTimeout: number;
scheduleElement.addEventListener('scroll', ((event: CustomEvent<ScrollEvent>) => {
  clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    const { visibleStartTime, visibleEndTime } = event.detail;
    logEvent(
      'Scroll',
      `Visible: ${visibleStartTime.toLocaleDateString()} - ${visibleEndTime.toLocaleDateString()}`
    );
  }, 500);
}) as EventListener);

// Handle loading complete
scheduleElement.addEventListener('loading-complete', () => {
  logEvent('Loading Complete', 'Schedule rendered successfully');
  console.log('Schedule loaded');
});

// Zoom control
zoomSlider.addEventListener('input', () => {
  const zoomLevel = parseFloat(zoomSlider.value);
  zoomValue.textContent = `${zoomLevel.toFixed(1)}x`;

  // Use the setZoom method
  scheduleElement.setZoom(zoomLevel);
  logEvent('Zoom Changed', `${zoomLevel.toFixed(1)}x`);
});

// Date format control
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
  logEvent('Date Format Changed', format);
});

// Reset view
resetViewButton.addEventListener('click', () => {
  // Reset zoom
  zoomSlider.value = '1';
  zoomValue.textContent = '1.0x';
  scheduleElement.setZoom(1);

  // Reset date format
  dateFormatSelect.value = 'DayMonth';
  currentConfig = {
    ...currentConfig,
    timeLine: {
      ...currentConfig.timeLine,
      dateFormat: 'DayMonth',
    },
  };
  scheduleElement.configuration = currentConfig;

  // Scroll to top
  const container = scheduleElement.shadowRoot?.querySelector(
    '.schedule-container'
  ) as HTMLElement;
  if (container) {
    container.scrollTop = 0;
    container.scrollLeft = 0;
  }

  logEvent('View Reset', 'All settings restored to default');
});

// Log initial load
console.log('Demo initialized with configuration:', currentConfig);
console.log('Demo schedules:', demoSchedules);