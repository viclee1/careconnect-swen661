import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import AppointmentsScreen from './screens/AppointmentsScreen';
import MedicinesScreen from './screens/MedicinesScreen';
import MemoriesScreen from './screens/MemoriesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
        }}
      >
        <Tab.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={{
            title: 'Appointments',
            tabBarLabel: 'Appointments',
          }}
        />
        <Tab.Screen
          name="Medicines"
          component={MedicinesScreen}
          options={{
            title: 'Medicines',
            tabBarLabel: 'Medicines',
          }}
        />
        <Tab.Screen
          name="Memories"
          component={MemoriesScreen}
          options={{
            title: 'Memories',
            tabBarLabel: 'Memories',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
