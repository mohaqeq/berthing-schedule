

export type VesselType =
  | 'ContainerShip'
  | 'GeneralCargo'
  | 'BulkCargo'
  | 'OilTanker'
  | 'GasTanker'
  | 'ChemicalTanker'
  | 'Ro-Ro';

export type DateFormat = 'Weekday' | 'DayMonth' | 'Full';

export type VoyageActiveTime =
  | 'Anchorage'
  | 'Berth'
  | 'StartOperation'
  | 'EndOperation'
  | 'Unberth'
  | 'Fullaway';

export type VesselSide = 'Port' | 'Starboard';

export type BorderStyle = 'solid' | 'dashed' | 'dotted';

export interface StyleConfig {
  backgroundColor?: string;
  foregroundColor?: string;
  borderColor?: string;
  borderThickness?: number;
  textForegroundColor?: string;
  textBackgroundColor?: string;
}

export interface Bollard extends StyleConfig {
  id: string;
  name: string;
  distance: number;
}

export interface Berth extends StyleConfig {
  id: string;
  name: string;
  length: number;
  bollards: Bollard[];
  connected?: boolean;
}

export interface QuayConfig extends StyleConfig {
  emPerMeter: number;
  bollardGridColor?: string;
  berthEndColor?: string;
  showTitle?: boolean;
  showDistance?: boolean;
  berths: Berth[];
}

export interface TimelineConfig extends StyleConfig {
  startDate: Date;
  endDate: Date;
  emPerHour: number;
  timeGridColor?: string;
  startOfDay?: StyleConfig;
  hour?: StyleConfig;
  dateLocale?: string;
  dateFormat?: DateFormat;
}

export interface CornerBoxConfig extends StyleConfig {}

export interface BerthScheduleConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  zoom?: number;
  timeLine: TimelineConfig;
  quay: QuayConfig;
  cornerBox?: CornerBoxConfig;
}

export interface Vessel extends StyleConfig {
  id: string;
  name: string;
  LOA: number;
  draft: number;
  nationality: string;
  vesselType: VesselType;
}

export interface VoyageTiming {
  anchorage?: Date;
  berth?: Date;
  startOperation?: Date;
  endOperation?: Date;
  unberth?: Date;
  fullaway?: Date;
  activeTime?: VoyageActiveTime;
}

export interface Voyage extends StyleConfig {
  voyageNoIn?: string;
  voyageNoOut?: string;
  side?: VesselSide;
  shippingLine?: string;
  operations?: string;
  marginRight?: number;
  marginLeft?: number;
  timing?: VoyageTiming;
}

export interface PortCall extends StyleConfig {
  id: string;
  name: string;
  startBollardId: string;
  endBollardId: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  borderStyle?: BorderStyle;
  zIndex?: number;
  hideStartTime?: boolean;
  hideEndTime?: boolean;
  hideBollards?: boolean;
  hideDescription?: boolean;
  hideMenu?: boolean;
  moveLocked?: boolean;
  operationTimeLocked?: boolean;
  hasError?: boolean;
}

export interface VesselCall extends PortCall {
  vessel: Vessel;
  voyage: Voyage;
  hideVoyage?: boolean;
  hideShip?: boolean;
  hideShipSpec?: boolean;
  hideFlag?: boolean;
  hideShipName?: boolean;
}

export interface NonWorkingCall extends PortCall {
  reason: 'PortPlan' | 'Maintenance' | 'NonWorking';
  image?: string;
  hideImage?: boolean;
}

export type ScheduleItem = VesselCall | NonWorkingCall;

export interface VesselClickEvent {
  vessel: ScheduleItem;
  x: number;
  y: number;
}

export interface ScrollEvent {
  scrollLeft: number;
  scrollTop: number;
  visibleStartTime: Date;
  visibleEndTime: Date;
}

export function isVesselCall(item: ScheduleItem): item is VesselCall {
  return 'vessel' in item;
}

export function isNonWorkingCall(item: ScheduleItem): item is NonWorkingCall {
  return 'reason' in item;
}
