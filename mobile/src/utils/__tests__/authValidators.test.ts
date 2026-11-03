import { minPasswordLength, validateSignIn, validateSignUp } from '../validators';

// The sentences are the web and desktop clients' own, word for word.

describe('validateSignIn', () => {
  it('accepts a well-formed email and any password', () => {
    expect(validateSignIn({ email: 'margaret@example.com', password: 'x' })).toEqual({});
  });

  it('asks for each missing field, in screen order', () => {
    expect(validateSignIn({ email: '', password: '' })).toEqual({
      email: 'Please enter your email address.',
      password: 'Please enter your password.',
    });
    expect(Object.keys(validateSignIn({ email: '', password: '' }))).toEqual(['email', 'password']);
  });

  it('treats a blank email as missing, and explains a malformed one', () => {
    expect(validateSignIn({ email: '   ', password: 'x' }).email).toBe('Please enter your email address.');
    expect(validateSignIn({ email: 'margaret', password: 'x' }).email).toBe('Please enter a valid email address.');
    expect(validateSignIn({ email: 'margaret@example', password: 'x' }).email).toBe(
      'Please enter a valid email address.',
    );
  });
});

describe('validateSignUp', () => {
  const valid = { name: 'Margaret', email: 'margaret@example.com', password: 'secret1', confirm: 'secret1' };

  it('accepts a complete form', () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it('asks for every missing field, in screen order', () => {
    const errors = validateSignUp({ name: ' ', email: '', password: '', confirm: '' });
    expect(errors).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      password: 'Please create a password.',
      confirm: 'Please confirm your password.',
    });
    expect(Object.keys(errors)).toEqual(['name', 'email', 'password', 'confirm']);
  });

  it('says how long a password must be', () => {
    const short = 'a'.repeat(minPasswordLength - 1);
    expect(validateSignUp({ ...valid, password: short, confirm: short }).password).toBe(
      'Password must be at least 6 characters.',
    );
    const enough = 'a'.repeat(minPasswordLength);
    expect(validateSignUp({ ...valid, password: enough, confirm: enough })).toEqual({});
  });

  it('says when the two passwords differ', () => {
    expect(validateSignUp({ ...valid, confirm: 'secret2' })).toEqual({ confirm: 'Passwords do not match.' });
  });
});
