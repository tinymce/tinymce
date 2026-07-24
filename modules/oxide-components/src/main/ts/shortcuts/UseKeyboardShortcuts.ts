import { Fun } from '@ephox/katamari';
import { useEffect, type RefObject } from 'react';

import { attachShortcutListener, type AttachOptions, type KeyboardShortcut } from './internals/AttachShortcutListener';

// TODO: TINY-13828 Support shift shortcuts

/**
 * Attaches `keydown` listeners to a container element and invokes handlers when a matching shortcut
 * is pressed. On match, the event is consumed (`stopPropagation` + `preventDefault`).
 *
 * **Pattern syntax**
 *
 * Patterns are strings composed of tokens joined by `+`. Each pattern must contain exactly one key
 * and any number of modifiers.
 *
 * Modifiers:
 *   - `ctrl`  — Requires Ctrl key
 *   - `alt`   — Requires Alt key
 *   - `shift` — Requires Shift key
 *   - `meta`  — Requires Cmd on macOS, maps to Ctrl on other platforms
 *
 * Keys: any `event.key` value in lowercase, plus the special token `space` for the spacebar.
 *
 * Examples:
 *   "ctrl+s"          → Ctrl + S
 *   "meta+shift+z"    → Cmd+Shift+Z (macOS) / Ctrl+Shift+Z (other)
 *   "alt+arrowdown"   → Alt + ↓
 *   "meta+space"      → Cmd+Space (macOS) / Ctrl+Space (other)
 *
 * Matching is case-insensitive — both the pattern and `event.key` are lowercased before comparison.
 *
 * For letter/digit keys, when `event.key` does not match, matching falls back to `event.code`
 * (e.g. `KeyS`, `Digit5`, `Numpad5`). This handles Mac Option-key transforms (e.g. Option+S
 * produces `event.key='ß'`) and makes shortcuts layout-independent. As a side effect, digit
 * shortcuts like `ctrl+alt+1` match both the main keyboard 1 and the numeric keypad 1.
 *
 * **Options**
 *
 * Pass `{ capture: true }` when the shortcut's focused target sits inside a component that
 * intercepts the same key in its own bubble-phase handler. Example: `useFlowKeyNavigation`
 * swallows arrow keys for toolbar focus management, so a bubble-phase arrow-key shortcut
 * attached on a wrapping container never fires.
 *
 * **Limitations**
 *
 * Shift + non-letter keys are unreliable. Matching uses `event.key`, which reflects the character
 * produced after Shift is applied. For example, `shift+1` produces `"!"` on a US layout but a
 * different character on other layouts. `shift+letter` works correctly (e.g. `shift+a`) because
 * both sides are lowercased. Shift combinations with digits or symbols should be avoided until
 * this is addressed. See TINY-13828
 */
const useKeyboardShortcuts = (
  containerRef: RefObject<HTMLElement>,
  shortcuts: KeyboardShortcut[],
  options?: AttachOptions
): void => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return Fun.noop();
    }
    const binder = attachShortcutListener(container, shortcuts, options);
    return () => binder.unbind();
  }, [ containerRef, shortcuts, options ]);
};

export {
  attachShortcutListener,
  useKeyboardShortcuts
};
export type { KeyboardShortcut, AttachOptions };
