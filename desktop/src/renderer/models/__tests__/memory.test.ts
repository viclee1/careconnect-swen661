import { memorySemanticLabel } from '../memory';

describe('memorySemanticLabel', () => {
  it('states title, date and description as one sentence', () => {
    const label = memorySemanticLabel({
      id: 'mem1',
      title: 'Family Picnic at Quiet Waters',
      date: 'August 2026',
      description: 'Enjoyed a sunny afternoon walk and lunch by the water with Idris.',
    });

    expect(label).toBe(
      'Memory: Family Picnic at Quiet Waters, August 2026. Enjoyed a sunny afternoon walk and lunch by the water with Idris.',
    );
  });
});
