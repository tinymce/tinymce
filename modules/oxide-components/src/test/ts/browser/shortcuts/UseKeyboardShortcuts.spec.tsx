import { Fun } from '@ephox/katamari';
import { useKeyboardShortcuts, type KeyboardShortcut } from 'oxide-components/shortcuts/UseKeyboardShortcuts';
import { createRef, useRef, type RefObject } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const TestWrapper = ({ shortcuts, inputRef }: {
  shortcuts: KeyboardShortcut[];
  inputRef: RefObject<HTMLInputElement>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useKeyboardShortcuts(containerRef, shortcuts);
  return (
    <div ref={containerRef}>
      <input type="text" ref={inputRef} />
    </div>
  );
};

const createCtrlKEvent = (): KeyboardEvent =>
  new KeyboardEvent('keydown', {
    key: 'k',
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    bubbles: true
  });

const renderTestWrapper = (shortcuts: KeyboardShortcut[]) => {
  const inputRef = createRef<HTMLInputElement>();
  const screen = render(<TestWrapper shortcuts={shortcuts} inputRef={inputRef} />);

  return {
    screen,
    getInput: () => {
      if (inputRef.current === null) {
        throw new Error('inputRef was not populated after render');
      }
      return inputRef.current;
    },
    rerenderWithShortcuts: (nextShortcuts: KeyboardShortcut[]) =>
      screen.rerender(<TestWrapper shortcuts={nextShortcuts} inputRef={inputRef} />)
  };
};

describe('browser.shortcuts.UseKeyboardShortcutsTest', () => {
  it('should fire handler on matching keydown event', () => {
    let callCount = 0;
    const shortcuts: KeyboardShortcut[] = [
      { pattern: 'Ctrl + K', handler: () => callCount++ }
    ];

    const { getInput } = renderTestWrapper(shortcuts);
    getInput().dispatchEvent(createCtrlKEvent());

    expect(callCount, 'Handler should have been called once').toBe(1);
  });

  it('should only fire the first matching shortcut handler', () => {
    let firstCallCount = 0;
    let secondCallCount = 0;
    const shortcuts: KeyboardShortcut[] = [
      { pattern: 'Ctrl + K', handler: () => firstCallCount++ },
      { pattern: 'Ctrl + K', handler: () => secondCallCount++ }
    ];

    const { getInput } = renderTestWrapper(shortcuts);
    getInput().dispatchEvent(createCtrlKEvent());

    expect(firstCallCount, 'First handler should have been called once').toBe(1);
    expect(secondCallCount, 'Second handler should not have been called').toBe(0);
  });

  it('should remove event listener on effect cleanup', () => {
    let firstCallCount = 0;
    let secondCallCount = 0;

    const { getInput, rerenderWithShortcuts } = renderTestWrapper([
      { pattern: 'Ctrl+K', handler: () => firstCallCount++ }
    ]);
    // Passing a new shortcuts array to the effect should execute its cleanup function
    rerenderWithShortcuts([
      { pattern: 'Ctrl+K', handler: () => secondCallCount++ }
    ]);
    getInput().dispatchEvent(createCtrlKEvent());

    expect(firstCallCount, 'First handler should not have been called').toBe(0);
    expect(secondCallCount, 'Second handler should have been called once').toBe(1);
  });

  it('should call stopPropagation and preventDefault on matched event', () => {
    const shortcuts: KeyboardShortcut[] = [
      { pattern: 'Ctrl+K', handler: Fun.noop }
    ];
    let stopPropagationCalled = false;
    let preventDefaultCalled = false;

    const { getInput } = renderTestWrapper(shortcuts);
    const event = createCtrlKEvent();
    event.stopPropagation = () => {
      stopPropagationCalled = true;
    };
    event.preventDefault = () => {
      preventDefaultCalled = true;
    };
    getInput().dispatchEvent(event);

    expect(stopPropagationCalled, 'stopPropagation should have been called').toBe(true);
    expect(preventDefaultCalled, 'preventDefault should have been called').toBe(true);
  });
});
