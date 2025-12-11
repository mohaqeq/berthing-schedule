import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CornerBoxConfig } from './types';
import { formatDate } from '../utils/utils';

@customElement('corner-box')
export class CornerBox extends LitElement {
  @property({ type: Object })
  startDate!: Date;

  @property({ type: Object })
  endDate!: Date;

  @property({ type: String })
  dateLocale?: string;

  @property({ type: Object })
  config?: CornerBoxConfig;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5em;
      background: var(--corner-bg, #f7f7f7);
      border: 1px solid var(--corner-border, #e0e0e0);
      border-right-width: 2px;
      border-bottom-width: 2px;
      box-sizing: border-box;
    }

    .year {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 0.25em;
    }

    .date-range {
      font-size: 0.85em;
      color: #666;
    }
  `;

  render() {
    const sameYear = this.startDate.getFullYear() === this.endDate.getFullYear();

    return html`
      <div class="year">
        ${sameYear
          ? this.startDate.getFullYear()
          : `${this.startDate.getFullYear()} - ${this.endDate.getFullYear()}`}
      </div>
      <div class="date-range">
        ${formatDate(this.startDate, 'DayMonth', this.dateLocale)}
        - ${formatDate(this.endDate, 'DayMonth', this.dateLocale)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'corner-box': CornerBox;
  }
}