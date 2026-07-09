import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TypeScreen() {
  const headerHeight = useHeaderHeight(); 
  // 🌟 typeChoisi va maintenant stocker l'ID secret (ex: 'mensuel') et non plus le texte traduit
  const [typeChoisi, setTypeChoisi] = useState<string>('');
  const { i18n } = useTranslation(); 

  // 🌟 1. On sépare l'ID (pour la mémoire) du LABEL (pour l'affichage)
  const options = [
    { id: 'hebdomadaire', label: i18n.t('Hebdomadaire_type'), jours: 7 },
    { id: 'bimensuel', label: i18n.t('Bimensuel_type'), jours: 15 },
    { id: 'mensuel', label: i18n.t('Mensuel_type'), jours: 30 },
    { id: 'annuel', label: i18n.t('Annuel_type'), jours: 365 },
  ];

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

  // 🌟 2. La fonction prend "id" pour sauvegarder, et "label" pour afficher le pop-up
  const enregistrerChoix = async (id: string, label: string) => {
    try {
      setTypeChoisi(id); // Met à jour l'interface avec l'ID
      await AsyncStorage.setItem('typeLentilles', id); // Sauvegarde l'ID en mémoire
      
      Alert.alert(
        i18n.t('titreConfiguration'), 
        i18n.t('frequenceConfiguree', { type: label }) // On affiche le label traduit !
      );
    } catch (e) {
      Alert.alert(i18n.t('error'), i18n.t('impossibleEnregistrerChoix'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 20 }]}> 
      <Text style={styles.title}>{i18n.t('titreType')}</Text>
      <Text style={styles.subtitle}>{i18n.t('legendeType')}</Text>
      
      {options.map((item) => {
        // 🌟 3. On compare avec item.id (le code secret)
        const estSelectionne = item.id === typeChoisi;

        return (
          <TouchableOpacity
            key={item.id} // On utilise l'id comme clé unique
            style={[styles.button, estSelectionne ? styles.buttonActive : null]}
            onPress={() => enregistrerChoix(item.id, item.label)} // On envoie les deux infos
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
  container: { flex: 1, backgroundColor: 'transparent', padding: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2d3436', marginBottom: 30 },
  subtitle: { fontSize: 16, color: '#000', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  button: { backgroundColor: 'rgba(255, 255, 255, 0.80)', padding: 18, borderRadius: 12, marginVertical: 8, width: '80%', borderWidth: 2, borderColor: '#b2bec3' },
  buttonActive: { backgroundColor: '#00c7f4af', borderColor: '#0984e3' },
  buttonText: { color: '#2d3436', textAlign: 'center', fontSize: 18, fontWeight: '600' },
  buttonTextActive: { color: '#fff' }
});