import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { QuayConfig, Berth, Bollard } from './types';
import { meterToEm, toCSS } from '../utils/utils';

@customElement('quay-panel')
export class QuayPanel extends LitElement {
  @property({ type: Object })
  config!: QuayConfig;

  static styles = css`
    :host {
      display: flex;
      background: transparent;
      box-sizing: border-box;
    }

    .berth {
      position: relative;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--berth-border, #e0e0e0);
      box-sizing: border-box;
    }

    .berth-header {
      background: var(--berth-header-bg, #555599);
      color: var(--berth-header-text, #ffffff);
      padding: 0.3em;
      text-align: center;
      font-weight: bold;
      font-size: 0.9em;
    }

    .berth-bollards {
      flex: 1;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 0.5em 0;
    }

    .bollard {
      position: absolute;
      width: 0.5em;
      height: 0.5em;
      border-radius: 50%;
      background: var(--bollard-bg, #6666aa);
      border: 1px solid var(--bollard-border, #aaaaaa);
      transform: translateX(-50%);
      box-sizing: border-box;
    }

    .bollard-label {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7em;
      white-space: nowrap;
      margin-bottom: 0.2em;
    }
  `;

  private renderBollard(bollard: Bollard) {
    const position = meterToEm(bollard.distance, this.config.emPerMeter);

    return html`
      <div
        class="bollard"
        style=${styleMap({
          left: position,
          background: toCSS(bollard.backgroundColor),
          borderColor: toCSS(bollard.borderColor),
        })}
        title=${bollard.name}
      >
        <div class="bollard-label">${bollard.name}</div>
      </div>
    `;
  }

  private renderBerth(berth: Berth) {
    const width = meterToEm(berth.length, this.config.emPerMeter);

    return html`
      <div
        class="berth"
        style=${styleMap({
          width,
          background: toCSS(berth.backgroundColor),
          borderColor: toCSS(berth.borderColor),
          borderWidth: `${berth.borderThickness || 1}px`,
        })}
      >
        ${this.config.showTitle
          ? html`<div class="berth-header">${berth.name}</div>`
          : null}
        <div class="berth-bollards">
          ${berth.bollards.map((bollard) => this.renderBollard(bollard))}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      ${this.config.berths.map((berth) => this.renderBerth(berth))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quay-panel': QuayPanel;
  }
}