import { fixSummary, requiredFieldErrors } from '../validators';

describe('requiredFieldErrors', () => {
  const fields = [
    { name: 'name' as const, label: 'Medicine name' },
    { name: 'dose' as const, label: 'Dose' },
  ];

  it('names each empty or blank field, in order', () => {
    expect(requiredFieldErrors(fields, { name: '   ', dose: '' })).toEqual({
      name: 'Medicine name is required.',
      dose: 'Dose is required.',
    });
  });

  it('is empty when every field is filled', () => {
    expect(requiredFieldErrors(fields, { name: 'Aspirin', dose: '75 mg' })).toEqual({});
  });

  it('summarises the count in the singular and the plural', () => {
    expect(fixSummary(1)).toBe('1 thing needs fixing');
    expect(fixSummary(2)).toBe('2 things need fixing');
  });
});
