import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  
  // --- STATES ---
  const [notificationsActives, setNotificationsActives] = useState(true);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [enEdition, setEnEdition] = useState(false);

  const { t, i18n } = useTranslation(); 

  useEffect(() => {
    chargerParametres();
    chargerProfil();
  }, []);

  // --- LOGIQUE PROFIL ---
  const chargerProfil = async () => {
    try {
      const savedNom = await AsyncStorage.getItem('userNom');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedNom) setNom(savedNom);
      if (savedEmail) setEmail(savedEmail);
    } catch (e) { /* Erreur ignorée */ }
  };

  const sauvegarderProfil = async () => {
    try {
      await AsyncStorage.setItem('userNom', nom);
      await AsyncStorage.setItem('userEmail', email);
      setEnEdition(false); 
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder le profil");
    }
  };

  const initiales = nom.trim().length > 0 ? nom.trim().substring(0, 2).toUpperCase() : 'UX';

  // --- LOGIQUE RÉGLAGES ---
  const changerLangue = async (langue: string) => {
    try {
      await i18n.changeLanguage(langue);
      await AsyncStorage.setItem('langueApp', langue);
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

  const testerNotification = async () => {
    if (!notificationsActives) {
      Alert.alert(i18n.t('alertTitreB'), i18n.t('alertB'));
      return;
    }

    Alert.alert("Test lancé", "Verrouillez votre téléphone ou quittez l'application. La notification arrive dans 5 secondes !");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('rappelTitre'),
        body: i18n.t('rappelBody'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      } as any,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 20 }]}> 
      <Text style={styles.title}>{i18n.t('compte')}</Text>

      {/* 1. CARTE PROFIL DYNAMIQUE */}
      <View style={styles.card}>
        <View style={styles.headerProfil}>
          <TouchableOpacity onPress={() => enEdition ? sauvegarderProfil() : setEnEdition(true)}>
            <Text style={styles.texteModifier}>
              {enEdition ? i18n.t('sauvegarder') : i18n.t('modifier')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatar}><Text style={styles.avatarText}>{initiales}</Text></View>

        {enEdition ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder={i18n.t('votreNom')}
              placeholderTextColor="#b2bec3"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={i18n.t('votreEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#b2bec3"
            />
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.userName}>{nom || i18n.t('utilisateurParDefaut')}</Text>
            <Text style={styles.userEmail}>{email || i18n.t('emailNonRenseigne')}</Text>
          </View>
        )}
      </View>

      {/* 2. BLOC LANGUES */}
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

      {/* 3. BLOC NOTIFICATIONS */}
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

      {/* 4. BOUTON TEST */}
      <TouchableOpacity style={styles.testButton} onPress={testerNotification}>
        <Text style={styles.testButtonText}>🔔 Tester la notification (5s)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- LAYOUT GLOBAL ---
  container: { flex: 1, backgroundColor: 'transparent', padding: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2d3436', marginBottom: 30 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.80)', padding: 20, borderRadius: 15, width: '90%', marginBottom: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, color: '#2d3436', fontWeight: '500' },

  // --- PROFIL (Lecture et Édition) ---
  headerProfil: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginBottom: -15, zIndex: 10 },
  texteModifier: { color: '#0984e3', fontWeight: 'bold', fontSize: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00c7f4af', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#0984e3' },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#2d3436', textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#636e72', textAlign: 'center', marginTop: 2, fontStyle: 'italic' },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, marginTop: 10, width: '90%', borderWidth: 1, borderColor: '#b2bec3', textAlign: 'center', color: '#2d3436', fontSize: 16 },


  //button: { backgroundColor: 'rgba(255, 255, 255, 0.80)', padding: 18, borderRadius: 12, marginVertical: 8, width: '80%', borderWidth: 2, borderColor: '#b2bec3' },

  // --- SECTION LANGUES ---
  sectionLangue: { backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 20, borderRadius: 15, marginBottom: 20, width: '90%' },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#2c3e50', textAlign: 'center' },
  boutonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  bouton: {backgroundColor: 'rgba(255, 255, 255, 0.80)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 2, borderColor: '#b2bec3' },
  boutonActif: { backgroundColor: '#00c7f4af', borderColor: '#0984e3' },
  texteBouton: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  texteBoutonActif: { color: '#ffffff' },

  // --- BOUTONS ACTIONS ---
  testButton: { padding: 15, width: '90%', borderRadius: 12, backgroundColor: 'rgb(0, 184, 148)', marginBottom: 15 },
  testButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});