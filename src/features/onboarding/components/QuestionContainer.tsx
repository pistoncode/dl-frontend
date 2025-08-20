import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Alert,
} from 'react-native';

interface QuestionContainerProps {
  question: string;
  helpText?: string;
  contextText?: string;
  tooltipText?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({
  question,
  helpText,
  contextText,
  tooltipText,
  children,
  containerStyle,
}) => {
  const showTooltip = () => {
    if (tooltipText) {
      Alert.alert('Info', tooltipText);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.questionText}>{question}</Text>
      
      {contextText && (
        <View style={styles.contextContainer}>
          <Text style={styles.contextText}>{contextText}</Text>
          {tooltipText && (
            <TouchableOpacity style={styles.tooltipButton} onPress={showTooltip}>
              <Text style={styles.tooltipIcon}>ⓘ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {helpText && <Text style={styles.helpText}>{helpText}</Text>}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Roboto',
    lineHeight: 24,
    textAlign: 'center',
  },
  contextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  contextText: {
    fontSize: 12,
    color: '#FE9F4D',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tooltipButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FE9F4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipIcon: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#6C7278',
    marginBottom: 16,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  contentContainer: {
    gap: 12,
  },
});

export default QuestionContainer;