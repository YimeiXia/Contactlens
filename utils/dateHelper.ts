import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import i18n from './i18n';

export const planifierRappelDepuisMemoire = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const donneesHistorique = await AsyncStorage.getItem('historiqueLentilles');
    let historique = donneesHistorique ? JSON.parse(donneesHistorique) : [];

    if (historique.length === 0) {
      console.log("Aucune date en mémoire, planification impossible.");
      return null;
    }

    historique.sort(); 
    const dateDernierChangementStr = historique[historique.length - 1]; 

    // 🌟 LIRE LE TYPE DE LENTILLE
    const typeChoisi = await AsyncStorage.getItem('typeLentilles') || 'mensuel';
    let joursAjouter = 30; // Par défaut, 30 jours
    
    // 🌟 On vérifie strictement les IDs secrets que l'on vient de configurer
    if (typeChoisi === 'hebdomadaire') joursAjouter = 7;
    if (typeChoisi === 'bimensuel') joursAjouter = 15;
    if (typeChoisi === 'mensuel') joursAjouter = 30;
    if (typeChoisi === 'annuel') joursAjouter = 365;

    const [annee, mois, jour] = dateDernierChangementStr.split('-').map(Number);
    const cible20h30 = new Date(annee, mois - 1, jour);
    
    cible20h30.setDate(cible20h30.getDate() + joursAjouter);
    cible20h30.setHours(20, 30, 0, 0); 

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('rappelTitre'),
        body: i18n.t('rappelBody'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        year: cible20h30.getFullYear(),
        month: cible20h30.getMonth() + 1,
        day: cible20h30.getDate(),
        hour: 20,
        minute: 30,
      } as any,
    });

    return cible20h30;

  } catch (erreur) {
    console.log("Erreur dans le dateHelper :", erreur);
    return null;
  }
};