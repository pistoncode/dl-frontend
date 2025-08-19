import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Svg, Path } from 'react-native-svg';
import { PickleballQuestionnaire, Question, QuestionnaireResponse, SkillQuestions } from '../../services/PickleballQuestionnaire';

const ChevronDown = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 10L12 15L17 10"
      stroke="#6C7278"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Sport Icons with faded yellow-orange color
const PickleballIcon = () => (
  <Svg width="88" height="87" viewBox="0 0 88 87" fill="none">
    <Path
      d="M53.1795 9.92012C53.1807 12.7688 52.2281 15.5396 50.4672 17.8097C48.7063 20.0798 46.2337 21.7245 43.4268 22.4928C40.6199 23.2611 37.6329 23.1108 34.9216 22.0648C32.2103 21.0188 29.9236 19.1346 28.4106 16.6998C24.0073 21.3357 21.7495 25.7864 20.9177 29.9295C19.36 37.6822 22.9732 43.6301 26.808 47.905C25.1359 47.9453 23.5012 48.3965 22.0546 49.217C18.7208 45.0739 15.9716 39.5874 17.3655 32.6539C18.7062 27.0992 21.7281 22.0679 26.0372 18.2158C26.7223 17.5504 27.4375 16.9163 28.1826 16.3137C27.0189 14.2967 26.4279 12.0124 26.4707 9.69727C24.6936 10.9151 23.0395 12.2752 21.5086 13.7776C16.2917 18.5093 12.6496 24.6636 11.0545 31.4424C9.15954 40.8711 12.9686 48.1561 17.1728 53.3037L2.54338 66.3828L2.49199 66.433C1.55061 67.3358 0.842407 68.4445 0.425816 69.6675C0.00922591 70.8905 -0.103806 72.1928 0.0960471 73.4669C0.426855 75.7958 1.63446 77.9459 3.11186 79.6784L3.14719 79.7192L5.44678 82.2334L5.53029 82.3118C7.40593 84.0883 9.86612 85.4662 12.413 85.9841C14.9792 86.502 18.0432 86.1944 20.346 83.944L20.4231 83.8686L33.4819 69.1794C38.0586 72.6728 43.9522 75.7299 51.1047 75.7299C53.263 75.7247 55.4111 75.4397 57.4928 74.8824C62.5814 73.4269 67.2653 70.8608 71.1908 67.3777C72.5569 66.4361 73.863 65.4223 75.1091 64.3363C79.2636 60.7516 82.5684 56.3247 84.7932 51.3642C87.0181 46.4036 88.1094 41.0287 87.9913 35.6138C87.8932 30.4119 86.6355 25.2934 84.3058 20.6152C81.9761 15.937 78.6304 11.8116 74.5021 8.52652C67.9081 3.31981 59.6881 0.477417 51.2107 0.472534H51.2235C50.5105 0.472534 49.8007 0.491367 49.0941 0.529032C50.3467 1.70919 51.898 3.95966 52.6174 6.17875C53.1762 7.89563 53.1795 9.48697 53.1795 9.92012ZM67.2436 62.4248C63.9914 65.3894 60.083 67.5806 55.8227 68.8278C54.2907 69.239 52.7073 69.4524 51.1207 69.4556C45.8535 69.4556 41.2832 67.1109 37.5737 64.3081C38.3927 62.8956 38.823 61.3231 38.8584 59.7412C43.8654 64.104 50.8927 68.3602 59.3717 66.1034C61.8896 65.4317 64.5233 64.2516 67.2436 62.4248ZM24.5919 55.1681C25.9408 53.8498 28.1473 53.8498 29.493 55.1681L31.4361 57.067C32.785 58.4292 32.7625 60.6075 31.4361 61.9163L31.3654 61.9885L18.0464 76.9697C17.3117 75.0596 16.1711 73.3234 14.6998 71.8755C13.2522 70.4387 11.5066 69.3213 9.58027 68.5987L24.5437 55.2152L24.5919 55.1681Z"
      fill="#F4ECDC"
    />
  </Svg>
);

