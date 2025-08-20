/**
 * Progress Indicator Component
 * 
 * Shows the current progress through a multi-step process.
 * Displays step numbers and completion status.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ProgressIndicatorProps {
  /** Current step (0-based index) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Labels for each step (optional) */
  stepLabels?: string[];
  /** Custom container style */
  style?: ViewStyle;
  /** Show step numbers */
  showNumbers?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  style,
  showNumbers = true,
}) => {
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
      
      {/* Step Indicators */}
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleCompleted,
                index === currentStep && styles.stepCircleCurrent,
              ]}
            >
              {showNumbers && (
                <Text
                  style={[
                    styles.stepNumber,
                    index <= currentStep && styles.stepNumberCompleted,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            
            {stepLabels && stepLabels[index] && (
              <Text
                style={[
                  styles.stepLabel,
                  index <= currentStep && styles.stepLabelCompleted,
                ]}
                numberOfLines={2}
              >
                {stepLabels[index]}
              </Text>
            )}
          </View>
        ))}
      </View>
      
      {/* Progress Text */}
      <Text style={styles.progressText}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FE9F4D',
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: '#FE9F4D',
  },
  stepCircleCurrent: {
    backgroundColor: '#FE9F4D',
    borderWidth: 3,
    borderColor: '#FFE2CA',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C7278',
    fontFamily: 'Inter',
  },
  stepNumberCompleted: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#6C7278',
    textAlign: 'center',
    fontFamily: 'Inter',
    maxWidth: 80,
  },
  stepLabelCompleted: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6C7278',
    fontFamily: 'Inter',
  },
});

export default ProgressIndicator;