import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from 'expo-router'; // 🌟 Pour rafraîchir l'écran automatiquement
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { planifierRappelDepuisMemoire } from '../../utils/dateHelper';

export default function CalendrierScreen() {
const headerHeight = useHeaderHeight(); // 🌟 Calcule la taille exacte du header
  const [joursCoches, setJoursCoches] = useState<any>({});

  // 1. RECHARGE LA MÉMOIRE À CHAQUE FOIS QU'ON ASSICHE CET ONGLET
  useFocusEffect(
    useCallback(() => {
      chargerHistorique();
    }, [])
  );

  const chargerHistorique = async () => {
    try {
      const donnees = await AsyncStorage.getItem('historiqueLentilles');
      const historique = donnees ? JSON.parse(donnees) : [];
     
      // On transforme le tableau ['2026-06-22'] en objet lisible par le composant Calendar
      let structureCalendrier: any = {};
      historique.forEach((date: string) => {
        structureCalendrier[date] = {
          selected: true,
          selectedColor: '#00c7f4af', // Un joli vert pour dire "changé !"
        };
      });
     
      setJoursCoches(structureCalendrier);
    } catch (e) {
      console.log("Erreur de chargement du calendrier", e);
    }
  };

  // 2. LOGIQUE QUAND ON CLIQUE SUR UN JOUR DU CALENDRIER
  const gererClicJour = async (dateCliquee: any) => {
    const dateStr = dateCliquee.dateString; // Récupère la string "AAAA-MM-JJ"

    Alert.alert(
      "📅 Modification",
      `Voulez-vous marquer le ${dateStr} comme jour de changement de lentilles ?`,
      [
        {
          text: "Oui, enregistrer",
          onPress: async () => {
            try {
              // A. Récupération de l'ancien historique
              const donnees = await AsyncStorage.getItem('historiqueLentilles');
              let historique = donnees ? JSON.parse(donnees) : [];

              // B. Ajout de la date si elle n'existe pas
              if (!historique.includes(dateStr)) {
                historique.push(dateStr);
                await AsyncStorage.setItem('historiqueLentilles', JSON.stringify(historique));
              }

              // C. On recalcule le prochain rappel à 20h30 basé sur cette date !
              await planifierRappelDepuisMemoire();

              // D. On recharge le visuel du calendrier
              chargerHistorique();
            } catch (e) {
              Alert.alert("Erreur", "Impossible de sauvegarder.");
            }
          }
        },
        {
          text: "Supprimer ce jour",
          style: "destructive",
          onPress: async () => {
            try {
              const donnees = await AsyncStorage.getItem('historiqueLentilles');
              let historique = donnees ? JSON.parse(donnees) : [];
             
              // On filtre pour enlever la date
              historique = historique.filter((d: string) => d !== dateStr);
              await AsyncStorage.setItem('historiqueLentilles', JSON.stringify(historique));
             
              // On recharge le visuel
              chargerHistorique();
              Alert.alert("Supprimé", "La date a été retirée de l'historique.");
            } catch (e) {
              console.log(e);
            }
          }
        },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };



  return (    

    <View style={[styles.container, { paddingTop: headerHeight + 20 }]}> 
      <Text style={styles.titre}>Historique de mes changements</Text>
     
      <Calendar
        onDayPress={gererClicJour}
        markedDates={joursCoches}
        style={styles.calendrierStyle} // 🌟 On applique le nouveau style ici
        theme={{
          calendarBackground: 'transparent', 
          todayTextColor: '#00c7f4af',
          arrowColor: '#000',
          textSectionTitleColor: '#000',
          dayTextColor: '#000',
        }}
      />
     
      <Text style={styles.Légende}>
        💡 Cliquez sur un jour pour l'ajouter ou le supprimer de votre historique.
      </Text>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20, 
},
  titre: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2d3436',
  },
  Légende: {
    marginTop: 20,
    textAlign: 'center',
    color: '#000',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  calendrierStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)', // Fond blanc à 80% d'opacité
    borderRadius: 15, // Bords arrondis
    paddingBottom: 10, // Petit espace en bas
    // --- Ombres pour iOS ---
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    // --- Ombre pour Android ---
    elevation: 8, 
  }
});