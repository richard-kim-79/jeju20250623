import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>알림</Text>
        <Text style={styles.placeholderText}>알림 기능이 곧 추가됩니다</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
}); 