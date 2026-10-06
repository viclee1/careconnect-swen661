import { appointmentSemanticLabel } from '../appointment';

describe('appointmentSemanticLabel', () => {
  it('states doctor, specialty, date, time and location as one sentence', () => {
    const label = appointmentSemanticLabel({
      id: 'a1',
      doctor: 'Dr. Robert Chen',
      specialty: 'Cardiology',
      date: 'Sept 18, 2026',
      time: '10:00 am',
      location: 'Annapolis Medical Center',
    });

    expect(label).toBe(
      'Appointment with Dr. Robert Chen, Cardiology, on Sept 18, 2026 at 10:00 am, at Annapolis Medical Center',
    );
  });
});
