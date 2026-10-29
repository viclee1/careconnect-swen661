import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MockVideoCall from './MockVideoCall';
import { SETTINGS_KEY } from '../context/SettingsContext';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const storedSettings = () => JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');

function renderCall(onClose = jest.fn()) {
  renderWithProviders(<MockVideoCall onClose={onClose} />);
  return onClose;
}

async function answer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Answer video call' }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('Simulated incoming video call', () => {
  it('announces the call in words, never by sound alone', () => {
    renderCall();
    expect(screen.getByText('Screen is flashing — Maria is calling')).toBeInTheDocument();
    expect(screen.getByText('Live captions will be on during the call')).toBeInTheDocument();
  });

  it('says captions are off, and how to turn them on, when the user has them off', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionsEnabled: false }));
    renderCall();
    expect(screen.getByText('Captions are off — you can turn them on during the call')).toBeInTheDocument();
  });

  it('declining closes the call without answering it', async () => {
    const user = userEvent.setup();
    const onClose = renderCall();
    await user.click(screen.getByRole('button', { name: 'Decline video call' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('answered, it shows the live caption in the size and colour chosen in Settings', async () => {
    const user = userEvent.setup();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionSize: 'large', captionColor: 'yellow' }));
    renderCall();
    await answer(user);
    const caption = screen.getByText(/Can you hear me\?/);
    expect(screen.getByText('[CC LIVE]')).toBeInTheDocument();
    // Large is 1.6 × the 18px base; yellow is broadcast yellow.
    expect(caption).toHaveStyle({ fontSize: '28.8px', color: '#FFFF00' });
  });

  it('hides and shows captions, and the choice carries back to Settings', async () => {
    const user = userEvent.setup();
    renderCall();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'Hide captions' }));
    expect(screen.queryByText('[CC LIVE]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show captions' })).toHaveAttribute('aria-pressed', 'false');
    expect(storedSettings().captionsEnabled).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Show captions' }));
    expect(screen.getByText('[CC LIVE]')).toBeInTheDocument();
    expect(storedSettings().captionsEnabled).toBe(true);
  });

  it('mutes the microphone and pauses the audio, each as a pressed toggle', async () => {
    const user = userEvent.setup();
    renderCall();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'Mute microphone' }));
    expect(screen.getByRole('button', { name: 'Unmute microphone' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Unmute microphone' }));
    expect(screen.getByRole('button', { name: 'Mute microphone' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'Pause audio' }));
    expect(screen.getByRole('button', { name: 'Resume audio' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Resume audio' }));
    expect(screen.getByRole('button', { name: 'Pause audio' })).toBeInTheDocument();
  });

  it('volume and balance change the saved preferences, and the volume is read out', async () => {
    const user = userEvent.setup();
    renderCall();
    await answer(user);
    fireEvent.change(screen.getByRole('slider', { name: /Call volume/ }), { target: { value: '30' } });
    expect(screen.getByRole('slider', { name: 'Call volume 30%' })).toHaveValue('30');
    expect(storedSettings().alertVolume).toBeCloseTo(0.3);

    fireEvent.change(screen.getByRole('slider', { name: 'Audio balance' }), { target: { value: '-0.5' } });
    expect(storedSettings().audioBalance).toBe(-0.5);
  });

  it('ends the call', async () => {
    const user = userEvent.setup();
    const onClose = renderCall();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'End video call' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
