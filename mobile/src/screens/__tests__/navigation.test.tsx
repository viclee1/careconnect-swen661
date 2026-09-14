import { act, fireEvent, screen, within } from '@testing-library/react-native';

import { renderApp, useTabletSize } from '../../test-support/harness';

describe('navigation', () => {
  it('opens on Contacts', async () => {
    await renderApp();
    expect(await screen.findByText('People who care for you')).toBeTruthy();
  });

  it('goes from the list into a conversation and back again', async () => {
    await renderApp();

    await fireEvent.press(await screen.findByTestId('contact-c2'));
    expect(await screen.findByTestId('notify-button')).toBeTruthy();
    expect(screen.queryByTestId('contact-c2')).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Back to contacts'));
    });

    expect(await screen.findByTestId('contact-c2')).toBeTruthy();
    expect(screen.queryByTestId('notify-button')).toBeNull();
  });

  it('opening a conversation clears its badge on the list', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');
    expect(screen.getAllByText('waiting', { includeHiddenElements: true })).toHaveLength(2);

    await fireEvent.press(screen.getByTestId('contact-c1'));
    await screen.findByTestId('notify-button');

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Back to contacts'));
    });

    // Joyce's badge is gone; Maria's is untouched. The two screens share one
    // provider, so nothing had to be passed back through the route.
    await screen.findByTestId('contact-c1');
    expect(screen.getAllByText('waiting', { includeHiddenElements: true })).toHaveLength(1);
  });

  it("the bottom bar reaches a teammate's screen", async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Medicines'));
    });

    expect(await screen.findByText('Medicines is still being built')).toBeTruthy();
    expect(screen.getByText(/Rehman/)).toBeTruthy();
    expect(screen.queryByTestId('contact-c1')).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Contacts'));
    });

    expect(await screen.findByTestId('contact-c1')).toBeTruthy();
  });

  it('the bar stays mounted while the page underneath changes', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Memories'));
    });

    // The bar belongs to the navigator, not to any screen, so every
    // destination is still there after the page swaps.
    for (const destination of ['Home', 'MyDay', 'Appointments', 'Medicines', 'Memories', 'Contacts']) {
      expect(screen.getByTestId(`tab-${destination}`)).toBeTruthy();
    }
  });

  it('marks the current tab as selected, not just tinted', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');

    expect(screen.getByTestId('tab-Contacts').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('tab-Home').props.accessibilityState.selected).toBe(false);

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Home'));
    });

    expect(screen.getByTestId('tab-Home').props.accessibilityState.selected).toBe(true);
  });

  it('the header gear opens Settings, which hides the bar', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');
    expect(screen.getByTestId('tab-Appointments')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Settings'));

    expect(await screen.findByText('Accessibility Settings')).toBeTruthy();
    // Settings is somewhere you come back from, not a tab.
    expect(screen.queryByTestId('tab-Appointments')).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Back to contacts'));
    });

    expect(await screen.findByTestId('contact-c1')).toBeTruthy();
    expect(screen.getByTestId('tab-Appointments')).toBeTruthy();
  });

  it('the caption warning links through to Settings', async () => {
    await renderApp({ settings: { captionsEnabled: false } });

    await fireEvent.press(await screen.findByTestId('contact-c3'));
    await screen.findByTestId('notify-button');

    expect(screen.getByText('Captions are turned off')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByText('Open settings'));
    });

    expect(await screen.findByText('Accessibility Settings')).toBeTruthy();
  });

  it('a teammate placeholder can reach Settings too', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Home'));
    });
    await screen.findByText('Home is still being built');

    await fireEvent.press(screen.getByLabelText('Settings'));
    expect(await screen.findByText('Accessibility Settings')).toBeTruthy();
  });

  it('on a tablet, a sidebar with full labels replaces the bottom bar and lists Settings', async () => {
    useTabletSize();
    await renderApp();
    await screen.findByTestId('contact-c1');

    // Full labels, not the phone bar's cramped abbreviations.
    expect(within(screen.getByTestId('tab-Appointments')).getByText('Appointments')).toBeTruthy();

    // The sidebar carries Settings itself, so the header gear is gone.
    expect(screen.queryByLabelText('Settings')).toBeNull();
    expect(screen.getByTestId('tab-Settings')).toBeTruthy();
  });

  it("the tablet sidebar's Settings item opens Settings", async () => {
    useTabletSize();
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Settings'));
    });

    expect(await screen.findByText('Accessibility Settings')).toBeTruthy();
  });

  it('the tablet sidebar reaches a teammate screen, same as the bottom bar', async () => {
    useTabletSize();
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Medicines'));
    });

    expect(await screen.findByText('Medicines is still being built')).toBeTruthy();
    expect(screen.queryByTestId('contact-c1')).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Contacts'));
    });

    expect(await screen.findByTestId('contact-c1')).toBeTruthy();
  });

  it('a teammate placeholder also drops its header gear on a tablet', async () => {
    useTabletSize();
    await renderApp();
    await screen.findByTestId('contact-c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('tab-Home'));
    });

    // The sidebar carries Settings on every tab, placeholders included, so
    // the header gear must not reappear as a second way to reach it.
    expect(await screen.findByText('Home is still being built')).toBeTruthy();
    expect(screen.queryByLabelText('Settings')).toBeNull();
    expect(screen.getByTestId('tab-Settings')).toBeTruthy();
  });
});
