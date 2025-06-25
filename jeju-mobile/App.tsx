import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// 스크린 컴포넌트들
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import WriteScreen from './src/screens/WriteScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// 컨텍스트
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 인증이 필요한 탭 네비게이터
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Write') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: '검색' }}
      />
      <Tab.Screen 
        name="Write" 
        component={WriteScreen}
        options={{ title: '글쓰기' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
}

// 인증이 필요하지 않은 스택 네비게이터
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// 메인 네비게이터
function MainNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{ title: '게시글' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ title: '알림' }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
