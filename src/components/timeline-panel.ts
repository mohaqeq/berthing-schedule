import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { TimelineConfig } from './types';
import { hourDifference, formatTime, formatDate, hourToEm } from '../utils/utils';

/**
 * Timeline Panel Component
 * Displays the vertical timeline with day and hour markers
 */
@customElement('timeline-panel')
export class TimelinePanel extends LitElement {
  @property({ type: Object })
  config!: TimelineConfig;

  static styles = css`
    :host {
      display: block;
      background: var(--timeline-bg, #fefefe);
      border-right: 2px solid var(--timeline-border, #e0e0e0);
      box-sizing: border-box;
      position: relative;
    }

    .time-marker {
      position: absolute;
      left: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--timeline-border, #e0e0e0);
      box-sizing: border-box;
    }

    .time-marker.day {
      background: var(--day-marker-bg, #6699aa);
      color: var(--day-marker-text, #ffffff);
      font-weight: bold;
    }

    .time-marker.hour {
      background: var(--hour-marker-bg, #66aacc);
      color: var(--hour-marker-text, #ffffff);
    }
  `;

  render() {
    const { startDate, endDate, emPerHour = 1 } = this.config;
    const markers: Array<{ type: 'day' | 'hour'; time: Date; offset: string }> = [];
    const timelineDuration = hourDifference(startDate, endDate);

    let current = new Date(startDate);
    current.setMinutes(0, 0, 0);

    while (current < endDate) {
      const hours = hourDifference(startDate, current);
      const offset = hourToEm(hours, emPerHour);

      if (current.getHours() === 0) {
        markers.push({ type: 'day', time: new Date(current), offset });
      } else {
        markers.push({ type: 'hour', time: new Date(current), offset });
      }

      current.setHours(current.getHours() + 1);
    }

    return html`
      <div
        style=${styleMap({
          height: hourToEm(timelineDuration, emPerHour),
        })}
      >
        ${markers.map(
          (marker) => html`
            <div
              class="time-marker ${marker.type}"
              style=${styleMap({ top: marker.offset, height: `${emPerHour}em` })}
            >
              ${marker.type === 'day'
                ? formatDate(
                    marker.time,
                    this.config.dateFormat || 'DayMonth',
                    this.config.dateLocale
                  )
                : formatTime(marker.time)}
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'timeline-panel': TimelinePanel;
  }
}
