import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockVideoCall } from '../MockVideoCall';

describe('MockVideoCall', () => {
  it('renders incoming call overlay and answers the call', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<MockVideoCall onClose={onClose} />);

    expect(screen.getByText('INCOMING VIDEO CALL')).toBeInTheDocument();
    expect(screen.getByText('Screen is flashing — Maria is calling')).toBeInTheDocument();

    const answerBtn = screen.getByRole('button', { name: /answer video call/i });
    await user.click(answerBtn);

    expect(await screen.findByRole('region', { name: /active video call with maria/i })).toBeInTheDocument();
    expect(screen.getByText(/Hi Mum! Can you hear me?/)).toBeInTheDocument();
  });

  it('declines call when decline button is pressed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<MockVideoCall onClose={onClose} />);

    const declineBtn = screen.getByRole('button', { name: /decline video call/i });
    await user.click(declineBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('toggles captions, mute, and audio pause during active call', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<MockVideoCall onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /answer video call/i }));

    expect(screen.getByText(/Hi Mum! Can you hear me?/)).toBeInTheDocument();

    // Toggle hide captions
    const hideCaptionsBtn = screen.getByRole('button', { name: /hide captions/i });
    await user.click(hideCaptionsBtn);

    expect(screen.queryByText(/Hi Mum! Can you hear me?/)).not.toBeInTheDocument();

    // Toggle show captions back
    const showCaptionsBtn = screen.getByRole('button', { name: /show captions/i });
    await user.click(showCaptionsBtn);

    expect(screen.getByText(/Hi Mum! Can you hear me?/)).toBeInTheDocument();

    // Toggle mute
    const muteBtn = screen.getByRole('button', { name: /mute microphone/i });
    await user.click(muteBtn);
    expect(screen.getByRole('button', { name: /unmute microphone/i })).toBeInTheDocument();

    // Toggle pause audio
    const pauseBtn = screen.getByRole('button', { name: /pause audio/i });
    await user.click(pauseBtn);
    expect(screen.getByRole('button', { name: /resume audio/i })).toBeInTheDocument();

    // End call
    const endCallBtn = screen.getByRole('button', { name: /end video call/i });
    await user.click(endCallBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
