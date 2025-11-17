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
import { authService } from './src/services/auth/authService';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Login/Signup');

  const navigateToScreen = (screen: ScreenType) => {
    // Protected screens - only accessible after login
    const protectedScreens: ScreenType[] = ['Dashboard', 'Animals', 'Milk', 'Chara', 'Profit/Loss'];
    
    // If trying to access protected screen without login, redirect to login
    if (protectedScreens.includes(screen) && !isAuthenticated) {
      setCurrentScreen('Login/Signup');
      return;
    }
    
    // Allow navigation to login/signup screens always
    if (screen === 'Login/Signup' || screen === 'Signup') {
      setCurrentScreen(screen);
      return;
    }
    
    setCurrentScreen(screen);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('Dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setCurrentScreen('Login/Signup');
  };

  const renderScreen = () => {
    // If not authenticated, only show login/signup screens
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'Signup':
          return <SignupScreen onNavigate={navigateToScreen} />;
        case 'Login/Signup':
        default:
          return <LoginScreen onNavigate={navigateToScreen} onLoginSuccess={handleLoginSuccess} />;
      }
    }

    // If authenticated, show all screens
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
      case 'Animals':
        return <AnimalScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
      case 'Milk':
        return <MilkScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
      case 'Chara':
        return <CharaScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
      case 'Profit/Loss':
        return <ProfitLossScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
      case 'Login/Signup':
        return <LoginScreen onNavigate={navigateToScreen} onLoginSuccess={handleLoginSuccess} />;
      case 'Signup':
        return <SignupScreen onNavigate={navigateToScreen} />;
      default:
        return <DashboardScreen onNavigate={navigateToScreen} onLogout={handleLogout} />;
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
