/**
 * Makes everything on the page except `keep` inert, and returns a function
 * that undoes exactly that.
 *
 * `aria-modal="true"` asks a screen reader to stay inside a dialog, but not
 * every one honours it: the virtual cursor can still wander into the page
 * behind. `inert` removes that page from the accessibility tree and from
 * pointer and keyboard interaction outright (WCAG 1.3.2, 2.4.3).
 *
 * The dialogs render inline rather than in a portal, so the app root cannot
 * simply be made inert — the dialog is inside it. Instead every sibling on the
 * path from `keep` up to <body> is marked, which leaves `keep` and its
 * ancestors usable and nothing else. Elements that were already inert are left
 * alone, so closing one dialog never wakes up something another made inert.
 * Calling the returned function a second time does nothing.
 */
export function inertOutside(keep: Element): () => void {
  const marked: Element[] = [];
  let node: Element | null = keep;
  while (node && node !== document.body && node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || sibling.hasAttribute('inert') || sibling instanceof HTMLScriptElement) continue;
      sibling.setAttribute('inert', '');
      marked.push(sibling);
    }
    node = node.parentElement;
  }
  return () => {
    for (const element of marked.splice(0)) element.removeAttribute('inert');
  };
}
