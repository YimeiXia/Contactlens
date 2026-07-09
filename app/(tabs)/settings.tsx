import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Notifications from 'expo-notifications'; // Import des notifications
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // 🌟 Import du hook
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight(); // 🌟 Calcule la taille exacte du header
  const [notificationsActives, setNotificationsActives] = useState(true);

  useEffect(() => {
    chargerParametres();
  }, []);

  // t = fonction pour traduire, i18n = objet pour changer la langue
  const { t, i18n } = useTranslation(); 

  const changerLangue = async (langue: string) => {
    try {
      await i18n.changeLanguage(langue); // Change la langue instantanément
      await AsyncStorage.setItem('langueApp', langue); // Sauvegarde pour la prochaine fois
    } catch (error) {
      console.log("Erreur lors du changement de langue", error);
    }
  };

  const chargerParametres = async () => {
    try {
      const savedNotifs = await AsyncStorage.getItem('notifsEnabled');
      if (savedNotifs !== null) {
        setNotificationsActives(JSON.parse(savedNotifs));
      }
    } catch (e) { /* Erreur */ }
  };

  // Demande les permissions à iOS/Android
  const gererNotifications = async (value: boolean) => {
    if (value) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
     
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
     
      if (finalStatus !== 'granted') {
        Alert.alert(i18n.t('alertTitreA'), i18n.t('alertA'));
        setNotificationsActives(false);
        return;
      }
    }

    setNotificationsActives(value);
    try {
      await AsyncStorage.setItem('notifsEnabled', JSON.stringify(value));
    } catch (e) { /* Erreur */ }
  };

  // Fonction magique pour envoyer une notification de test dans 5 secondes
  const testerNotification = async () => {
    if (!notificationsActives) {
      Alert.alert(i18n.t('alertTitreB'), i18n.t('alertB'));
      return;
    }

    Alert.alert("Test lancé", "Verrouillez votre téléphone ou quittez l'application. La notification arrive dans 5 secondes !");

    //const declenchement = new Date(Date.now() + 5000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('rappelTitre'),
        body: i18n.t('rappelBody'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      } as any, // Déclenchement dans 5 secondes
    });
  };

  const reinitialiserDonnees = () => {
    Alert.alert(
      "⚠️ Zone de danger",
      "Voulez-vous vraiment supprimer tout votre historique ?",
      [
        {
          text: "Oui, tout effacer",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            setNotificationsActives(true);
            Alert.alert("Nettoyage", "L'application a été réinitialisée.");
          }
        },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 20 }]}> 
      <Text style={styles.title}>{i18n.t('compte')}</Text>

      <View style={styles.sectionLangue}>
        <Text style={styles.label}>{i18n.t('choixLangue')}</Text>
        
        <View style={styles.boutonsContainer}>
          <TouchableOpacity 
            style={[styles.bouton, i18n.language === 'fr' && styles.boutonActif]} 
            onPress={() => changerLangue('fr')}
          >
            <Text style={[styles.texteBouton, i18n.language === 'fr' && styles.texteBoutonActif]}>
              🇫🇷 {i18n.t('francais')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.bouton, i18n.language === 'en' && styles.boutonActif]} 
            onPress={() => changerLangue('en')}
          >
            <Text style={[styles.texteBouton, i18n.language === 'en' && styles.texteBoutonActif]}>
              🇬🇧 {i18n.t('anglais')}
            </Text>
          </TouchableOpacity>

          {/* 🌟 Le nouveau bouton pour le Chinois */}
          <TouchableOpacity 
            style={[styles.bouton, i18n.language === 'zh' && styles.boutonActif]} 
            onPress={() => changerLangue('zh')}
          >
            <Text style={[styles.texteBouton, i18n.language === 'zh' && styles.texteBoutonActif]}>
              🇨🇳 {i18n.t('chinois')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>UX</Text></View>
        <Text style={styles.userName}>Utilisateur Expo</Text>
        <Text style={styles.userEmail}>developpeur@lentilles.app</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{i18n.t('rappel')}</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#00c7f4af' }}
            thumbColor={notificationsActives ? '#0984e3' : '#f4f3f4'}
            onValueChange={gererNotifications}
            value={notificationsActives}
          />
        </View>
      </View>

      {/* Nouveau bouton de Test */}
      <TouchableOpacity style={styles.testButton} onPress={testerNotification}>
        <Text style={styles.testButtonText}>🔔 Tester la notification (5s)</Text>
      </TouchableOpacity>

      {/*<TouchableOpacity style={styles.resetButton} onPress={reinitialiserDonnees}>
        <Text style={styles.resetButtonText}>Réinitialiser l'application</Text>
      </TouchableOpacity>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2d3436', marginBottom: 30 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.80)', padding: 20, borderRadius: 15, width: '90%', marginBottom: 20, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0984e3', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10 },
  avatarText: { color: 'rgba(255, 255, 255, 0.80)', fontSize: 22, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#2d3436', textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#636e72', textAlign: 'center', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, color: '#2d3436', fontWeight: '500' },
  testButton: { padding: 15, width: '90%', borderRadius: 12, backgroundColor: 'rgb(0, 184, 148, 0.8)', marginBottom: 15 },
  testButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  //resetButton: { marginTop: 'auto', marginBottom: 20, padding: 15, width: '90%', borderRadius: 12, backgroundColor: '#ff7675' },
  //resetButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }

  sectionLangue: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Petit fond transparent
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  bouton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#ecf0f1',
  },
  boutonActif: {
    backgroundColor: '#0984e3', // Devient bleu si sélectionné
  },
  texteBouton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  texteBoutonActif: {
    color: '#ffffff', // Le texte devient blanc pour bien ressortir sur le bouton bleu
  },
  boutonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centre le bloc
    gap: 10, // Met un peu d'espace entre les boutons
    flexWrap: 'wrap', // 🌟 Permet de passer à la ligne si l'écran est trop petit
  },
});