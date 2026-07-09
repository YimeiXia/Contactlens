import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from 'expo-router'; // 🌟 Pour rafraîchir l'écran automatiquement
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next'; // 🌟 1. On importe le traducteur
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { planifierRappelDepuisMemoire } from '../../utils/dateHelper';





export default function CalendrierScreen() {
const headerHeight = useHeaderHeight(); // 🌟 Calcule la taille exacte du header
  const [joursCoches, setJoursCoches] = useState<any>({});

  const { t, i18n } = useTranslation(); 
    // Constante brute format AAAA-MM-JJ
  const dateAujourdhui = new Date().toISOString().split('T')[0];
  
  // State qui contrôle quel mois le calendrier affiche
  const [moisAffiche, setMoisAffiche] = useState(dateAujourdhui);
  
  // 🌟 Ce state sert uniquement à forcer React à redessiner le calendrier
  const [cleRafraichissement, setCleRafraichissement] = useState(0);

  const revenirAujourdhui = () => {
    setMoisAffiche(dateAujourdhui); // 1. On remet la bonne date
    setCleRafraichissement(cleRafraichissement + 1); // 2. On change la clé pour forcer le "re-render"
  };


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
          // 🌟 On passe en style sur-mesure
          customStyles: {
            container: {
              backgroundColor: '#00c7f4af', // Ton vert de fond
              borderWidth: 2,             // Épaisseur de la bordure
              borderColor: '#0984e3',     // Couleur de la bordure (ex: vert plus foncé)
              // 🌟 Les ajouts pour régler le décalage :
              width: 31,                // Force une largeur fixe
              height: 31,               // Force une hauteur fixe (carré parfait)
              borderRadius: 17,         // Exactement la moitié de 36 pour un cercle parfait
              justifyContent: 'center', // Centre le texte de haut en bas
              alignItems: 'center',     // Centre le texte de gauche à droite
            },
            text: {
              color: 'white',             // Couleur du texte du jour
              fontStyle: 'italic',
            }
        }
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

    Alert.alert(i18n.t('modif'),
      i18n.t('questionMarquerJour', { date: dateStr }),
      [
        {
          text: i18n.t('ouiEnregistrer'),
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
              Alert.alert(i18n.t('error'), i18n.t('impossibleEnregistrerChoix'));
            }
          }
        },
        {
          text: i18n.t('supprimerCeJour'),
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
              Alert.alert(i18n.t('supprime'), i18n.t('dateRetiree'));
            } catch (e) {
              console.log(e);
            }
          }
        },
        { text: i18n.t('annuler'), style: "cancel" }
      ]
    );
  };



  return (    

    <View style={[styles.container, { paddingTop: headerHeight + 20 }]}> 
      <Text style={styles.titre}>{i18n.t('titreCalendrier')}</Text>
      <Calendar
        current={moisAffiche} // 🌟 Le calendrier suit cette variable
        onMonthChange={(month: any) => setMoisAffiche(month.dateString)} // 🌟 Garde le state à jour si l'utilisateur swipe
        key={cleRafraichissement} // 🌟 L'astuce est ici ! À chaque clic, la clé change, le calendrier se réinitialise sur current.
        
        markingType="custom" // 🌟 Indispensable pour activer les bordures personnalisées
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
      
      <View style={styles.headerCalendrier}>
        <TouchableOpacity style={styles.boutonAujourdhui} onPress={revenirAujourdhui}>
          <Text style={styles.texteAujourdhui}>{t('aujourdhui')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.Légende}>
        {i18n.t('legendeCalendrier')}
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
  },
  headerCalendrier: {
    alignItems: 'flex-end', // Aligne le bouton à droite (ou 'center'/'flex-start' selon ton goût)
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  boutonAujourdhui: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0984e3',
  },
  texteAujourdhui: {
    color: '#0984e3',
    fontWeight: 'bold',
    fontSize: 14,
  },
});