const TennisIcon = () => (
  <Svg width="88" height="87" viewBox="0 0 53 52" fill="none">
    <Path
      d="M0.702515 22.8526C1.40069 17.0866 4.0112 11.721 8.117 7.61294C12.2228 3.50488 17.587 0.891411 23.3525 0.190049C23.489 0.173751 23.6275 0.185783 23.7591 0.225394C23.8908 0.265004 24.0129 0.331341 24.1178 0.420261C24.2226 0.50918 24.308 0.618772 24.3686 0.742189C24.4293 0.865605 24.4638 1.00019 24.47 1.13755C24.5937 4.16775 24.0882 7.1907 22.9855 10.0158C21.8827 12.841 20.2067 15.407 18.0629 17.5522C15.9192 19.6973 13.3542 21.3751 10.5298 22.4797C7.70541 23.5843 4.68279 24.0917 1.65252 23.97C1.51495 23.9641 1.38008 23.9299 1.25637 23.8694C1.13266 23.8089 1.02277 23.7236 0.933581 23.6187C0.844395 23.5138 0.777837 23.3916 0.738076 23.2597C0.698315 23.1279 0.686208 22.9893 0.702515 22.8526ZM51.3375 28.0275C51.0575 28.0275 50.78 28.01 50.5 28.01C47.5387 28.0063 44.6072 28.6014 41.8818 29.7598C39.1564 30.9182 36.6935 32.6158 34.6411 34.7506C32.5888 36.8854 30.9894 39.4133 29.9392 42.1821C28.889 44.951 28.4097 47.9037 28.53 50.8625C28.5363 50.9999 28.5708 51.1345 28.6314 51.2579C28.692 51.3813 28.7774 51.4909 28.8823 51.5798C28.9871 51.6688 29.1092 51.7351 29.2409 51.7747C29.3726 51.8143 29.511 51.8263 29.6475 51.8101C35.4135 51.1086 40.7779 48.4947 44.8837 44.3862C48.9896 40.2776 51.5999 34.9115 52.2975 29.1451C52.3139 29.0075 52.3015 28.8681 52.2611 28.7356C52.2207 28.6031 52.1533 28.4804 52.063 28.3754C51.9728 28.2703 51.8617 28.1852 51.7368 28.1253C51.6119 28.0654 51.4759 28.0321 51.3375 28.0275ZM32.115 31.6151C34.5239 29.1933 37.3891 27.2733 40.5448 25.9662C43.7006 24.6591 47.0843 23.9908 50.5 24H51.2725C51.4159 24.0052 51.5587 23.9794 51.6912 23.9245C51.8238 23.8696 51.9429 23.7868 52.0406 23.6817C52.1383 23.5767 52.2123 23.4518 52.2575 23.3156C52.3027 23.1795 52.318 23.0352 52.3025 22.8925C51.6132 17.1055 48.998 11.7183 44.8772 7.59703C40.7564 3.4758 35.3695 0.859958 29.5825 0.170049C29.4399 0.154534 29.2956 0.16989 29.1594 0.215075C29.0233 0.26026 28.8984 0.334216 28.7934 0.431921C28.6883 0.529626 28.6055 0.648793 28.5506 0.781331C28.4956 0.913868 28.4699 1.05667 28.475 1.20005C28.5887 4.7454 27.9738 8.27637 26.6683 11.5746C25.3628 14.8727 23.3944 17.868 20.885 20.375C18.477 22.7986 15.6122 24.7205 12.4564 26.0293C9.30055 27.3381 5.91646 28.008 2.50002 28H1.72751C1.58414 27.9949 1.44133 28.0207 1.3088 28.0756C1.17626 28.1305 1.05709 28.2133 0.959387 28.3184C0.861682 28.4234 0.787726 28.5483 0.742541 28.6845C0.697356 28.8206 0.682 28.9649 0.697515 29.1075C1.38679 34.8946 4.00204 40.2818 8.12282 44.4031C12.2436 48.5243 17.6305 51.1401 23.4175 51.8301C23.5601 51.8456 23.7044 51.8302 23.8406 51.785C23.9768 51.7398 24.1016 51.6659 24.2067 51.5682C24.3117 51.4705 24.3945 51.3513 24.4495 51.2188C24.5044 51.0862 24.5302 50.9434 24.525 50.8C24.4099 47.253 25.0242 43.7202 26.3297 40.4202C27.6353 37.1202 29.6044 34.1233 32.115 31.6151Z"
      fill="#F4ECDC"
    />
  </Svg>
);

