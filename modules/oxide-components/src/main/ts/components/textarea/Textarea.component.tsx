import { Type } from '@ephox/katamari';
import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type MutableRefObject, type TextareaHTMLAttributes } from 'react';

import { classes } from '../../utils/Styles';

export type Height = {
  unit: 'rows';
  value: number;
} | {
  unit: 'px';
  value: number;
};

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: Height;
  minHeight?: Height;
}

const defaultMinHeight = {
  unit: 'rows',
  value: 1
};

const defaultMaxHeight = {
  unit: 'rows',
  value: 4
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ maxHeight = defaultMaxHeight, minHeight = defaultMinHeight, onChange, value, ...rest }, ref) => {
  const textareaRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);
  const computeMaxRows = useCallback(() => {
    if (!maxHeight) {
      return Infinity;
    }
    if (maxHeight.unit === 'rows') {
      return Math.max(maxHeight.value, 1);
    }
    if (Type.isNonNullable(textareaRef.current)) {
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10) || 20;
      return Math.max(Math.floor(maxHeight.value / lineHeight), 1);
    }
    return 4;
  }, [ maxHeight ]);

  const computeMinRows = useCallback(() => {
    if (!minHeight) {
      return 1;
    }
    if (minHeight.unit === 'rows') {
      return Math.max(minHeight.value, 1);
    }
    if (Type.isNonNullable(textareaRef.current)) {
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10) || 20;
      return Math.max(Math.floor(minHeight.value / lineHeight), 1);
    }
    return 1;
  }, [ minHeight ]);

  const [ rows, setRows ] = useState(computeMinRows());

  useLayoutEffect(() => {
    if (textareaRef.current) {
      const minRows = computeMinRows();
      const maxRows = computeMaxRows();

      const textarea = textareaRef.current;

      // Create a hidden clone to measure content
      const clone = textarea.cloneNode() as HTMLTextAreaElement;
      clone.style.width = textarea.clientWidth + 'px';
      clone.style.visibility = 'hidden';
      clone.style.position = 'absolute';
      clone.rows = minRows;
      clone.value = textarea.value;

      textarea.parentNode?.appendChild(clone);

      // Measure the content height
      const scrollHeight = clone.scrollHeight;
      const lineHeight = parseInt(window.getComputedStyle(clone).lineHeight, 10) || 20;
      // In mathematical terms: newRows = (scrollHeight / lineHeight) such as minRows <= newRows <= maxRows
      const newRows = Math.min(Math.max(minRows, Math.floor(scrollHeight / lineHeight)), maxRows);

      if (newRows !== rows) {
        setRows(newRows);
      }

      clone.parentNode?.removeChild(clone);
    }
  }, [ rows, value, computeMinRows, computeMaxRows ]);

  return <textarea rows={rows} className={classes([ 'tox-textarea' ])} {...rest} ref={(el) => {
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
