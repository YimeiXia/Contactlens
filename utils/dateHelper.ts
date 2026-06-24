import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export const planifierRappelDepuisMemoire = async () => {
  try {
    // 1. On annule d'abord les anciennes notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. LIRE LA MÉMOIRE : On récupère tout l'historique des ronds verts
    const donneesHistorique = await AsyncStorage.getItem('historiqueLentilles');
    let historique = donneesHistorique ? JSON.parse(donneesHistorique) : [];

    // 🛑 SÉCURITÉ : Si l'historique est vide, on ne peut rien calculer
    if (historique.length === 0) {
      console.log("Aucune date en mémoire, planification impossible.");
      return null;
    }

    // 3. TRIER ET TROUVER LA DERNIÈRE DATE
    historique.sort(); // Trie par ordre chronologique (ex: ['2026-05-23', '2026-06-22'])
    const dateDernierChangementStr = historique[historique.length - 1]; // Récupère le dernier élément

    // 4. LIRE LE TYPE DE LENTILLE (onglet 1)
    const typeChoisi = await AsyncStorage.getItem('typeLentilles') || 'mensuel';
    let joursAjouter = 30;
    if (typeChoisi === 'Hebdomadaire') joursAjouter = 7;
    if (typeChoisi === 'Bi-mensuel') joursAjouter = 15;
    if (typeChoisi === 'Mensuel') joursAjouter = 30;
    if (typeChoisi === 'Annuel') joursAjouter = 365;

    // 5. CALCUL DE LA NOUVELLE DATE DE CHANGEMENT
    const [annee, mois, jour] = dateDernierChangementStr.split('-').map(Number);
    const cible20h30 = new Date(annee, mois - 1, jour);
   
    // On ajoute le nombre de jours à la date de la mémoire !
    cible20h30.setDate(cible20h30.getDate() + joursAjouter);
    cible20h30.setHours(20, 30, 0, 0); // Toujours à 20h30

    console.log("Dernier changement :", dateDernierChangementStr);
    console.log("Type :", typeChoisi);
    console.log("Locale :", cible20h30.toLocaleString('fr-FR'));

    // 6. PROGRAMMATION DE LA NOTIF SUR L'IPHONE
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👁️ Rappel Lentilles",
        body: `C'est le moment de changer vos lentilles ! Votre cycle (${typeChoisi}) est terminé.`,
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


    // On renvoie la date calculée pour que l'interface puisse l'afficher si besoin
    return cible20h30;

  } catch (erreur) {
    console.log("Erreur dans le dateHelper :", erreur);
    return null;
  }
};