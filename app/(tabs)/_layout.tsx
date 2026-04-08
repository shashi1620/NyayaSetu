import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tabNames = {
  en: { home: 'Home', chat: 'AI Lawyer', profile: 'Profile', centers: 'Legal Aid', scanner: 'Scanner' },
  hi: { home: 'होम', chat: 'AI वकील', profile: 'प्रोफाइल', centers: 'सहायता', scanner: 'स्कैनर' },
  ta: { home: 'முகப்பு', chat: 'AI வழக்கறிஞர்', profile: 'சுயவிவரம்', centers: 'சட்ட உதவி', scanner: 'ஸ்கேனர்' },
  te: { home: 'హోమ్', chat: 'AI న్యాయవాది', profile: 'ప్రొఫైల్', centers: 'న్యాయ సహాయం', scanner: 'స్కానర్' },
  kn: { home: 'ಮುಖಪುಟ', chat: 'AI ವಕೀಲರು', profile: 'ಪ್ರೊಫೈಲ್', centers: 'ಕಾನೂನು ಸಹಾಯ', scanner: 'ಸ್ಕ್ಯಾನರ್' },
};

export default function TabLayout() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('selectedLanguage').then(val => {
      if (val) setLang(val);
    });
  }, []);

  // @ts-ignore
  const t = tabNames[lang] || tabNames.en;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
          elevation: 10,
          shadowColor: '#1E1B4B',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#3730A3',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t.chat,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🤖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t.scanner,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📄</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.centers,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}