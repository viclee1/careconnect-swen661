import { useEffect, type ReactNode } from 'react';

import type { AppointmentRepository } from './data/appointmentRepository';
import type { ContactRepository } from './data/contactRepository';
import type { DailyTasksRepository } from './data/dailyTasksRepository';
import type { MedicineRepository } from './data/medicineRepository';
import type { MemoryRepository } from './data/memoryRepository';
import type { MessageRepository } from './data/messageRepository';
import type { SettingsRepository } from './data/settingsRepository';
import { AppointmentsProvider } from './state/AppointmentsProvider';
import { ContactsProvider } from './state/ContactsProvider';
import { DailyTasksProvider } from './state/DailyTasksProvider';
import { MedicinesProvider } from './state/MedicinesProvider';
import { MemoriesProvider } from './state/MemoriesProvider';
import { MessagesProvider } from './state/MessagesProvider';
import { SettingsProvider, useSettings } from './state/SettingsProvider';

function LoadSettings({ children }: { children: ReactNode }) {
  const { load } = useSettings();
  useEffect(() => {
    void load();
  }, [load]);
  return <>{children}</>;
}

/**
 * Wires the three contexts around the app.
 *
 * Every repository is injected rather than constructed inside a provider, which
 * is what lets the component tests swap in fakes and render the real screens
 * without touching storage.
 */
export function AppProviders({
  contactRepository,
  messageRepository,
  settingsRepository,
  dailyTasksRepository,
  appointmentRepository,
  medicineRepository,
  memoryRepository,
  children,
}: {
  contactRepository: ContactRepository;
  messageRepository: MessageRepository;
  settingsRepository: SettingsRepository;
  dailyTasksRepository: DailyTasksRepository;
  appointmentRepository: AppointmentRepository;
  medicineRepository: MedicineRepository;
  memoryRepository: MemoryRepository;
  children: ReactNode;
}) {
  return (
    <SettingsProvider repository={settingsRepository}>
      <LoadSettings>
        <ContactsProvider repository={contactRepository}>
          <MessagesProvider repository={messageRepository}>
            <DailyTasksProvider repository={dailyTasksRepository}>
              <AppointmentsProvider repository={appointmentRepository}>
                <MedicinesProvider repository={medicineRepository}>
                  <MemoriesProvider repository={memoryRepository}>{children}</MemoriesProvider>
                </MedicinesProvider>
              </AppointmentsProvider>
            </DailyTasksProvider>
          </MessagesProvider>
        </ContactsProvider>
      </LoadSettings>
    </SettingsProvider>
  );
}
