import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WriteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    Alert.alert('알림', '글쓰기 기능이 곧 추가됩니다');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>글쓰기</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitButton}>등록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.locationInput}
          placeholder="위치 (선택사항)"
          value={location}
          onChangeText={setLocation}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.imageButton}>
          <Ionicons name="camera-outline" size={24} color="#666" />
          <Text style={styles.imageButtonText}>사진 추가</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
}); 