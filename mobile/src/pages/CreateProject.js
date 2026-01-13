import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { projectsAPI } from '../services/api';
import AuthContext from '../context/AuthContext';

export default function CreateProject({ navigation }) {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.cancelled) setImages((s) => [...s, res.uri]);
  };

  const submit = async () => {
    if (!title || !description) return Alert.alert('Validation', 'Title and description are required');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('shortDescription', shortDescription);
      images.forEach((uri, i) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        fd.append('images', { uri, name: filename, type });
      });

      await projectsAPI.create(fd);
      Alert.alert('Success', 'Project created');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />
      <Text style={styles.label}>Short Description</Text>
      <TextInput value={shortDescription} onChangeText={setShortDescription} style={styles.input} />
      <Text style={styles.label}>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 120 }]} multiline />
      <Button title="Pick Image" onPress={pickImage} />
      <View style={{ height: 8 }} />
      {images.map((uri) => <Image key={uri} source={{ uri }} style={{ width: 120, height: 80, marginBottom: 8 }} />)}
      <Button title="Create Project" onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, label: { marginTop: 8, fontWeight: '600' }, input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, marginTop: 6, marginBottom: 8 } });
