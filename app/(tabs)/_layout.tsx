import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function TabLayout() {
  // Chargement de l'image locale (chemin relatif par rapport à app/(tabs)/_layout.tsx)
  const fondImage = require('../../assets/images/fond.jpg');

  return (
    <ImageBackground 
      source={fondImage} 
      style={styles.container} 
      resizeMode="cover"
    >
      <Tabs 
        screenOptions={{ 
          tabBarActiveTintColor: '#0984e3',
          
          // 1. Rendre les écrans transparents pour voir l'image en dessous
          sceneStyle: { backgroundColor: 'transparent' }, 
          
          // 2. Transparence du header (en haut)
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          
          // 3. Rendre la barre d'onglets (en bas) légèrement translucide
          tabBarStyle: { 
            backgroundColor: 'transparent', 
            borderTopWidth: 0,
            elevation: 0, // Retire l'ombre sur Android
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Type',
            tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="calendrier"
          options={{
            title: 'Calendrier',
            tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={28} color={color} />,
          }}
        />
      </Tabs>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Couleur de fallback au cas où l'image met du temps à charger
  },
});