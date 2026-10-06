import { screen, within } from '@testing-library/react';

import {
  createFlakyAppointmentRepository,
  createMockAppointmentRepository,
} from '../../data/appointmentRepository';
import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { mockAppointments } from '../../data/mockAppointments';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { renderApp, tabbableElements } from '../../test-support/harness';

const repositories = (appointments = createMockAppointmentRepository()) => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository(),
  settings: createInMemorySettingsRepository(),
  appointments,
});

async function openAppointments(appointments = createMockAppointmentRepository()) {
  const rendered = renderApp({
    repositories: repositories(appointments),
    initialRoute: { name: 'Appointments' },
  });
  await screen.findByTestId('appointment-appt1');
  return rendered;
}

const exportButton = () => screen.getByRole('button', { name: /export to calendar/i });

describe('AppointmentsPage', () => {
  describe('the list', () => {
    it('shows every upcoming visit with its doctor, specialty, time and place', async () => {
      await openAppointments();

      expect(screen.getByRole('heading', { level: 1, name: 'Appointments' })).toBeInTheDocument();
      expect(screen.getByText('2 upcoming visits')).toBeInTheDocument();

      for (const appointment of mockAppointments) {
        const card = screen.getByTestId(`appointment-${appointment.id}`);
        expect(card).toHaveAccessibleName(appointment.doctor);
        expect(within(card).getByText(appointment.specialty)).toBeInTheDocument();
        expect(within(card).getByText(appointment.date)).toBeInTheDocument();
        expect(within(card).getByText(appointment.time)).toBeInTheDocument();
        expect(within(card).getByText(appointment.location)).toBeInTheDocument();
      }
    });

    it('gives each card a heading, so a screen-reader user can jump between them', async () => {
      await openAppointments();

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.map((heading) => heading.textContent)).toEqual(
        mockAppointments.map((appointment) => appointment.doctor),
      );
      expect(screen.getByRole('list', { name: 'Upcoming appointments' })).toBeInTheDocument();
    });

    it('does not make the read-only cards Tab stops', async () => {
      // A Tab stop that does nothing is noise for a keyboard user.
      await openAppointments();

      const main = screen.getByRole('main');
      const stops = tabbableElements(main);
      expect(stops).toEqual([exportButton()]);
    });

    it('says when there is nothing booked, and offers no export', async () => {
      renderApp({
        repositories: repositories(createMockAppointmentRepository([])),
        initialRoute: { name: 'Appointments' },
      });

      expect(await screen.findByRole('heading', { name: 'No appointments yet' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    });

    it('tells a failed load apart from an empty list, and recovers on Try again', async () => {
      const { user } = renderApp({
        repositories: repositories(createFlakyAppointmentRepository(1)),
        initialRoute: { name: 'Appointments' },
      });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Appointments could not be loaded');
      expect(screen.queryByText('No appointments yet')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByTestId('appointment-appt1')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('exporting to a calendar', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    let clicked: HTMLAnchorElement[];

    beforeEach(() => {
      clicked = [];
      URL.createObjectURL = jest.fn(() => 'blob:calendar');
      URL.revokeObjectURL = jest.fn();
      jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(function (this: HTMLAnchorElement) {
          clicked.push(this);
        });
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      jest.restoreAllMocks();
    });

    const savedCalendar = async () => {
      const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
      // jsdom's Blob has no text(); FileReader is the API it does implement.
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
    };

    it('hands a calendar file to the native Save dialog as a download', async () => {
      const { user } = await openAppointments();

      await user.click(exportButton());

      expect(clicked).toHaveLength(1);
      expect(clicked[0].download).toBe('CareConnect appointments.ics');
      expect(clicked[0].href).toBe('blob:calendar');
      // The temporary link is cleaned up rather than left in the document.
      expect(document.querySelector('a[download]')).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:calendar');

      const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
      expect(blob.type).toBe('text/calendar;charset=utf-8');
    });

    it('puts every visit in the file, with an on-screen reminder and no sound', async () => {
      const { user } = await openAppointments();

      await user.click(exportButton());

      const ics = (await savedCalendar()).replace(/\r\n /g, '');
      expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(mockAppointments.length);
      expect(ics).toContain('SUMMARY:Dr. Robert Chen (Cardiology)');
      expect(ics).toContain('DTSTART:20261002T143000');
      expect(ics).toContain('ACTION:DISPLAY');
      expect(ics).not.toContain('ACTION:AUDIO');
    });

    it('confirms in a banner that stays until dismissed', async () => {
      const { user } = await openAppointments();

      await user.click(exportButton());

      const heading = screen.getByRole('heading', { name: '2 appointments ready to save' });
      const banner = heading.closest('.banner');
      // A status banner, not a toast: announced once, then left on screen.
      expect(banner).toHaveAttribute('role', 'status');
      expect(banner).toHaveTextContent('CareConnect appointments.ics');
    });

    it('returns focus to the Export button when the banner is dismissed', async () => {
      const { user } = await openAppointments();

      await user.click(exportButton());
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(screen.queryByRole('heading', { name: /ready to save/ })).not.toBeInTheDocument();
      expect(exportButton()).toHaveFocus();
    });

    it('works from the keyboard: Tab to Export, Enter to save', async () => {
      const { user } = await openAppointments();

      exportButton().focus();
      await user.keyboard('{Enter}');

      expect(clicked).toHaveLength(1);
      expect(
        screen.getByRole('heading', { name: '2 appointments ready to save' }),
      ).toBeInTheDocument();
    });

    it('explains the reminder to assistive technology before it is pressed', async () => {
      await openAppointments();

      expect(exportButton()).toHaveAccessibleDescription(/on-screen reminder.*no sound/i);
    });

    it('warns when some appointments were left out', async () => {
      const { user } = await openAppointments(
        createMockAppointmentRepository([
          mockAppointments[0],
          { ...mockAppointments[1], date: 'TBC' },
        ]),
      );

      await user.click(exportButton());

      const heading = screen.getByRole('heading', { name: '1 appointment ready to save' });
      const banner = heading.closest('.banner');
      expect(banner).toHaveClass('banner--warning');
      expect(banner).toHaveTextContent(
        '1 appointment had no date a calendar can read and was left out.',
      );
    });

    it('refuses in words when no appointment has a date a calendar can read', async () => {
      const { user } = await openAppointments(
        createMockAppointmentRepository(
          mockAppointments.map((appointment) => ({ ...appointment, date: 'TBC' })),
        ),
      );

      await user.click(exportButton());

      expect(screen.getByRole('alert')).toHaveTextContent('Appointments were not exported');
      expect(clicked).toHaveLength(0);
    });
  });
});
