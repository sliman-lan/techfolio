import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://10.0.2.2:5000/api';
// Note: On Android emulator use 10.0.2.2 to reach host localhost. For real devices
// replace with your machine IP or set EXPO_PUBLIC_API_BASE in app config.

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/projects`);
        setProjects(res.data || []);
      } catch (err) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.error}>Error: {error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TechFolio Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.projectTitle}>{item.title}</Text>
            {item.shortDescription ? (
              <Text style={styles.short}>{item.shortDescription}</Text>
            ) : null}
            <Text style={styles.meta}>By: {item.userId?.name || 'Unknown'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  projectTitle: { fontSize: 18, fontWeight: '500' },
  short: { color: '#444', marginTop: 6 },
  meta: { marginTop: 8, color: '#666', fontSize: 12 },
  error: { color: 'red' }
});
