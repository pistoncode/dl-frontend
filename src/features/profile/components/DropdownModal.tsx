import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme/theme';
import type { DropdownModalProps } from '../types';

export const DropdownModal: React.FC<DropdownModalProps> = ({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title = "Select Option"
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownModalHeader}>
            <Text style={styles.dropdownModalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={theme.colors.neutral.gray[600]} />
            </Pressable>
          </View>
          
          <View style={styles.dropdownOptions}>
            {options.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.dropdownOption,
                  option === selectedValue && styles.dropdownOptionSelected
                ]}
                onPress={() => onSelect(option)}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  option === selectedValue && styles.dropdownOptionTextSelected
                ]}>
                  {option}
                </Text>
                {option === selectedValue && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.lg,
    width: '85%',
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[200],
  },
  dropdownModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral.gray[700],
  },
  modalCloseButton: {
    padding: 4,
  },
  dropdownOptions: {
    padding: theme.spacing.sm,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.base,
    marginVertical: 2,
  },
  dropdownOptionSelected: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  dropdownOptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  dropdownOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});