import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { TimelineConfig, QuayConfig } from './types';
import { hourDifference, hourToEm, meterToEm } from '../utils/utils';

@customElement('grid-lines')
export class GridLines extends LitElement {
  @property({ type: Object })
  timelineConfig!: TimelineConfig;

  @property({ type: Object })
  quayConfig!: QuayConfig;

  @property({ type: Number })
  timelineDuration = 0;

  @property({ type: Number })
  quayLength = 0;

  @property({ type: Object })
  bollardPositions = new Map<string, number>();

  @property({ type: Array })
  berthEndPositions: number[] = [];

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      pointer-events: none;
    }

    .grid-line.horizontal {
      left: 0;
      width: 100%;
      height: 0;
      border-top: 1px solid;
    }

    .grid-line.vertical {
      top: 0;
      width: 0;
      height: 100%;
      border-left: 1px solid;
    }

    .grid-line.berth-end {
      border-left-width: 2px;
    }

    .grid-line.day-end {
      border-top-width: 2px;
    }
  `;

  render() {
    if (!this.timelineConfig || !this.quayConfig) {
      return null;
    }

    return html`
      ${this.renderHorizontalLines()}
      ${this.renderVerticalLines()}
    `;
  }

  private renderHorizontalLines() {
    const { startDate, endDate, emPerHour = 1, timeGridColor } = this.timelineConfig;
    const lines: Array<{ offset: string; color: string; isDay: boolean }> = [];

    let current = new Date(startDate);
    current.setMinutes(0, 0, 0);

    while (current < endDate) {
      const hours = hourDifference(startDate, current);
      const offset = hourToEm(hours, emPerHour);
      const isDay = current.getHours() === 0;

      lines.push({
        offset,
        color: timeGridColor || '#e0e0e0',
        isDay,
      });

      current.setHours(current.getHours() + 1);
    }

    return lines.map(
      (line) => html`
        <div
          class="grid-line horizontal ${line.isDay ? 'day-end' : ''}"
          style=${styleMap({
            top: line.offset,
            borderTopColor: line.color,
          })}
        ></div>
      `
    );
  }

  private renderVerticalLines() {
    const { bollardGridColor, berthEndColor } = this.quayConfig;
    const lines: Array<{ offset: string; color: string; isBerthEnd: boolean }> = [];

    this.bollardPositions.forEach((position) => {
      const offset = meterToEm(position, this.quayConfig.emPerMeter);
      lines.push({
        offset,
        color: bollardGridColor || '#e0e0e0',
        isBerthEnd: false,
      });
    });

    this.berthEndPositions.forEach((position) => {
      const offset = meterToEm(position, this.quayConfig.emPerMeter);
      lines.push({
        offset,
        color: berthEndColor || '#ff9999',
        isBerthEnd: true,
      });
    });

    return lines.map(
      (line) => html`
        <div
          class="grid-line vertical ${line.isBerthEnd ? 'berth-end' : ''}"
          style=${styleMap({
            left: line.offset,
            borderLeftColor: line.color,
          })}
        ></div>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-lines': GridLines;
  }
}
