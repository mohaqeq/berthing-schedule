import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { PropertyValues } from 'lit';
import type {
  BerthScheduleConfig,
  ScheduleItem,
  ScrollEvent,
} from './types';
import { isVesselCall } from './types';
import { hourDifference, hourToEm, meterToEm } from '../utils/utils';

import './corner-box';
import './timeline-panel';
import './quay-panel';
import './vessel-box';
import './grid-lines';

@customElement('berthing-schedule')
export class BerthingSchedule extends LitElement {
  
  @property({ type: Object })
  configuration!: BerthScheduleConfig;

  @property({ type: Array })
  schedules: ScheduleItem[] = [];

  @state()
  private timelineDuration = 0;

  @state()
  private quayLength = 0;

  @state()
  private bollardPositions = new Map<string, number>();

  @state()
  private berthEndPositions: number[] = [];

  @state()
  private draggingItem: ScheduleItem | null = null;

  @state()
  private dragType: 'move' | 'resize' | null = null;

  private dragStartX = 0;
  private dragStartY = 0;

  private originalStartBollardId = '';
  private originalEndBollardId = '';
  private originalStartDate: Date | null = null;
  private originalEndDate: Date | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
      font-size: var(--berth-schedule-font-size, 14px);
      --corner-size: 6em;
    }

    .schedule-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      background: var(--berth-schedule-bg, #ffffff);
    }

    .schedule-grid {
      position: relative;
      display: grid;
      grid-template-columns: var(--corner-size) 1fr;
      grid-template-rows: var(--corner-size) 1fr;
      min-width: fit-content;
      min-height: fit-content;
    }

    /* Corner Box */
    corner-box {
      grid-column: 1;
      grid-row: 1;
      position: sticky;
      top: 0;
      left: 0;
      z-index: 100;
    }

    /* Timeline Panel */
    timeline-panel {
      grid-column: 1;
      grid-row: 2;
      position: sticky;
      left: 0;
      z-index: 90;
    }

    /* Quay Panel */
    quay-panel {
      grid-column: 2;
      grid-row: 1;
      position: sticky;
      top: 0;
      z-index: 80;
    }

    /* Schedule Grid Area */
    .schedule-area {
      grid-column: 2;
      grid-row: 2;
      position: relative;
      box-sizing: border-box;
    }

    /* Scrollbar styling */
    .schedule-container::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    .schedule-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .schedule-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 6px;
    }

    .schedule-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.calculateDimensions();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.addEventListener('move-start', this.handleMoveStart as EventListener);
    this.addEventListener('stretch-start', this.handleStretchStart as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.removeEventListener('move-start', this.handleMoveStart as EventListener);
    this.removeEventListener('stretch-start', this.handleStretchStart as EventListener);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const container = this.shadowRoot?.querySelector('.schedule-container') as HTMLElement;
    if (!container) return;

    const scrollAmount = 50;
    const pageScrollAmount = container.clientHeight * 0.8;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        container.scrollTop -= scrollAmount;
        break;
      case 'ArrowDown':
        e.preventDefault();
        container.scrollTop += scrollAmount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        container.scrollLeft -= scrollAmount;
        break;
      case 'ArrowRight':
        e.preventDefault();
        container.scrollLeft += scrollAmount;
        break;
      case 'PageUp':
        e.preventDefault();
        container.scrollTop -= pageScrollAmount;
        break;
      case 'PageDown':
        e.preventDefault();
        container.scrollTop += pageScrollAmount;
        break;
      case 'Home':
        if (e.ctrlKey) {
          e.preventDefault();
          container.scrollTop = 0;
        }
        break;
      case 'End':
        if (e.ctrlKey) {
          e.preventDefault();
          container.scrollTop = container.scrollHeight;
        }
        break;
    }
  };

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has('configuration') ||
      changedProperties.has('schedules')
    ) {
      this.calculateDimensions();
      this.dispatchEvent(
        new CustomEvent('loading-complete', { bubbles: true, composed: true })
      );
    }
  }

  private calculateDimensions() {
    if (!this.configuration) {
      return;
    }

    const { startDate, endDate } = this.configuration.timeLine;
    this.timelineDuration = hourDifference(startDate, endDate);

    let currentPosition = 0;
    this.bollardPositions.clear();
    this.berthEndPositions = [];

    if (this.configuration.quay.berths) {
      for (const berth of this.configuration.quay.berths) {
        for (const bollard of berth.bollards) {
          this.bollardPositions.set(
            bollard.id,
            currentPosition + bollard.distance
          );
        }
        currentPosition += berth.length;
        
        this.berthEndPositions.push(currentPosition);
      }
      this.quayLength = currentPosition;
    }
  }

  private handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const detail: ScrollEvent = {
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop,
      visibleStartTime: new Date(
        this.configuration.timeLine.startDate.getTime() +
          (target.scrollTop / parseFloat(getComputedStyle(this).fontSize)) *
            3600000
      ),
      visibleEndTime: new Date(
        this.configuration.timeLine.startDate.getTime() +
          ((target.scrollTop + target.clientHeight) /
            parseFloat(getComputedStyle(this).fontSize)) *
            3600000
      ),
    };
    this.dispatchEvent(
      new CustomEvent('scroll', { detail, bubbles: true, composed: true })
    );
  }

  private renderScheduleArea() {
    if (!this.configuration) return null;

    const height = hourToEm(
      this.timelineDuration,
      this.configuration.timeLine.emPerHour || 1
    );
    const width = meterToEm(this.quayLength, this.configuration.quay.emPerMeter);

    return html`
      <div
        class="schedule-area"
        style=${styleMap({
          height,
          width,
        })}
      >
        <grid-lines
          .timelineConfig=${this.configuration.timeLine}
          .quayConfig=${this.configuration.quay}
          .timelineDuration=${this.timelineDuration}
          .quayLength=${this.quayLength}
          .bollardPositions=${this.bollardPositions}
          .berthEndPositions=${this.berthEndPositions}
        ></grid-lines>
        ${this.schedules.map((item) => this.renderVesselBox(item))}
      </div>
    `;
  }

  private renderVesselBox(item: ScheduleItem) {
    const startPos = this.bollardPositions.get(item.startBollardId) || 0;
    const endPos = this.bollardPositions.get(item.endBollardId) || 0;

    const left = meterToEm(startPos, this.configuration.quay.emPerMeter);
    const width = meterToEm(
      isVesselCall(item) ? item.vessel.LOA : endPos - startPos,
      this.configuration.quay.emPerMeter
    );

    const startHours = hourDifference(
      this.configuration.timeLine.startDate,
      item.startDate
    );
    const durationHours = hourDifference(item.startDate, item.endDate);

    const emPerHour = this.configuration.timeLine.emPerHour || 1;

    const top = hourToEm(startHours, emPerHour);
    const height = hourToEm(durationHours, emPerHour);

    return html`
      <vessel-box
        .item=${item}
        .left=${left}
        .top=${top}
        .width=${width}
        .height=${height}
      ></vessel-box>
    `;
  }

  private handleMoveStart = (e: CustomEvent) => {
    const { vessel, startX, startY } = e.detail;

    if (vessel.moveLocked) return;

    this.draggingItem = vessel;
    this.dragType = 'move';
    this.dragStartX = startX;
    this.dragStartY = startY;
    this.originalStartBollardId = vessel.startBollardId;
    this.originalEndBollardId = vessel.endBollardId;
    this.originalStartDate = new Date(vessel.startDate);
    this.originalEndDate = new Date(vessel.endDate);
  };

  private handleStretchStart = (e: CustomEvent) => {
    const { vessel, startY } = e.detail;

    if (vessel.operationTimeLocked) return;

    this.draggingItem = vessel;
    this.dragType = 'resize';
    this.dragStartY = startY;
    this.originalEndDate = new Date(vessel.endDate);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.draggingItem || !this.dragType) return;

    if (this.dragType === 'move') {
      this.handleMoveOperation(e);
    } else if (this.dragType === 'resize') {
      this.handleResizeOperation(e);
    }
  };

  private handleMoveOperation(e: MouseEvent) {
    if (!this.draggingItem) return;

    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;

    const fontSize = parseFloat(getComputedStyle(this).fontSize);
    const emPerMeter = this.configuration.quay.emPerMeter;
    const emPerHour = this.configuration.timeLine.emPerHour || 1;

    const deltaMeters = (deltaX / fontSize) / emPerMeter;
    const originalStartPos = this.bollardPositions.get(this.originalStartBollardId) || 0;
    const originalEndPos = this.bollardPositions.get(this.originalEndBollardId) || 0;
    const newStartPos = originalStartPos + deltaMeters;
    const newEndPos = originalEndPos + deltaMeters;

    let nearestStartId: string | null = null;
    let nearestEndId: string | null = null;
    let minStartDistance = Infinity;
    let minEndDistance = Infinity;

    this.bollardPositions.forEach((pos, id) => {
      const startDist = Math.abs(pos - newStartPos);
      const endDist = Math.abs(pos - newEndPos);

      if (startDist < minStartDistance) {
        minStartDistance = startDist;
        nearestStartId = id;
      }
      if (endDist < minEndDistance) {
        minEndDistance = endDist;
        nearestEndId = id;
      }
    });

    if (nearestStartId) this.draggingItem.startBollardId = nearestStartId;
    if (nearestEndId) this.draggingItem.endBollardId = nearestEndId;

    const deltaHours = (deltaY / fontSize) / emPerHour;
    const deltaMs = deltaHours * 3600000;

    if (this.originalStartDate && this.originalEndDate) {
      const newStartTime = new Date(this.originalStartDate.getTime() + deltaMs);
      const newEndTime = new Date(this.originalEndDate.getTime() + deltaMs);

      newStartTime.setMinutes(Math.round(newStartTime.getMinutes() / 60) * 60);
      newEndTime.setMinutes(Math.round(newEndTime.getMinutes() / 60) * 60);

      const effectiveDeltaMs = newStartTime.getTime() - this.draggingItem.startDate.getTime();

      this.draggingItem.startDate = newStartTime;
      this.draggingItem.endDate = newEndTime;

      if (isVesselCall(this.draggingItem) && this.draggingItem.voyage?.timing && effectiveDeltaMs !== 0) {
        const timing = this.draggingItem.voyage.timing;

        if (timing.anchorage) {
          timing.anchorage = new Date(timing.anchorage.getTime() + effectiveDeltaMs);
        }
        if (timing.berth) {
          timing.berth = new Date(timing.berth.getTime() + effectiveDeltaMs);
        }
        if (timing.startOperation) {
          timing.startOperation = new Date(timing.startOperation.getTime() + effectiveDeltaMs);
        }
        if (timing.endOperation) {
          timing.endOperation = new Date(timing.endOperation.getTime() + effectiveDeltaMs);
        }
        if (timing.unberth) {
          timing.unberth = new Date(timing.unberth.getTime() + effectiveDeltaMs);
        }
        if (timing.fullaway) {
          timing.fullaway = new Date(timing.fullaway.getTime() + effectiveDeltaMs);
        }
      }
    }

    this.requestUpdate();
  };

  private handleResizeOperation(e: MouseEvent) {
    if (!this.draggingItem || !this.originalEndDate) return;

    const deltaY = e.clientY - this.dragStartY;
    const fontSize = parseFloat(getComputedStyle(this).fontSize);
    const emPerHour = this.configuration.timeLine.emPerHour || 1;

    const deltaHours = (deltaY / fontSize) / emPerHour;
    const newEndTime = new Date(this.originalEndDate.getTime() + deltaHours * 3600000);

    newEndTime.setMinutes(Math.round(newEndTime.getMinutes() / 60) * 60);

    if (newEndTime > this.draggingItem.startDate) {
      const oldEndTime = this.draggingItem.endDate.getTime();
      this.draggingItem.endDate = newEndTime;

      if (isVesselCall(this.draggingItem) && this.draggingItem.voyage?.timing) {
        const timing = this.draggingItem.voyage.timing;
        const newEndTimeMs = newEndTime.getTime();

        if (timing.endOperation || timing.unberth || timing.fullaway) {
          
          const endOpDistance = timing.endOperation
            ? oldEndTime - timing.endOperation.getTime()
            : 0;
          const unberthDistance = timing.unberth
            ? oldEndTime - timing.unberth.getTime()
            : 0;
          const fullawayDistance = timing.fullaway
            ? oldEndTime - timing.fullaway.getTime()
            : 0;

          const needsAdjustment =
            (timing.endOperation && timing.endOperation.getTime() > newEndTimeMs) ||
            (timing.unberth && timing.unberth.getTime() > newEndTimeMs) ||
            (timing.fullaway && timing.fullaway.getTime() > newEndTimeMs);

          if (needsAdjustment) {
            
            if (timing.endOperation && timing.endOperation.getTime() > newEndTimeMs) {
              timing.endOperation = new Date(newEndTimeMs - endOpDistance);
            }

            if (timing.unberth && timing.unberth.getTime() > newEndTimeMs) {
              timing.unberth = new Date(newEndTimeMs - unberthDistance);
            }

            if (timing.fullaway && timing.fullaway.getTime() > newEndTimeMs) {
              timing.fullaway = new Date(newEndTimeMs - fullawayDistance);
            }
          }
        }
      }

      this.requestUpdate();
    }
  };

  private handleMouseUp = () => {
    if (this.draggingItem) {
      
      this.dispatchEvent(
        new CustomEvent('schedule-update', {
          detail: {
            item: this.draggingItem,
            type: this.dragType,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    this.draggingItem = null;
    this.dragType = null;
  };

  render() {
    if (!this.configuration) {
      return html`<div>No configuration provided</div>`;
    }

    return html`
      <div class="schedule-container" @scroll=${this.handleScroll}>
        <div class="schedule-grid">
          <corner-box
            .startDate=${this.configuration.timeLine.startDate}
            .endDate=${this.configuration.timeLine.endDate}
            .dateLocale=${this.configuration.timeLine.dateLocale}
            .config=${this.configuration.cornerBox}
          ></corner-box>

          <timeline-panel
            .config=${this.configuration.timeLine}
            .timelineDuration=${this.timelineDuration}
          ></timeline-panel>

          <quay-panel .config=${this.configuration.quay}></quay-panel>

          ${this.renderScheduleArea()}
        </div>
      </div>
    `;
  }

  public scrollToDate(target: Date) {
    const container = this.shadowRoot?.querySelector('.schedule-container') as HTMLElement;
    if (!container) return;

    if (
      target.getTime() >= this.configuration.timeLine.startDate.getTime() &&
      target.getTime() <= this.configuration.timeLine.endDate.getTime()
    ) {
      const hours = hourDifference(this.configuration.timeLine.startDate, target);
      const emPerHour = this.configuration.timeLine.emPerHour || 1;
      const fontSize = parseFloat(getComputedStyle(this).fontSize);
      const scrollTop = hours * emPerHour * fontSize;

      container.scrollTop = scrollTop;
    } else {
      throw new Error('Date must be within the timeline period');
    }
  }

  public getNearestBollardId(positionX: number): string | null {
    const container = this.shadowRoot?.querySelector('.schedule-container') as HTMLElement;
    if (!container) return null;

    const fontSize = parseFloat(getComputedStyle(this).fontSize);
    const emPerMeter = this.configuration.quay.emPerMeter;
    const positionInMeters = (positionX / fontSize) / emPerMeter;

    let nearestId: string | null = null;
    let minDistance = Infinity;

    this.bollardPositions.forEach((bollardPos, bollardId) => {
      const distance = Math.abs(bollardPos - positionInMeters);
      if (distance < minDistance) {
        minDistance = distance;
        nearestId = bollardId;
      }
    });

    return nearestId;
  }

  public getNearestTime(positionY: number): Date | null {
    const fontSize = parseFloat(getComputedStyle(this).fontSize);
    const emPerHour = this.configuration.timeLine.emPerHour || 1;
    const hours = (positionY / fontSize) / emPerHour;

    const time = new Date(this.configuration.timeLine.startDate.getTime());
    time.setHours(time.getHours() + hours);

    return time;
  }

  public setZoom(zoom: number) {
    zoom = Math.min(3, Math.max(0.1, zoom));
    const baseFontSize = 14;
    this.style.fontSize = `${baseFontSize * zoom}px`;
  }

  public getZoom(): number {
    const currentFontSize = parseFloat(getComputedStyle(this).fontSize);
    const baseFontSize = 14;
    return currentFontSize / baseFontSize;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'berthing-schedule': BerthingSchedule;
  }
}
