import { Type } from '@ephox/katamari';
import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';

import { classes } from '../../utils/Styles';

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

  // Here we use the useState hook instead of useMemo, because computing the singleRowHeight
  // requires the textareaRef.current to be available, but useMemo is computed before the render,
  //  so we set it to 1 initially and update it in the useLayoutEffect
  const [ singleRowHeight, setSingleRowHeight ] = useState(1);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      setSingleRowHeight(computeSingleRowHeight(textareaRef.current));
    }
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
    className={`${classes([ 'tox-textarea' ])} ${className ?? ''}`}
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
