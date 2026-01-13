import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';

export default function Profile({ route }) {
  const userId = route.params?.userId;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data || null);
      } catch (err) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) return (<View style={styles.center}><ActivityIndicator size="large" /></View>);
  if (error) return (<View style={styles.center}><Text style={styles.error}>{error}</Text></View>);
  if (!user) return (<View style={styles.center}><Text>User not found or private</Text></View>);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      {user.skills?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text>{user.skills.join(', ')}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700' },
  bio: { marginTop: 8 },
  section: { marginTop: 12 },
  sectionTitle: { fontWeight: '600' },
  error: { color: 'red' }
});
