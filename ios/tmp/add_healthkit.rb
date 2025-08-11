require 'xcodeproj'

# Open the Xcode project
project_path = 'Grace.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main app target
target = project.targets.first

# Enable HealthKit
target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'Grace/Grace.entitlements'
end

# Add HealthKit capability if not already added
framework_build_phase = target.frameworks_build_phase
healthkit_framework = framework_build_phase.files.find { |f| f.display_name == 'HealthKit.framework' }

unless healthkit_framework
  puts "Adding HealthKit framework reference"
  framework_ref = project.frameworks_group.new_file('System/Library/Frameworks/HealthKit.framework')
  framework_build_phase.add_file_reference(framework_ref)
end

# Save the project
project.save

puts "HealthKit capability added successfully!" 
