import { screen } from '@testing-library/react-native';
import { renderApp } from '../../test-support/harness';
import { type } from '../../theme/typography';

describe('accessibility and theme adherence', () => {
  it('Dashboard greeting uses header role and large font size', async () => {
    await renderApp({ initialTabName: 'Home' });
    const greeting = await screen.findByRole('header', { name: /Here's your day, Margaret/ });

    expect(greeting).toBeTruthy();
    // HomeScreen has a specific font size of 28 for this greeting
    const styles = Array.isArray(greeting.props.style) ? greeting.props.style : [greeting.props.style];
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: 28 })]));
  });

  it('My Day title uses screenTitle size and header role', async () => {
    await renderApp({ initialTabName: 'MyDay' });
    const title = await screen.findByRole('header', { name: 'My Day' });

    expect(title).toBeTruthy();
    const styles = Array.isArray(title.props.style) ? title.props.style : [title.props.style];
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: type.screenTitle.fontSize })]));
  });

  it('Medicines title uses screenTitle size and header role', async () => {
    await renderApp({ initialTabName: 'Medicines' });
    const title = await screen.findByRole('header', { name: 'Medicines' });

    expect(title).toBeTruthy();
    const styles = Array.isArray(title.props.style) ? title.props.style : [title.props.style];
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: type.screenTitle.fontSize })]));
  });

  it('AppButtons have minimum touch target height', async () => {
    await renderApp({ initialRouteName: 'Welcome' });
    const getStartedBtn = await screen.findByLabelText(/Get started/);

    // layout.minTouchTarget is 48
    const styles = Array.isArray(getStartedBtn.props.style) ? getStartedBtn.props.style : [getStartedBtn.props.style];
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ minHeight: 48 })]));
  });

  it('Progress bars have correct accessibility attributes', async () => {
    await renderApp({ initialTabName: 'Home' });
    const progress = await screen.findByLabelText('Daily task progress');

    expect(progress.props.accessibilityRole).toBe('progressbar');
    expect(progress.props.accessibilityValue).toBeDefined();
    expect(progress.props.accessibilityValue.text).toContain('0 of 7 tasks completed');
  });
});
