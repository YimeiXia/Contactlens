



import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { planifierRappelDepuisMemoire } from '../utils/dateHelper';

// 1. Gestion de l'affichage des notifications au premier plan
Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
} as any);


export default function RootLayout() {
  useEffect(() => {
   
    // Fonction magique qui s'exécute quand on clique sur la notification
    const gererLeClicNotification = async (response: any) => {
      if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
       
        setTimeout(() => {
          Alert.alert(
            "👁️ Suivi des Lentilles",
            "Avez-vous changé vos lentilles aujourd'hui ?",
            [
              {
                text: "Oui, c'est fait ! 🎉",
                onPress: async () => {
                  // Si l'utilisateur clique oui depuis la notif, on prend la date du jour au format AAAA-MM-JJ
                  const aujourdhui = new Date().toISOString().split('T')[0];
                  await enregistrerChangementEtPlanifier(aujourdhui);
                }
              },
              {
                text: "Non, pas encore",
                style: "destructive",
                onPress: () => {
                  setTimeout(() => {
                    Alert.alert(
                      "⏰ Reporter le rappel",
                      "Quand souhaitez-vous recevoir la prochaine notification ?",
                      [
                        { text: "Dans 1 heure", onPress: () => programmerRelanceSecondes(3600, "Dans 1 heure") },
                        {
                          text: "Ce soir (à 20h)",
                          onPress: () => {
                            const maintenant = new Date();
                            const ceSoir = new Date();
                            ceSoir.setHours(20, 0, 0, 0);
                            if (maintenant > ceSoir) ceSoir.setDate(ceSoir.getDate() + 1);
                            const secondesRestantes = Math.round((ceSoir.getTime() - maintenant.getTime()) / 1000);
                            programmerRelanceSecondes(secondesRestantes, "Ce soir à 20h");
                          }
                        },
                        { text: "Demain", onPress: () => programmerRelanceSecondes(86400, "Demain") },
                        { text: "Annuler", style: "cancel" }
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
  }, []);





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
        Alert.alert(
          "Sauvegardé avec succès ! 💾",
          `Changement enregistré.\nProchain rappel automatique calculé pour le ${cible20h30.toLocaleDateString('fr-FR')} à 20h30.`
        );
      } else {
        // Optionnel : au cas où la mémoire renvoie null
        Alert.alert("Sauvegardé ! 💾", "Changement enregistré dans le calendrier.");
      }

    } catch (erreur) {
      Alert.alert("Erreur mémoire", "Impossible d'accéder au stockage.");
      console.log(erreur);
    }
  };



  // Fonction utilitaire pour gérer les reports à court terme (Snooze)
  const programmerRelanceSecondes = async (secondes: number, texteAffichage: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Rappel Lentilles",
          body: "N'oubliez pas de changer vos lentilles dès que possible !",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondes,
        } as any,
      });
      Alert.alert("Rappel programmé", `Nouveau rappel configuré : ${texteAffichage}`);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de programmer le rappel");
    }
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}