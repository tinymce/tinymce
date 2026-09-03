import { Cell, Singleton, Type } from '@ephox/katamari';
import { SugarElement, Visibility } from '@ephox/sugar';
import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type KeyboardEventHandler, type MutableRefObject } from 'react';

import * as Bem from '../../utils/Bem';

import type { Height, RowMetrics } from './AutoResizingTextareaTypes';
import { computeMaxRows, computeMinRows, computeRowMetrics, resizeTextarea } from './AutoResizingTextareaUtils';

const defaultMinHeight: Height = {
  unit: 'rows',
  value: 1
};

const defaultMaxHeight: Height = {
  unit: 'rows',
  value: 4
};

export interface AutoResizingTextareaProps {
  readonly maxHeight?: Height;
  readonly minHeight?: Height;
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly tabIndex?: number;
}

export const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(({
  maxHeight = defaultMaxHeight,
  minHeight = defaultMinHeight,
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
  tabIndex
}, ref) => {
  const textareaRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);

  // Initial lineHeight of 1 is a placeholder; the real values are measured once the textarea
  // actually has layout (it may mount inside a `display: none` ancestor — e.g. a collapsed
  // accordion — where `scrollHeight` reads 0). A ResizeObserver re-measures when layout returns.
  const [ metrics, setMetrics ] = useState<RowMetrics>({ lineHeight: 1, padding: 0 });

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (Type.isNullable(textarea)) {
      return;
    }

    const measured = Cell(false);
    const observer = Singleton.value<InstanceType<typeof window.ResizeObserver>>();

    const tryCompute = () => {
      if (measured.get() || !Visibility.isVisible(SugarElement.fromDom(textarea))) {
        return;
      }
      const value = computeRowMetrics(textarea);
      if (value.lineHeight > 1) {
        measured.set(true);
        setMetrics(value);
        // Once measured, we're done — stop observing so subsequent `rows`
        // mutations from `resizeTextarea` don't re-fire this callback (which
        // would surface as a `ResizeObserver loop` warning).
        observer.on((obs) => obs.disconnect());
        observer.clear();
      }
    };

    tryCompute();
    if (!measured.get()) {
      observer.set(new window.ResizeObserver(tryCompute));
      observer.on((obs) => obs.observe(textarea));
    }
    return () => observer.on((obs) => obs.disconnect());
  }, []);

  // The minRows and maxRows only need to be computed once per component instance, so they are in the useMemo hook
  const minRows = useMemo(() => computeMinRows({ minHeight, metrics }), [ minHeight, metrics ]);

  const maxRows = useMemo(() => computeMaxRows({ maxHeight, metrics }), [ maxHeight, metrics ]);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      resizeTextarea({
        textarea: textareaRef.current,
        minRows,
        maxRows,
        metrics
      });
    }
  }, [ value, minRows, maxRows, metrics ]);

  return <textarea
    className={Bem.block('tox-textarea')}
    value={value}
    disabled={disabled}
    placeholder={placeholder}
    tabIndex={tabIndex}
    onChange={(event) => {
      if (onChange) {
        onChange(event.target.value);
      }
    }}
    onKeyDown={onKeyDown}
    ref={(el) => {
      textareaRef.current = el;
      if (ref) {
        if (typeof ref === 'function') {
          ref(el);
        } else if (Type.isNonNullable(ref)) {
          ref.current = el;
        }
      }
    }}
  />;
});
