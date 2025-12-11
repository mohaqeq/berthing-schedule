import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ScheduleItem } from './types';
import { isVesselCall } from './types';
import { formatTime, formatDateTime, toCSS } from '../utils/utils';
import { loadSpritesheet, getSpriteCss } from '../utils/spritesheet';

/**
 * Vessel Box Component
 * Displays a single vessel or non-working period box
 */
@customElement('vessel-box')
export class VesselBox extends LitElement {
  @property({ type: Object })
  item!: ScheduleItem;

  @property({ type: String })
  left = '0';

  @property({ type: String })
  top = '0';

  @property({ type: String })
  width = '0';

  @property({ type: String })
  height = '0';

  @state()
  private spritesheetLoaded = false;

  static styles = css`
      :host {
          display: block;
          position: absolute;
          border-radius: 0.3em;
          border-style: solid;
          border-width: 1px;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
      }

      :host(:hover) {
          transform: scale(1.005);
          box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.2);
          z-index: 50 !important;
      }

      .vessel-header {
          padding: 0.3em 0.5em;
          font-weight: bold;
          font-size: 0.9em;
          background: rgba(255, 255, 255, 0.1);
      }

      .vessel-times {
          position: absolute;
          top: 0.3em;
          left: 2em;
          font-size: 0.75em;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 0.2em 0.4em;
          border-radius: 0.2em;
      }

      .vessel-end-time {
          position: absolute;
          bottom: 0.3em;
          left: 0.5em;
          font-size: 0.75em;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 0.2em 0.4em;
          border-radius: 0.2em;
      }

      .vessel-bollards {
          position: absolute;
          top: 0.3em;
          right: 0.5em;
          font-size: 0.75em;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 0.2em 0.4em;
          border-radius: 0.2em;
      }

      .vessel-name {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          font-size: 1em;
          text-align: center;
          pointer-events: none;
      }

      .vessel-description {
          position: absolute;
          bottom: 0.5em;
          left: 0.5em;
          right: 0.5em;
          font-size: 0.85em;
          text-align: center;
      }

      .vessel-ship {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10em;
          height: 5em;
          background-image: url('/assets/spritesheet.png');
          background-repeat: no-repeat;
          pointer-events: none;
          opacity: 0.15;
      }

      .vessel-flag {
          position: absolute;
          top: 1.6em;
          right: 0.4em;
          width: 1.5em;
          height: 1em;
          background-image: url('/assets/spritesheet.png');
          background-repeat: no-repeat;
          border: 1px solid rgba(0, 0, 0, 0.2);
          box-shadow: 0 0.1em 0.2em rgba(0, 0, 0, 0.2);
      }

      .vessel-specs {
          position: absolute;
          bottom: 0.3em;
          right: 0.5em;
          font-size: 0.7em;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 0.2em 0.4em;
          border-radius: 0.2em;
          text-align: right;
      }

      @keyframes fadeOut {
        from { opacity: 0; }
      }

      .error-indicator {
          position: absolute;
          top: 0.2em;
          right: 4em;
          transform: translateX(-50%);
          width: 1em;
          height: 1em;
          background: #ff4444;
          border: 1px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1em;
          box-shadow: 0 0.2em 0.4em rgba(0, 0, 0, 0.3);
          z-index: 10;
          animation: fadeOut 1s infinite alternate;
      }

      .non-working-image {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 80%;
          max-height: 80%;
          opacity: 0.4;
          pointer-events: none;
      }

      .voyage-timing {
          position: absolute;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
      }

      .timing-marker {
          position: absolute;
          left: 0;
          width: 100%;
          height: 0;
          border-top: 2px dashed;
          opacity: 0.7;
      }

      .timing-label {
          position: absolute;
          left: 11em;
          font-size: 0.65em;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.1em 0.3em;
          border-radius: 0.2em;
          white-space: nowrap;
      }

      .timing-label.below {
          top: 0.2em;
      }

      .timing-label.above {
          bottom: 0.2em;
      }

      .margin-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 0.3em;
          background: repeating-linear-gradient(
                  45deg,
                  rgba(255, 0, 0, 0.3),
                  rgba(255, 0, 0, 0.3) 0.3em,
                  transparent 0.3em,
                  transparent 0.6em
          );
          pointer-events: none;
      }

      .margin-label {
          position: absolute;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          font-size: 0.6em;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 0.2em 0.3em;
          border-radius: 0.2em;
          white-space: nowrap;
          transform-origin: center;
      }

      .drag-handle {
          position: absolute;
          left: 0;
          right: 0;
          height: 0.3em;
          background: rgba(0, 120, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
      }

      .drag-handle::after {
          content: '⋯';
          color: white;
          font-size: 1em;
          font-weight: bold;
      }

      :host(:hover) .drag-handle {
          opacity: 1;
      }

      .drag-handle.top {
          cursor: move;
          top: 0;
      }

      .drag-handle.bottom {
          cursor: ns-resize;
          bottom: 0;
      }

      .menu-button {
          position: absolute;
          top: 0.3em;
          left: 0.3em;
          width: 1.3em;
          height: 1.3em;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.8em;
          font-weight: bold;
          opacity: 1;
          transition: opacity 0.2s, background 0.2s;
          pointer-events: auto;
      }

      .menu-button::after {
          content: '⋮';
      }

      .menu-button:hover {
          background: rgba(0, 0, 0, 1);
      }
  `;

