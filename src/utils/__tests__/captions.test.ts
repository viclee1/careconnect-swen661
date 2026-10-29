import { captionLines } from '../captions';

describe('captionLines', () => {
  it('breaks a caption track after each sentence', () => {
    expect(captionLines('Hi Mum. The garden is done! See you Sunday?')).toEqual([
      'Hi Mum.',
      'The garden is done!',
      'See you Sunday?',
    ]);
  });

  it('keeps text with no sentence break as one line', () => {
    expect(captionLines('  see you at three  ')).toEqual(['see you at three']);
  });

  it('returns no lines for blank text', () => {
    expect(captionLines('   ')).toEqual([]);
  });
});
