import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from './src/AppProviders';
import { createMockAppointmentRepository } from './src/data/appointmentRepository';
import { createMockContactRepository } from './src/data/contactRepository';
import { createMockDailyTasksRepository } from './src/data/dailyTasksRepository';
import { createMockMedicineRepository } from './src/data/medicineRepository';
import { createMockMemoryRepository } from './src/data/memoryRepository';
import { createMockMessageRepository } from './src/data/messageRepository';
import { createAsyncStorageSettingsRepository } from './src/data/settingsRepository';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Entry point.
 *
 * Week 5 runs against in-memory repositories seeded with the same care
 * recipient as the Flutter client. Swapping in a networked implementation is a
 * change to these three lines and nothing else.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProviders
        contactRepository={createMockContactRepository()}
        messageRepository={createMockMessageRepository()}
        settingsRepository={createAsyncStorageSettingsRepository()}
        dailyTasksRepository={createMockDailyTasksRepository()}
        appointmentRepository={createMockAppointmentRepository()}
        medicineRepository={createMockMedicineRepository()}
        memoryRepository={createMockMemoryRepository()}
      >
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AppProviders>
    </SafeAreaProvider>
  );
}