  private handleClick(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('vessel-click', {
        detail: {
          vessel: this.item,
          x: e.clientX,
          y: e.clientY,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);

    // Load spritesheet data
    loadSpritesheet().then(() => {
      this.spritesheetLoaded = true;
    }).catch((error) => {
      console.error('Failed to load spritesheet:', error);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
  }

  updated() {
    // Apply positioning and styling to the host element
    this.style.left = this.left;
    this.style.top = this.top;
    this.style.width = this.width;
    this.style.height = this.height;
    this.style.background = toCSS(this.item.backgroundColor);
    this.style.borderColor = toCSS(this.item.borderColor);
    this.style.borderWidth = `${this.item.borderThickness || 1}px`;
    this.style.borderStyle = this.item.borderStyle || 'solid';
    this.style.color = toCSS(this.item.foregroundColor);
    this.style.zIndex = `${this.item.zIndex || 0}`;
  }

  render() {
    const vesselName = isVesselCall(this.item) ? this.item.vessel.name : this.item.name;

    return html`
      ${isVesselCall(this.item) && this.item.voyage?.timing
          ? this.renderVoyageTiming(this.item)
          : null}
      ${this.item.hasError
        ? html`<div class="error-indicator">!</div>`
        : null}
      ${!this.item.hideStartTime
        ? html`<div class="vessel-times">${formatDateTime(this.item.startDate)}</div>`
        : null}
      ${!this.item.hideEndTime
        ? html`<div class="vessel-end-time">
            ${formatTime(this.item.endDate)}
          </div>`
        : null}
      ${!this.item.hideBollards
        ? html`<div class="vessel-bollards">
            ${this.item.startBollardId} - ${this.item.endBollardId}
          </div>`
        : null}
      ${isVesselCall(this.item) && !this.item.hideShip
        ? html`<div
            class="vessel-ship"
            style="${this.getShipSpritePosition(this.item.vessel.vesselType)}"
          ></div>`
        : null}
      ${!isVesselCall(this.item) && this.item.image && !this.item.hideImage
        ? html`<img class="non-working-image" src="${this.item.image}" alt="${vesselName}" />`
        : null}
      ${isVesselCall(this.item) && !this.item.hideFlag
        ? html`<div
            class="vessel-flag"
            style="${this.getFlagSpritePosition(this.item.vessel.nationality)}"
          ></div>`
        : null}
      <div class="vessel-name">${vesselName}</div>
      ${!this.item.hideDescription && this.item.description
        ? html`<div class="vessel-description">${this.item.description}</div>`
        : null}
      ${isVesselCall(this.item) && !this.item.hideShipSpec
        ? html`<div class="vessel-specs">
            LOA: ${this.item.vessel.LOA}m<br/>
            Draft: ${this.item.vessel.draft}m
          </div>`
        : null}
      ${isVesselCall(this.item) && (this.item.voyage?.marginLeft || this.item.voyage?.marginRight)
        ? this.renderMargins(this.item)
        : null}
      ${!this.item.operationTimeLocked && !this.item.hideMenu
        ? html`
          <div class="drag-handle bottom" @mousedown=${this.handleStretchStart} data-direction="bottom"></div>
        `
        : null}
      ${!this.item.moveLocked && !this.item.hideMenu
        ? html`<div class="drag-handle top" @mousedown=${this.handleMoveStart}></div>`
        : null}
      ${!this.item.hideMenu
        ? html`<div class="menu-button" @click=${this.handleMenuClick}></div>`
        : null}
    `;
  }

  private handleStretchStart(e: MouseEvent) {
    e.stopPropagation();
    const direction = (e.currentTarget as HTMLElement).dataset.direction;
    this.dispatchEvent(
      new CustomEvent('stretch-start', {
        detail: {
          vessel: this.item,
          direction,
          startY: e.clientY,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMoveStart(e: MouseEvent) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('move-start', {
        detail: {
          vessel: this.item,
          startX: e.clientX,
          startY: e.clientY,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMenuClick(e: MouseEvent) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('menu-click', {
        detail: {
          vessel: this.item,
          x: e.clientX,
          y: e.clientY,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderVoyageTiming(item: any) {
    const timing = item.voyage.timing;
    if (!timing) return null;

    const startTime = item.startDate.getTime();
    const endTime = item.endDate.getTime();
    const duration = endTime - startTime;

    const timingStages = [
      { name: 'Anchorage', date: timing.anchorage, color: '#ff9999' },
      { name: 'Berth', date: timing.berth, color: '#ffcc99' },
      { name: 'Start Op', date: timing.startOperation, color: '#99ff99' },
      { name: 'End Op', date: timing.endOperation, color: '#99ffff' },
      { name: 'Unberth', date: timing.unberth, color: '#cc99ff' },
      { name: 'Full Away', date: timing.fullaway, color: '#ff99ff' },
    ];

    return html`
      <div class="voyage-timing">
        ${timingStages.map((stage) => {
          if (!stage.date) return null;
          const stageTime = stage.date.getTime();
          if (stageTime < startTime || stageTime > endTime) return null;

          const position = ((stageTime - startTime) / duration) * 100;
          const isActive = timing.activeTime === stage.name.replace(' ', '');
          const labelPosition = position > 50 ? 'above' : 'below';

          return html`
            <div
              class="timing-marker"
              style="top: ${position}%; border-top-color: ${stage.color}; border-top-width: ${isActive ? '3px' : '2px'};"
            >
              <div class="timing-label ${labelPosition}" style="background-color: ${stage.color}; color: #000;">
                ${stage.name}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private renderMargins(item: any) {
    const voyage = item.voyage;
    return html`
      ${voyage.marginLeft
        ? html`<div class="margin-indicator" style="left: 0;">
            <div class="margin-label">${voyage.marginLeft}m</div>
          </div>`
        : null}
      ${voyage.marginRight
        ? html`<div class="margin-indicator" style="right: 0;">
            <div class="margin-label">${voyage.marginRight}m</div>
          </div>`
        : null}
    `;
  }

  private getShipSpritePosition(vesselType: string): string {
    if (!this.spritesheetLoaded) {
      return '';
    }
    // Ship uses center alignment since it's positioned in the center of the vessel box
    return getSpriteCss(vesselType, 0.5, 'top left');
  }

  private getFlagSpritePosition(nationality: string): string {
    if (!this.spritesheetLoaded) {
      return '';
    }
    // Flag uses top-right alignment since it's positioned at top-right corner
    return getSpriteCss(nationality.toLowerCase(), 0.5, 'top right');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vessel-box': VesselBox;
  }
}
