import type { ReactNode } from 'react';

/**
 * Desktop layout: the contact list on the left and the open conversation on
 * the right, as the design draws it at 1440px. The conversation pane is as
 * tall as the window allows, so its history scrolls inside it and the message
 * field stays in view. It is not sticky: the shared header above is, and a
 * second sticky layer would slide underneath it.
 */
export default function ContactsTwoPane({ list, conversation }: { list: ReactNode; conversation: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(19rem,22rem)_1fr] gap-6 items-start">
      <div className="min-w-0">
        {list}
      </div>
      <div className="min-w-0 h-[calc(100vh-14rem)] min-h-[30rem]">{conversation}</div>
    </div>
  );
}