const PadelIcon = () => (
  <Svg width="88" height="87" viewBox="0 0 59 54" fill="none">
    <Path
      d="M47.1 53.6667L31.5667 38.2L29.7 40.0667C28.6778 41.0889 27.5115 41.8667 26.2013 42.4C24.8911 42.9334 23.5462 43.2 22.1667 43.2C20.7871 43.2 19.4315 42.9334 18.1 42.4C16.7684 41.8667 15.5907 41.0889 14.5667 40.0667L3.29999 28.7334C2.27777 27.7111 1.49999 26.5449 0.966656 25.2347C0.433323 23.9245 0.166656 22.5796 0.166656 21.2C0.166656 19.8205 0.433323 18.4765 0.966656 17.168C1.49999 15.8596 2.27777 14.6925 3.29999 13.6667L10.8333 6.13337C11.8555 5.11115 13.0227 4.33337 14.3347 3.80004C15.6467 3.26671 16.9907 3.00004 18.3667 3.00004C19.7427 3.00004 21.0875 3.26671 22.4013 3.80004C23.7151 4.33337 24.8813 5.11115 25.9 6.13337L37.2333 17.4C38.2555 18.4223 39.0333 19.6 39.5667 20.9334C40.1 22.2667 40.3667 23.6223 40.3667 25C40.3667 26.3778 40.1 27.7227 39.5667 29.0347C39.0333 30.3467 38.2555 31.5129 37.2333 32.5334L35.3667 34.4L50.8333 49.9334L47.1 53.6667ZM22.1667 37.8667C22.8333 37.8667 23.4893 37.7449 24.1347 37.5014C24.78 37.2578 25.3684 36.8685 25.9 36.3334L33.5 28.7334C34.0333 28.2445 34.4227 27.6667 34.668 27C34.9133 26.3334 35.0351 25.6667 35.0333 25C35.0315 24.3334 34.9098 23.6667 34.668 23C34.4262 22.3334 34.0369 21.7334 33.5 21.2L22.1667 9.93337C21.6778 9.40004 21.1 9.00004 20.4333 8.73337C19.7667 8.46671 19.1 8.33337 18.4333 8.33337C17.7667 8.33337 17.1 8.46671 16.4333 8.73337C15.7667 9.00004 15.1667 9.40004 14.6333 9.93337L7.09999 17.4667C6.56666 18 6.17821 18.5894 5.93466 19.2347C5.6911 19.88 5.56843 20.5352 5.56666 21.2C5.56488 21.8649 5.68755 22.5316 5.93466 23.2C6.18177 23.8685 6.57021 24.4685 7.09999 25L18.4333 36.3334C18.9222 36.8667 19.5 37.256 20.1667 37.5014C20.8333 37.7467 21.5 37.8685 22.1667 37.8667ZM11.3 24.6C11.8778 24.6 12.356 24.4116 12.7347 24.0347C13.1133 23.6578 13.3018 23.1796 13.3 22.6C13.2982 22.0205 13.1098 21.5431 12.7347 21.168C12.3595 20.7929 11.8813 20.6036 11.3 20.6C10.7187 20.5965 10.2413 20.7858 9.86799 21.168C9.49466 21.5503 9.30532 22.0276 9.29999 22.6C9.29466 23.1725 9.48399 23.6507 9.86799 24.0347C10.252 24.4187 10.7293 24.6072 11.3 24.6ZM15.5667 20.4C16.1444 20.4 16.6227 20.2116 17.0013 19.8347C17.38 19.4578 17.5684 18.9796 17.5667 18.4C17.5649 17.8205 17.3755 17.3432 16.9987 16.968C16.6218 16.5929 16.1444 16.4036 15.5667 16.4C14.9889 16.3965 14.5115 16.5858 14.1347 16.968C13.7578 17.3503 13.5684 17.8276 13.5667 18.4C13.5649 18.9725 13.7542 19.4507 14.1347 19.8347C14.5151 20.2187 14.9924 20.4072 15.5667 20.4ZM16.0333 29.3334C16.6111 29.3334 17.0893 29.144 17.468 28.7654C17.8467 28.3867 18.0351 27.9094 18.0333 27.3334C18.0315 26.7574 17.8422 26.28 17.4653 25.9014C17.0884 25.5227 16.6111 25.3334 16.0333 25.3334C15.4555 25.3334 14.9782 25.5227 14.6013 25.9014C14.2244 26.28 14.0351 26.7574 14.0333 27.3334C14.0315 27.9094 14.2209 28.3876 14.6013 28.768C14.9818 29.1485 15.4591 29.3369 16.0333 29.3334ZM19.7667 16.1334C20.3444 16.1334 20.8227 15.944 21.2013 15.5654C21.58 15.1867 21.7684 14.7094 21.7667 14.1334C21.7649 13.5574 21.5755 13.08 21.1987 12.7014C20.8218 12.3227 20.3444 12.1334 19.7667 12.1334C19.1889 12.1334 18.7115 12.3227 18.3347 12.7014C17.9578 13.08 17.7684 13.5574 17.7667 14.1334C17.7649 14.7094 17.9542 15.1876 18.3347 15.568C18.7151 15.9485 19.1924 16.1369 19.7667 16.1334ZM20.3 25.1334C20.8778 25.1334 21.3551 24.944 21.732 24.5654C22.1089 24.1867 22.2982 23.7094 22.3 23.1334C22.3018 22.5574 22.1124 22.08 21.732 21.7014C21.3515 21.3227 20.8742 21.1334 20.3 21.1334C19.7258 21.1334 19.2484 21.3227 18.868 21.7014C18.4875 22.08 18.2982 22.5574 18.3 23.1334C18.3018 23.7094 18.4911 24.1876 18.868 24.568C19.2449 24.9485 19.7222 25.1369 20.3 25.1334ZM20.7 34.0667C21.2778 34.0667 21.756 33.8774 22.1347 33.4987C22.5133 33.12 22.7018 32.6427 22.7 32.0667C22.6982 31.4907 22.5098 31.0134 22.1347 30.6347C21.7595 30.256 21.2813 30.0667 20.7 30.0667C20.1187 30.0667 19.6413 30.256 19.268 30.6347C18.8947 31.0134 18.7053 31.4907 18.7 32.0667C18.6947 32.6427 18.884 33.1209 19.268 33.5014C19.652 33.8818 20.1293 34.0703 20.7 34.0667ZM24.5 20.8667C25.0778 20.8667 25.556 20.6774 25.9347 20.2987C26.3133 19.92 26.5018 19.4427 26.5 18.8667C26.4982 18.2907 26.3089 17.8134 25.932 17.4347C25.5551 17.056 25.0778 16.8667 24.5 16.8667C23.9222 16.8667 23.4449 17.056 23.068 17.4347C22.6911 17.8134 22.5018 18.2907 22.5 18.8667C22.4982 19.4427 22.6875 19.9209 23.068 20.3014C23.4484 20.6818 23.9258 20.8703 24.5 20.8667ZM24.9667 29.8C25.5444 29.8 26.0227 29.6107 26.4013 29.232C26.78 28.8534 26.9684 28.376 26.9667 27.8C26.9649 27.224 26.7755 26.7467 26.3987 26.368C26.0218 25.9894 25.5444 25.8 24.9667 25.8C24.3889 25.8 23.9115 25.9894 23.5347 26.368C23.1578 26.7467 22.9684 27.224 22.9667 27.8C22.9649 28.376 23.1542 28.8543 23.5347 29.2347C23.9151 29.6152 24.3924 29.8036 24.9667 29.8ZM29.2333 25.5334C29.8111 25.5334 30.2893 25.3449 30.668 24.968C31.0467 24.5912 31.2351 24.1129 31.2333 23.5334C31.2315 22.9538 31.0422 22.4765 30.6653 22.1014C30.2884 21.7263 29.8111 21.5369 29.2333 21.5334C28.6555 21.5298 28.1782 21.7192 27.8013 22.1014C27.4244 22.4836 27.2351 22.9609 27.2333 23.5334C27.2315 24.1058 27.4209 24.584 27.8013 24.968C28.1818 25.352 28.6591 25.5405 29.2333 25.5334ZM49.5 19C46.9222 19 44.7222 18.0889 42.9 16.2667C41.0778 14.4445 40.1667 12.2445 40.1667 9.66671C40.1667 7.08893 41.0778 4.88893 42.9 3.06671C44.7222 1.24449 46.9222 0.333374 49.5 0.333374C52.0778 0.333374 54.2778 1.24449 56.1 3.06671C57.9222 4.88893 58.8333 7.08893 58.8333 9.66671C58.8333 12.2445 57.9222 14.4445 56.1 16.2667C54.2778 18.0889 52.0778 19 49.5 19ZM49.5 13.6667C50.6111 13.6667 51.556 13.2783 52.3347 12.5014C53.1133 11.7245 53.5018 10.7796 53.5 9.66671C53.4982 8.55382 53.1098 7.60982 52.3347 6.83471C51.5595 6.0596 50.6147 5.67026 49.5 5.66671C48.3853 5.66315 47.4413 6.05249 46.668 6.83471C45.8947 7.61693 45.5053 8.56093 45.5 9.66671C45.4947 10.7725 45.884 11.7174 46.668 12.5014C47.452 13.2854 48.396 13.6738 49.5 13.6667Z"
      fill="#F4ECDC"
    />
  </Svg>
);

