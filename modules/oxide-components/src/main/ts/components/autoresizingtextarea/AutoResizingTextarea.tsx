import { Cell, Singleton, Type } from '@ephox/katamari';
import { SugarElement, Visibility } from '@ephox/sugar';
import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';

import * as Bem from '../../utils/Bem';

import type { Height } from './AutoResizingTextareaTypes';
import { computeMaxRows, computeMinRows, computeSingleRowHeight, resizeTextarea } from './AutoResizingTextareaUtils';

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
  readonly className?: string;
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}

export const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(({
  maxHeight = defaultMaxHeight,
  minHeight = defaultMinHeight,
  className,
  value,
  onChange,
  ...rest
}, ref) => {
  const textareaRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);

  // Initial value of 1 is a placeholder; the real value is measured once the textarea
  // actually has layout (it may mount inside a `display: none` ancestor — e.g. a collapsed
  // accordion — where `scrollHeight` reads 0). A ResizeObserver re-measures when layout returns.
  const [ singleRowHeight, setSingleRowHeight ] = useState(1);

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
      const value = computeSingleRowHeight(textarea);
      if (value > 1) {
        measured.set(true);
        setSingleRowHeight(value);
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
  const minRows = useMemo(() => computeMinRows({ minHeight, singleRowHeight }), [ minHeight, singleRowHeight ]);

  const maxRows = useMemo(() => computeMaxRows({ maxHeight, singleRowHeight }), [ maxHeight, singleRowHeight ]);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      resizeTextarea({
        textarea: textareaRef.current,
        minRows,
        maxRows,
        singleRowHeight
      });
    }
  }, [ value, minRows, maxRows, singleRowHeight ]);

  return <textarea
    {...rest}
    className={`${Bem.block('tox-textarea')} ${className ?? ''}`}
    value={value}
    onChange={(event) => {
      if (onChange) {
        onChange(event.target.value);
      }
    }}
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
