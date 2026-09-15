import { fireEvent, screen } from '@testing-library/react-native';

import { createFlakyAppointmentRepository } from '../../data/appointmentRepository';
import { renderApp, useTabletSize } from '../../test-support/harness';

describe('AppointmentsScreen rendering', () => {
  it('shows the heading', async () => {
    await renderApp({ initialTabName: 'Appointments' });
    expect(await screen.findByText('Appointments')).toBeTruthy();
    expect(screen.getByText('Upcoming medical visits')).toBeTruthy();
  });

  it('lists the seeded appointments', async () => {
    await renderApp({ initialTabName: 'Appointments' });
    expect(await screen.findByText('Dr. Robert Chen')).toBeTruthy();
    expect(screen.getByText('Cardiology')).toBeTruthy();
    expect(screen.getByText('Sept 18, 2026 at 10:00 am')).toBeTruthy();
    expect(screen.getByText('Annapolis Medical Center')).toBeTruthy();
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeTruthy();
  });

  it('announces each appointment as one sentence', async () => {
    await renderApp({ initialTabName: 'Appointments' });
    const card = await screen.findByTestId('appointment-appt1');
    expect(card.props.accessibilityLabel).toContain('Dr. Robert Chen');
    expect(card.props.accessibilityLabel).toContain('Annapolis Medical Center');
  });
});

describe('AppointmentsScreen when loading fails', () => {
  it('explains the failure instead of showing an empty list', async () => {
    await renderApp({
      initialTabName: 'Appointments',
      appointmentRepository: createFlakyAppointmentRepository(99),
    });

    expect(await screen.findByText('Appointments could not be loaded')).toBeTruthy();
    expect(screen.getByText(/nothing has been lost/)).toBeTruthy();
    expect(screen.queryByText('No appointments yet')).toBeNull();
    expect(screen.queryByTestId('appointment-appt1')).toBeNull();
  });

  it('recovers when the retry button succeeds', async () => {
    await renderApp({
      initialTabName: 'Appointments',
      appointmentRepository: createFlakyAppointmentRepository(1),
    });

    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByTestId('appointment-appt1')).toBeTruthy();
    expect(screen.queryByText('Appointments could not be loaded')).toBeNull();
  });
});

describe('AppointmentsScreen layout', () => {
  it('stacks cards in one column on a phone', async () => {
    await renderApp({ initialTabName: 'Appointments' });
    expect(await screen.findByTestId('appointment-appt1')).toBeTruthy();
  });

  it('lays cards two across on a tablet', async () => {
    useTabletSize();
    await renderApp({ initialTabName: 'Appointments' });
    expect(await screen.findByTestId('appointment-appt1')).toBeTruthy();
    expect(screen.getByTestId('appointment-appt2')).toBeTruthy();
  });
});
