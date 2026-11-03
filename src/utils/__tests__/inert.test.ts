import { inertOutside } from '../inert';

function page() {
  document.body.innerHTML = `
    <div id="root">
      <header id="header"><button>Menu</button></header>
      <main id="main">
        <p id="before">Page content</p>
        <div id="wrapper"><div id="overlay"></div><div id="dialog" role="dialog"></div></div>
        <p id="after">More content</p>
      </main>
      <footer id="footer"></footer>
    </div>
    <div id="toast"></div>`;
  return (id: string) => document.getElementById(id)!;
}

describe('inertOutside', () => {
  it('makes everything outside the kept element inert, at every level up to <body>', () => {
    const $ = page();
    inertOutside($('wrapper'));

    for (const id of ['header', 'before', 'after', 'footer', 'toast']) {
      expect($(id)).toHaveAttribute('inert');
    }
  });

  it('leaves the kept element, its contents and its ancestors usable', () => {
    // The overlay closes the dialog on click, so it must stay interactive.
    const $ = page();
    inertOutside($('wrapper'));

    for (const id of ['wrapper', 'overlay', 'dialog', 'main', 'root']) {
      expect($(id)).not.toHaveAttribute('inert');
    }
  });

  it('restores exactly what it changed', () => {
    const $ = page();
    const restore = inertOutside($('wrapper'));
    restore();

    expect(document.querySelectorAll('[inert]')).toHaveLength(0);
  });

  it('can be restored twice without harm', () => {
    const $ = page();
    const restore = inertOutside($('wrapper'));
    restore();
    $('footer').setAttribute('inert', '');
    restore();

    // The second call did not undo the footer's later, unrelated inert.
    expect($('footer')).toHaveAttribute('inert');
  });

  it('does not wake up an element something else made inert', () => {
    const $ = page();
    $('footer').setAttribute('inert', '');
    const restore = inertOutside($('wrapper'));
    restore();

    expect($('footer')).toHaveAttribute('inert');
    expect($('header')).not.toHaveAttribute('inert');
  });

  it('never marks scripts', () => {
    const $ = page();
    const script = document.createElement('script');
    document.body.appendChild(script);
    inertOutside($('wrapper'));

    expect(script).not.toHaveAttribute('inert');
  });
});
