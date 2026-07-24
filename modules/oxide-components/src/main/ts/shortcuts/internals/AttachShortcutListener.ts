import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, SugarElement, type EventUnbinder } from '@ephox/sugar';

import * as PatternCompiler from './PatternCompiler';

export interface KeyboardShortcut {
  readonly pattern: string;
  readonly handler: () => void;
}

export interface AttachOptions {
  readonly capture?: boolean;
}

/**
 * Attaches a `keydown` listener to `target` that invokes the matching shortcut's handler.
 * On match, the event is consumed (`stopPropagation` + `preventDefault`).
 *
 * Set `options.capture` to `true` when the focused element sits inside a component that
 * intercepts the same key in its own bubble-phase handler (e.g. `useFlowKeyNavigation`
 * swallows arrow keys for toolbar focus management).
 *
 * Returns an unbinder; call `unbinder.unbind()` to detach.
 */
export const attachShortcutListener = (
  target: Node,
  shortcuts: KeyboardShortcut[],
  options: AttachOptions = {}
): EventUnbinder => {
  const platform = PlatformDetection.detect();
  const isMac = platform.os.isiOS() || platform.os.isMacOS();
  const compiled = Arr.map(shortcuts, ({ pattern, handler }) => ({
    test: PatternCompiler.compile(pattern, isMac),
    handler
  }));

  const onKeyDown = (e: { raw: KeyboardEvent; stop: () => void; prevent: () => void }) => {
    Arr.find(compiled, (s) => s.test(e.raw)).each((s) => {
      e.stop();
      e.prevent();
      s.handler();
    });
  };

  const bindFn = options.capture ? DomEvent.capture : DomEvent.bind;
  return bindFn<KeyboardEvent>(SugarElement.fromDom(target), 'keydown', onKeyDown);
};