const SkillAssessmentScreen = () => {
  const { sport, sportIndex } = useLocalSearchParams();
  const { data, updateData } = useOnboarding();
  const currentSportIndex = parseInt(sportIndex as string) || 0;
  const selectedSports = data.selectedSports || [];
  
  // For non-pickleball sports, keep the simple dropdown
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownRef = useRef(null);
  
  // For pickleball comprehensive questionnaire
  const [questionnaire] = useState(() => new PickleballQuestionnaire());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPickleballQuestionnaire, setIsPickleballQuestionnaire] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [skillResponses, setSkillResponses] = useState<SkillQuestions>({});

  // Initialize questionnaire based on sport
  useEffect(() => {
    if (sport === 'pickleball') {
      setIsPickleballQuestionnaire(true);
      // Load any existing responses for this sport
      const existingResponses = data.skillLevels?.[sport as string] ? 
        JSON.parse(data.skillLevels[sport as string]) : {};
      setResponses(existingResponses);
      
      // Get first set of questions
      const initialQuestions = questionnaire.getConditionalQuestions(existingResponses);
      setQuestions(initialQuestions);
      setCurrentQuestionIndex(0);
    } else {
      setIsPickleballQuestionnaire(false);
      // Load saved skill level for non-pickleball sports
      if (data.skillLevels && data.skillLevels[sport as string]) {
        setSelectedOption(data.skillLevels[sport as string]);
      } else {
        setSelectedOption(null);
      }
    }
  }, [sport, data.skillLevels]);

  const skillOptions = [
    'Never played before',
    'Less than 1 month',
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '1-2 years',
    '2-5 years',
    'More than 5 years',
  ];

  const handleConfirm = () => {
    if (isPickleballQuestionnaire) {
      // For pickleball, this shouldn't be called since we use the questionnaire flow
      return;
    }
    
    if (selectedOption) {
      // Update skill level for current sport (non-pickleball)
      const updatedSkillLevels = {
        ...data.skillLevels,
        [sport as string]: selectedOption
      };
      updateData({ skillLevels: updatedSkillLevels });
      proceedToNext();
    }
  };

  const measureDropdownPosition = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height - 8,
          width: width
        });
      });
    }
  };

  const getSportTitle = () => {
    return typeof sport === 'string' ? sport.charAt(0).toUpperCase() + sport.slice(1) : '';
  };

  const getSportIcon = () => {
    switch (sport) {
      case 'pickleball':
        return <PickleballIcon />;
      case 'tennis':
        return <TennisIcon />;
      case 'padel':
        return <PadelIcon />;
      default:
        return null;
    }
  };

  const openDropdown = () => {
    measureDropdownPosition();
    setDropdownOpen(true);
  };

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  // Pickleball questionnaire handlers
  const handleQuestionnaireResponse = (questionKey: string, answer: string | number) => {
    const newResponses = { ...responses, [questionKey]: answer };
    setResponses(newResponses);
    
    // Get next questions based on updated responses
    const nextQuestions = questionnaire.getConditionalQuestions(newResponses);
    setQuestions(nextQuestions);
    
    // Move to next question or finish
    if (nextQuestions.length === 0) {
      // Questionnaire complete, calculate rating
      completePickleballAssessment(newResponses);
    } else if (currentQuestionIndex < nextQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0); // Reset for new questions
    }
    
    // Clear text input for next question
    setTextInput('');
  };

  const handleSkillResponse = (skillKey: string, answer: string) => {
    const newSkillResponses = { ...skillResponses, [skillKey]: answer };
    setSkillResponses(newSkillResponses);
    
    // Check if all skills are answered
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.sub_questions) {
      const allSkillKeys = Object.keys(currentQuestion.sub_questions);
      const answeredKeys = Object.keys(newSkillResponses);
      
      if (allSkillKeys.every(key => answeredKeys.includes(key))) {
        // All skills answered, add to responses
        handleQuestionnaireResponse('skills', newSkillResponses);
        setSkillResponses({}); // Reset for next time
      }
    }
  };

  const completePickleballAssessment = (finalResponses: QuestionnaireResponse) => {
    try {
      const ratingResult = questionnaire.calculateInitialRating(finalResponses);
      
      // Store the complete responses and rating
      const skillData = {
        responses: finalResponses,
        rating: ratingResult,
        feedback: questionnaire.generateFeedback(ratingResult)
      };
      
      // Update context with skill data
      const updatedSkillLevels = {
        ...data.skillLevels,
        [sport as string]: JSON.stringify(skillData)
      };
      updateData({ skillLevels: updatedSkillLevels });
      
      // Show rating feedback
      Alert.alert(
        'Assessment Complete!',
        `Your estimated pickleball rating:\nSingles: ${ratingResult.singles_rating}\nDoubles: ${ratingResult.doubles_rating}\n\nSkill Level: ${getSkillLevelFromRating(ratingResult.singles_rating)}`,
        [{ text: 'Continue', onPress: proceedToNext }]
      );
    } catch (error) {
      Alert.alert('Error', 'There was an issue calculating your rating. Using default assessment.');
      proceedToNext();
    }
  };

  const getSkillLevelFromRating = (rating: number): string => {
    if (rating < 1200) return 'Beginner';
    if (rating < 1500) return 'Advanced Beginner';
    if (rating < 1800) return 'Lower Intermediate';
    if (rating < 2200) return 'Intermediate';
    if (rating < 2800) return 'Upper Intermediate';
    if (rating < 3500) return 'Advanced';
    if (rating < 4500) return 'Expert';
    return 'Professional';
  };

  const proceedToNext = () => {
    // Check if there are more sports to assess
    if (currentSportIndex < selectedSports.length - 1) {
      // Navigate to skill assessment for next sport
      const nextSport = selectedSports[currentSportIndex + 1];
      router.push(`/onboarding/skill-assessment?sport=${nextSport}&sportIndex=${currentSportIndex + 1}`);
    } else {
      // All sports assessed, go to profile picture
      router.push('/onboarding/profile-picture');
    }
  };

  const renderPickleballQuestion = (question: Question) => {
    switch (question.type) {
      case 'single_choice':
        return (
          <View>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.help_text && (
              <Text style={styles.helpText}>{question.help_text}</Text>
            )}
            <View style={styles.optionsContainer}>
              {question.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    responses[question.key] === option && styles.optionButtonSelected
                  ]}
                  onPress={() => handleQuestionnaireResponse(question.key, option)}
                >
                  <Text style={[
                    styles.optionText,
                    responses[question.key] === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'number':
        return (
          <View>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.help_text && (
              <Text style={styles.helpText}>{question.help_text}</Text>
            )}
            <TextInput
              style={styles.numberInput}
              value={textInput}
              onChangeText={setTextInput}
              placeholder={`Enter value ${question.min_value ? `(${question.min_value}-${question.max_value})` : ''}`}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.submitButton, !textInput.trim() && question.optional && styles.skipButton]}
              onPress={() => {
                if (textInput.trim()) {
                  const numValue = parseFloat(textInput);
                  if (!isNaN(numValue) && 
                      (!question.min_value || numValue >= question.min_value) &&
                      (!question.max_value || numValue <= question.max_value)) {
                    handleQuestionnaireResponse(question.key, numValue);
                  } else {
                    Alert.alert('Invalid Input', 
                      `Please enter a valid number ${question.min_value ? `between ${question.min_value} and ${question.max_value}` : ''}`);
                  }
                } else if (question.optional) {
                  handleQuestionnaireResponse(question.key, '');
                }
              }}
            >
              <Text style={styles.submitButtonText}>
                {textInput.trim() ? 'Submit' : 'Skip'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'skill_matrix':
        return (
          <View>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.sub_questions && Object.entries(question.sub_questions).map(([skillKey, skillData]) => (
              <View key={skillKey} style={styles.skillQuestionContainer}>
                <Text style={styles.skillQuestionText}>{skillData.question}</Text>
                <View style={styles.skillOptionsContainer}>
                  {skillData.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.skillOptionButton,
                        skillResponses[skillKey] === option && styles.skillOptionButtonSelected
                      ]}
                      onPress={() => handleSkillResponse(skillKey, option)}
                    >
                      <Text style={[
                        styles.skillOptionText,
                        skillResponses[skillKey] === option && styles.skillOptionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DEUCE</Text>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.sportIconContainer}>
            {getSportIcon()}
          </View>
          <Text style={styles.sportTitle}>{getSportTitle()}</Text>
          {selectedSports.length > 1 && (
            <Text style={styles.progressText}>
              {currentSportIndex + 1} of {selectedSports.length}
            </Text>
          )}
          <Text style={styles.title}>Let's assess your skills</Text>
        </View>
        

        {/* Render different content based on sport type */}
        {isPickleballQuestionnaire ? (
          <View style={styles.questionnaireContainer}>
            {questions.length > 0 && currentQuestionIndex < questions.length && (
              <View style={styles.currentQuestionContainer}>
                {renderPickleballQuestion(questions[currentQuestionIndex])}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.dropdownContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>How long have you been playing?</Text>
              <TouchableOpacity
                ref={dropdownRef}
                style={styles.dropdown}
                onPress={openDropdown}
              >
                <Text style={[
                  styles.dropdownText,
                  selectedOption && styles.dropdownTextSelected
                ]}>
                  {selectedOption || 'Select an option'}
                </Text>
                <ChevronDown />
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
      
      {/* Confirm Button - only show for non-pickleball sports */}
      {!isPickleballQuestionnaire && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              !selectedOption && styles.buttonDisabled,
            ]}
            disabled={!selectedOption}
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View 
            style={[
              styles.modalDropdown,
              {
                top: dropdownPosition.y,
                left: dropdownPosition.x,
                width: dropdownPosition.width,
              }
            ]}
          >
            <FlatList
              data={skillOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              style={styles.modalDropdownList}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    index === skillOptions.length - 1 && styles.dropdownItemLast,
                  ]}
                  onPress={() => selectOption(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 71,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FE9F4D',
  },
  headerContainer: {
    paddingHorizontal: 37,
    marginBottom: 20,
  },
  sportIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sportTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 40,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FE9F4D',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  questionContainer: {
    paddingHorizontal: 37,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C7278',
    lineHeight: 20,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  dropdownContainer: {
    paddingHorizontal: 37,
    marginBottom: 30,
  },
  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E4E5E7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.24,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: '#6C7278',
    fontWeight: '500',
  },
  dropdownTextSelected: {
    color: '#1A1C1E',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C7278',
    marginBottom: 8,
    letterSpacing: -0.02,
    fontFamily: 'Roboto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalDropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalDropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F3',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1A1C1E',
    fontWeight: '500',
  },
  questionsContainer: {
    paddingHorizontal: 37,
  },
  questionnaireContainer: {
    paddingHorizontal: 37,
    marginBottom: 30,
  },
  currentQuestionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
    fontFamily: 'Roboto',
    lineHeight: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#6C7278',
    marginBottom: 15,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: '#FE9F4D',
    backgroundColor: '#FFF7F0',
  },
  optionText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Roboto',
  },
  optionTextSelected: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
  numberInput: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  submitButton: {
    backgroundColor: '#FE9F4D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#6C7278',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  skillQuestionContainer: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  skillQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  skillOptionsContainer: {
    gap: 8,
  },
  skillOptionButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  skillOptionButtonSelected: {
    borderColor: '#FE9F4D',
    backgroundColor: '#FFF7F0',
  },
  skillOptionText: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'Roboto',
  },
  skillOptionTextSelected: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
  button: {
    height: 40,
    backgroundColor: '#FE9F4D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTennis: {
    backgroundColor: '#374F35',
    borderWidth: 1,
    borderColor: '#5D825A',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default SkillAssessmentScreen;