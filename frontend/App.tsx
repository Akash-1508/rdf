import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/pages/dashboard/DashboardScreen';
import AnimalScreen from './src/pages/animals/AnimalScreen';
import MilkScreen from './src/pages/milk/MilkScreen';
import CharaScreen from './src/pages/chara/CharaScreen';
import ProfitLossScreen from './src/pages/reports/ProfitLossScreen';
import LoginScreen from './src/pages/auth/LoginScreen';
import SignupScreen from './src/pages/auth/SignupScreen';

type ScreenType = 
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup'
  | 'Signup';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Dashboard');

  const navigateToScreen = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={navigateToScreen} />;
      case 'Animals':
        return <AnimalScreen onNavigate={navigateToScreen} />;
      case 'Milk':
        return <MilkScreen onNavigate={navigateToScreen} />;
      case 'Chara':
        return <CharaScreen onNavigate={navigateToScreen} />;
      case 'Profit/Loss':
        return <ProfitLossScreen onNavigate={navigateToScreen} />;
      case 'Login/Signup':
        return <LoginScreen onNavigate={navigateToScreen} />;
      case 'Signup':
        return <SignupScreen onNavigate={navigateToScreen} />;
      default:
        return <DashboardScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

export default App;
