import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface BackgroundContextType {
  backgroundUri: string | null;
  setBackgroundUri: (uri: string | null) => void;
}

export const BackgroundContext = createContext<BackgroundContextType>({
  backgroundUri: null,
  setBackgroundUri: () => {},
});

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const savedUri = await AsyncStorage.getItem('fondEcran');
        if (savedUri) {
          setBackgroundUri(savedUri);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du fond d'écran", error);
      }
    };
    loadBackground();
  }, []);

  return (
    <BackgroundContext.Provider value={{ backgroundUri, setBackgroundUri }}>
      {children}
    </BackgroundContext.Provider>
  );
};