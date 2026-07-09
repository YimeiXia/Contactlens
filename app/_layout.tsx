


import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 🌟 Import ajouté
import { Alert } from 'react-native';
import { planifierRappelDepuisMemoire } from '../utils/dateHelper';
import '../utils/i18n';

// 1. Gestion de l'affichage des notifications au premier plan
Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
} as any);


export default function RootLayout() {
  const { t, i18n } = useTranslation(); 
  useEffect(() => {
   
    // Fonction magique qui s'exécute quand on clique sur la notification
    const gererLeClicNotification = async (response: any) => {
      if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
       
        setTimeout(() => {
          Alert.alert(
            i18n.t('alerteSuiviTitre'), // 🌟 Traduit
            i18n.t('alerteSuiviQuestion'), // 🌟 Traduit
            [
              {
                text: i18n.t('ouiFait'), // 🌟 Traduit
                onPress: async () => {
                  // Si l'utilisateur clique oui depuis la notif, on prend la date du jour au format AAAA-MM-JJ
                  const aujourdhui = new Date().toISOString().split('T')[0];
                  await enregistrerChangementEtPlanifier(aujourdhui);
                }
              },
              {
                text: i18n.t('nonPasEncore'),
                style: "destructive",
                onPress: () => {
                  setTimeout(() => {
                    Alert.alert(
                      i18n.t('reporterTitre'), // 🌟 Traduit
                      i18n.t('reporterQuestion'), // 🌟 Traduit
                      [
                        { text: i18n.t('dansUneHeure'), onPress: () => programmerRelanceSecondes(3600, i18n.t('dansUneHeure')) },
                        {
                          text: i18n.t('ceSoir'),
                          onPress: () => {
                            const maintenant = new Date();
                            const ceSoir = new Date();
                            ceSoir.setHours(20, 0, 0, 0);
                            if (maintenant > ceSoir) ceSoir.setDate(ceSoir.getDate() + 1);
                            const secondesRestantes = Math.round((ceSoir.getTime() - maintenant.getTime()) / 1000);
                            programmerRelanceSecondes(secondesRestantes, i18n.t('ceSoir'));
                          }
                        },
                        { text: i18n.t('demain'), onPress: () => programmerRelanceSecondes(86400, i18n.t('demain')) },
                      ]
                    );
                  }, 400);
                }
              }
            ]
          );
        }, 500);
      }
    };

    // Écouteur pour le démarrage à froid (si l'app était fermée)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) gererLeClicNotification(response);
    });

    // Écouteur pour l'arrière-plan (si l'app était déjà ouverte)
    const subscription = Notifications.addNotificationResponseReceivedListener(gererLeClicNotification);
    return () => subscription.remove();
  }, [i18n.t]);





   // 🌟 ÉTAPE 2 : Ta fonction de mémoire est devenue ultra courte et propre !
  const enregistrerChangementEtPlanifier = async (dateChangementStr: string) => {
    try {
      // A. On sauvegarde la date dans l'historique local (AsyncStorage)
      const donnees = await AsyncStorage.getItem('historiqueLentilles');
      let historique = donnees ? JSON.parse(donnees) : [];
     
      if (!historique.includes(dateChangementStr)) {
        historique.push(dateChangementStr);
        historique.sort();
        await AsyncStorage.setItem('historiqueLentilles', JSON.stringify(historique));
      }

      // B. MAGIE : On appelle la fonction centralisée du dateHelper
      // Elle s'occupe d'annuler les anciennes notifs, lire le type, calculer et programmer !
      const cible20h30 = await planifierRappelDepuisMemoire();

      if (cible20h30 !== null && cible20h30 !== undefined) {
        // 1. On détermine le format local selon la langue choisie
        let localeCode = 'fr-FR';
        if (i18n.language === 'en') localeCode = 'en-US';
        if (i18n.language === 'zh') localeCode = 'zh-CN';

        // 2. On formate la date pour la langue
        const dateFormatee = cible20h30.toLocaleDateString(localeCode);

        // 3. On affiche l'alerte en passant la variable { date: ... }
        Alert.alert(
          i18n.t('sauvegardeTitre'),
          i18n.t('rappelCalcule', { date: dateFormatee }) // 🌟 La magie opère ici !
        );
      } else {
        // Optionnel : au cas où la mémoire renvoie null
        Alert.alert(i18n.t('sauvegardeTitre'), i18n.t('changementEnregistre'));
      }

    } catch (erreur) {
      Alert.alert(i18n.t('errorMemery'), i18n.t('errorMemoire'));
      console.log(erreur);
    }
  };



  // Fonction utilitaire pour gérer les reports à court terme (Snooze)
  const programmerRelanceSecondes = async (secondes: number, texteAffichage: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('rappelSnoozeTitre'),
          body: i18n.t('rappelSnoozeBody'),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondes,
        } as any,
      });
      Alert.alert(
        i18n.t('rappelProgramme'), 
        i18n.t('rappelConfigure', { quand: texteAffichage })
      );
    } catch (e) {
      Alert.alert("Erreur", "Impossible de programmer le rappel");
    }
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}