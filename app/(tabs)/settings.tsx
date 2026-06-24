import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; // Import des notifications
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [notificationsActives, setNotificationsActives] = useState(true);

  useEffect(() => {
    chargerParametres();
  }, []);

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
        Alert.alert("Permission refusée", "Vous devez activer les notifications dans les réglages de votre iPhone.");
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
      Alert.alert("Désactivé", "Veuillez d'abord activer les rappels automatiques.");
      return;
    }

    Alert.alert("Test lancé", "Verrouillez votre téléphone ou quittez l'application. La notification arrive dans 5 secondes !");

    //const declenchement = new Date(Date.now() + 5000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👁️ Rappel Lentilles",
        body: "C'est le moment de changer vos lentilles !",
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
    <View style={styles.container}>
      <Text style={styles.title}>Mon Compte</Text>

      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>UX</Text></View>
        <Text style={styles.userName}>Utilisateur Expo</Text>
        <Text style={styles.userEmail}>developpeur@lentilles.app</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Rappels automatiques</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
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

      <TouchableOpacity style={styles.resetButton} onPress={reinitialiserDonnees}>
        <Text style={styles.resetButtonText}>Réinitialiser l'application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', padding: 20, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2d3436', marginBottom: 30 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '90%', marginBottom: 20, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0984e3', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#2d3436', textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#636e72', textAlign: 'center', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, color: '#2d3436', fontWeight: '500' },
  testButton: { padding: 15, width: '90%', borderRadius: 12, backgroundColor: '#00b894', marginBottom: 15 },
  testButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  resetButton: { marginTop: 'auto', marginBottom: 20, padding: 15, width: '90%', borderRadius: 12, backgroundColor: '#ff7675' },
  resetButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});