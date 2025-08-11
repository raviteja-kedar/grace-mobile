import Foundation
import HealthKit

@objc(IOSHealthKitManager)
class IOSHealthKitManager: NSObject {
  
  // MARK: - Properties
  
  private let healthStore = HKHealthStore()
  private let stepsQuantityType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
  
  // MARK: - Health Data Availability
  
  @objc
  func isHealthDataAvailable(_ resolve: @escaping RCTPromiseResolveBlock, 
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    let isAvailable = HKHealthStore.isHealthDataAvailable()
    resolve(isAvailable)
  }
  
  // MARK: - Authorization
  
  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, 
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    // Define the types we want to read from HealthKit
    guard let stepCount = HKObjectType.quantityType(forIdentifier: .stepCount),
          let activeEnergy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned),
          let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate),
          let sleepAnalysis = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
      reject("error", "Required health data types not available", nil)
      return
    }
    
    // Define all types we'll need
    let typesToRead: Set<HKObjectType> = [
      stepCount,
      activeEnergy,
      heartRate,
      sleepAnalysis
    ]
    
    // Request permissions
    healthStore.requestAuthorization(toShare: nil, read: typesToRead) { (success, error) in
      if let error = error {
        reject("error", "Failed to request HealthKit authorization: \(error.localizedDescription)", error)
        return
      }
      
      resolve(success)
    }
  }
  
  // MARK: - Step Data
  
  @objc
  func getStepCount(_ startDateString: String,
                    endDateString: String,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    let dateFormatter = ISO8601DateFormatter()
    
    guard let startDate = dateFormatter.date(from: startDateString),
          let endDate = dateFormatter.date(from: endDateString) else {
      reject("error", "Invalid date format", nil)
      return
    }
    
    let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
    
    let query = HKStatisticsQuery(
      quantityType: stepsQuantityType,
      quantitySamplePredicate: predicate,
      options: .cumulativeSum
    ) { _, result, error in
      
      if let error = error {
        reject("error", "Failed to fetch step count: \(error.localizedDescription)", error)
        return
      }
      
      guard let result = result, let sum = result.sumQuantity() else {
        // No data available for this period
        resolve(0)
        return
      }
      
      let steps = sum.doubleValue(for: HKUnit.count())
      resolve(steps)
    }
    
    healthStore.execute(query)
  }
  
  @objc
  func getDailyStepCounts(_ startDateString: String,
                          endDateString: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    let dateFormatter = ISO8601DateFormatter()
    
    guard let startDate = dateFormatter.date(from: startDateString),
          let endDate = dateFormatter.date(from: endDateString) else {
      reject("error", "Invalid date format", nil)
      return
    }
    
    let calendar = Calendar.current
    let interval = DateComponents(day: 1)
    
    let query = HKStatisticsCollectionQuery(
      quantityType: stepsQuantityType,
      quantitySamplePredicate: HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate),
      options: .cumulativeSum,
      anchorDate: calendar.startOfDay(for: startDate),
      intervalComponents: interval
    )
    
    query.initialResultsHandler = { query, results, error in
      if let error = error {
        reject("error", "Failed to fetch daily step counts: \(error.localizedDescription)", error)
        return
      }
      
      guard let statsCollection = results else {
        resolve([])
        return
      }
      
      var dailySteps: [[String: Any]] = []
      
      statsCollection.enumerateStatistics(from: startDate, to: endDate) { statistics, stop in
        let dateString = dateFormatter.string(from: statistics.startDate)
        let steps = statistics.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
        
        dailySteps.append([
          "date": dateString,
          "steps": steps
        ])
      }
      
      resolve(dailySteps)
    }
    
    healthStore.execute(query)
  }
  
  // MARK: - Observer Queries
  
  @objc
  func observeStepCount(_ callback: @escaping RCTResponseSenderBlock) {
    // Create a query to get step count changes
    guard let stepCountType = HKObjectType.quantityType(forIdentifier: .stepCount) else {
      return
    }
    
    // We'll create an observer query
    let query = HKObserverQuery(sampleType: stepCountType, predicate: nil) { (query, completionHandler, error) in
      if let error = error {
        print("Error observing step count changes: \(error.localizedDescription)")
        return
      }
      
      // Notify JavaScript that a change occurred
      callback([["stepCountChanged": true]])
      
      // Call the completion handler to indicate we're done processing
      completionHandler()
    }
    
    // Start the observer query
    healthStore.execute(query)
    
    // Also enable background delivery if you need updates while app is in background
    healthStore.enableBackgroundDelivery(for: stepCountType, frequency: .immediate) { (success, error) in
      if let error = error {
        print("Failed to enable background delivery: \(error.localizedDescription)")
      }
    }
  }
  
  // MARK: - Active Energy
  
  @objc
  func getActiveEnergy(_ startDateString: String,
                       endDateString: String,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard let activeEnergyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else {
      reject("error", "Active energy type is not available", nil)
      return
    }
    
    let dateFormatter = ISO8601DateFormatter()
    
    guard let startDate = dateFormatter.date(from: startDateString),
          let endDate = dateFormatter.date(from: endDateString) else {
      reject("error", "Invalid date format", nil)
      return
    }
    
    let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
    
    let query = HKStatisticsQuery(
      quantityType: activeEnergyType,
      quantitySamplePredicate: predicate,
      options: .cumulativeSum
    ) { _, result, error in
      
      if let error = error {
        reject("error", "Failed to fetch active energy: \(error.localizedDescription)", error)
        return
      }
      
      guard let result = result, let sum = result.sumQuantity() else {
        resolve(0)
        return
      }
      
      let calories = sum.doubleValue(for: HKUnit.kilocalorie())
      resolve(calories)
    }
    
    healthStore.execute(query)
  }
  
  // MARK: - Heart Rate
  
  @objc
  func getHeartRateSamples(_ startDateString: String,
                          endDateString: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
      reject("error", "Heart rate type is not available", nil)
      return
    }
    
    let dateFormatter = ISO8601DateFormatter()
    
    guard let startDate = dateFormatter.date(from: startDateString),
          let endDate = dateFormatter.date(from: endDateString) else {
      reject("error", "Invalid date format", nil)
      return
    }
    
    let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
    let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
    
    let query = HKSampleQuery(
      sampleType: heartRateType,
      predicate: predicate,
      limit: HKObjectQueryNoLimit,
      sortDescriptors: [sortDescriptor]
    ) { _, samples, error in
      
      if let error = error {
        reject("error", "Failed to fetch heart rate: \(error.localizedDescription)", error)
        return
      }
      
      guard let samples = samples as? [HKQuantitySample] else {
        resolve([])
        return
      }
      
      let heartRateSamples = samples.map { sample -> [String: Any] in
        let heartRate = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: HKUnit.minute()))
        
        return [
          "date": dateFormatter.string(from: sample.startDate),
          "heartRate": heartRate
        ]
      }
      
      resolve(heartRateSamples)
    }
    
    healthStore.execute(query)
  }
  
  // MARK: - Sleep Analysis
  
  @objc
  func getSleepAnalysis(_ startDateString: String,
                        endDateString: String,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
      reject("error", "Sleep analysis is not available", nil)
      return
    }
    
    let dateFormatter = ISO8601DateFormatter()
    
    guard let startDate = dateFormatter.date(from: startDateString),
          let endDate = dateFormatter.date(from: endDateString) else {
      reject("error", "Invalid date format", nil)
      return
    }
    
    let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
    let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
    
    let query = HKSampleQuery(
      sampleType: sleepType,
      predicate: predicate,
      limit: HKObjectQueryNoLimit,
      sortDescriptors: [sortDescriptor]
    ) { _, samples, error in
      
      if let error = error {
        reject("error", "Failed to fetch sleep data: \(error.localizedDescription)", error)
        return
      }
      
      guard let samples = samples as? [HKCategorySample] else {
        resolve([])
        return
      }
      
      let sleepSamples = samples.map { sample -> [String: Any] in
        let sleepValue = sample.value
        
        // Sleep values are defined by Apple in HKCategoryValueSleepAnalysis
        // 0: In Bed, 1: Asleep
        let sleepStage: String
        switch sleepValue {
        case HKCategoryValueSleepAnalysis.inBed.rawValue:
          sleepStage = "inBed"
        case HKCategoryValueSleepAnalysis.asleep.rawValue:
          sleepStage = "asleep"
        default:
          sleepStage = "unknown"
        }
        
        return [
          "startDate": dateFormatter.string(from: sample.startDate),
          "endDate": dateFormatter.string(from: sample.endDate),
          "sleepStage": sleepStage,
          "durationInSeconds": sample.endDate.timeIntervalSince(sample.startDate)
        ]
      }
      
      resolve(sleepSamples)
    }
    
    healthStore.execute(query)
  }
} 
