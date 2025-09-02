export interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
}

export interface WinRateCircleProps {
  winRate: number;
}