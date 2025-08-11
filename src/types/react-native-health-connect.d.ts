declare module 'react-native-health-connect' {
  // Core functions
  export function initialize(): Promise<boolean>;
  export function isAvailable(): Promise<boolean>;

  // Permission types
  export interface Permission {
    accessType: 'read' | 'write';
    recordType: string;
  }

  export interface PermissionResult {
    granted: string[];
    declined: string[];
  }

  export function requestPermission(
    permissions: Permission[],
  ): Promise<PermissionResult>;
  export function getGrantedPermissions(): Promise<(string | Permission)[]>;

  // Record reading
  export interface TimeRangeFilter {
    operator: 'between';
    startTime: string;
    endTime: string;
  }

  export interface ReadRecordsOptions {
    timeRangeFilter: TimeRangeFilter;
  }

  export function readRecords(
    recordType: string,
    options: ReadRecordsOptions,
  ): Promise<any[]>;

  // Record type constants
  export const Steps: string;
  export const HeartRate: string;
  export const ActiveCaloriesBurned: string;
  export const SleepSession: string;
}
