#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(IOSHealthKitManager, NSObject)

RCT_EXTERN_METHOD(isHealthDataAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getStepCount:(NSString *)startDateString
                  endDateString:(NSString *)endDateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDailyStepCounts:(NSString *)startDateString
                  endDateString:(NSString *)endDateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(observeStepCount:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(getActiveEnergy:(NSString *)startDateString
                  endDateString:(NSString *)endDateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getHeartRateSamples:(NSString *)startDateString
                  endDateString:(NSString *)endDateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSleepAnalysis:(NSString *)startDateString
                  endDateString:(NSString *)endDateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 
