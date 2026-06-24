import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TypeScreen() {
  // On stocke le label du type choisi (ex: 'Mensuel')
  const [typeChoisi, setTypeChoisi] = useState<string>('');

  const options = [
    { label: 'Hebdomadaire', jours: 7 },
    { label: 'Mensuel', jours: 30 },
    { label: 'Annuel', jours: 365 },
  ];

  // Au démarrage, on charge le type qui avait été sauvegardé
  useEffect(() => {
    chargerTypeSauvegarde();
  }, []);

  const chargerTypeSauvegarde = async () => {
    try {
      const typeSauve = await AsyncStorage.getItem('typeLentilles');
      if (typeSauve !== null) {
        setTypeChoisi(typeSauve);
      }
    } catch (e) {
      // Erreur de lecture
    }
  };

  const enregistrerChoix = async (label: string) => {
    try {
      setTypeChoisi(label); // Met à jour l'interface
      await AsyncStorage.setItem('typeLentilles', label); // Sauvegarde en mémoire
      Alert.alert("Configuration", `Fréquence configurée sur : ${label}`);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer le choix");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma Fréquence de Port</Text>
      <Text style={styles.subtitle}>Choisissez votre type de lentilles pour configurer les futurs rappels :</Text>
     
      {options.map((item) => {
        // En Python/C, on ferait un "if". Ici on vérifie si c'est l'option active
        const estSelectionne = item.label === typeChoisi;

        return (
          <TouchableOpacity
            key={item.label}
            // Si le bouton est sélectionné, on lui applique le style "buttonActive"
            style={[styles.button, estSelectionne ? styles.buttonActive : null]}
            onPress={() => enregistrerChoix(item.label)}
          >
            <Text style={[styles.buttonText, estSelectionne ? styles.buttonTextActive : null]}>
              {item.label} {estSelectionne ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#2d3436' },
  subtitle: { fontSize: 16, color: '#636e72', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  button: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginVertical: 8, width: '80%', borderWidth: 2, borderColor: '#b2bec3' },
  // Style quand le bouton est sélectionné (Vert/Bleu moderne)
  buttonActive: { backgroundColor: '#00b894', borderColor: '#00b894' },
  buttonText: { color: '#2d3436', textAlign: 'center', fontSize: 18, fontWeight: '600' },
  buttonTextActive: { color: '#fff' }
});