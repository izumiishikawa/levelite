import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userLogin, userRegister } from '~/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Title from '~/components/Title';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AuthScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const user = await userLogin(email, password);

      if (user) {
        await AsyncStorage.setItem('userToken', user.token);
        onComplete();
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (err) {
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const data = await userRegister(username, email, password);

      if (data?.token) {
        await AsyncStorage.setItem('userToken', data.token);
        onComplete();
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="bg-[--background]" contentContainerStyle={styles.container}>
      <View className="my-10 w-[80%]">
        <Title text={isRegister ? 'Create Account' : 'Welcome Back'} />
      </View>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#B8B8B8"
          value={username}
          className="mb-3 bg-[--foreground]"
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B8B8B8"
        className="mb-3 bg-[--foreground]"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View
        style={styles.passwordContainer}
        className="mb-3 flex flex-row items-center rounded-lg bg-[--foreground] pr-4">
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          placeholderTextColor="#B8B8B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={24}
            color="#B8B8B8"
          />
        </TouchableOpacity>
      </View>

      {isRegister && (
        <View
          style={styles.passwordContainer}
          className="mb-3 flex flex-row items-center rounded-lg bg-[--foreground] pr-4">
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#B8B8B8"
            value={confirmPassword}
            className="bg-[--foreground]"
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Icon
              name={confirmPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#B8B8B8"
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={isRegister ? handleRegister : handleLogin}
        className="bg-[--accent]"
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.link}>
          {isRegister
            ? 'Already have an account? Login here'
            : "Don't have an account? Register here"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  link: {
    color: '#B8B8B8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AuthScreen;
