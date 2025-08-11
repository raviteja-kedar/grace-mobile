/**
 * HealthService.ts
 * Service for interacting with health data on iOS and Android
 *
 * This is a legacy service that will be deprecated in favor of HealthAdapter.
 * Please use HealthAdapter for new code.
 */

/**
 * @deprecated Use HealthAdapter instead.
 */
class HealthService {
  /**
   * @deprecated Use HealthAdapter.isAvailable() instead.
   */
  static isHealthDataAvailable(): Promise<boolean> {
    console.warn(
      'HealthService is deprecated. Please use HealthAdapter instead.',
    );
    return Promise.resolve(false);
  }

  /**
   * @deprecated Use HealthAdapter.requestAuthorization() instead.
   */
  static checkHealthPermissions(): Promise<boolean> {
    console.warn(
      'HealthService is deprecated. Please use HealthAdapter instead.',
    );
    return Promise.resolve(false);
  }

  /**
   * @deprecated Use HealthAdapter.requestAuthorization() instead.
   */
  static requestHealthPermissions(): Promise<boolean> {
    console.warn(
      'HealthService is deprecated. Please use HealthAdapter instead.',
    );
    return Promise.resolve(false);
  }

  /**
   * @deprecated Use HealthAdapter.getStepCount() instead.
   */
  static fetchStepCount(_startDate: Date, _endDate: Date): Promise<number> {
    console.warn(
      'HealthService is deprecated. Please use HealthAdapter instead.',
    );
    return Promise.resolve(0);
  }
}

export default HealthService;
