import { SugarElement, Visibility } from '@ephox/sugar';

import type { Height, RowMetrics } from './AutoResizingTextareaTypes';

interface ComputeMaxRowsProps {
  readonly maxHeight: Height;
  readonly metrics: RowMetrics;
}

interface ComputeMinRowsProps {
  readonly minHeight: Height;
  readonly metrics: RowMetrics;
}

interface ComputeNewRowsProps {
  readonly minRows: number;
  readonly maxRows: number;
  readonly metrics: RowMetrics;
  readonly textarea: HTMLTextAreaElement;
}

// scrollHeight includes the vertical padding once for the whole element, not once per
// row, so measuring one and two rows is what separates the per-row line height from
// that fixed padding. Without the split, a pixel budget is charged the padding on every
// row and resolves to fewer rows than it should.
const computeRowMetrics = (textarea: HTMLTextAreaElement): RowMetrics => {
  const originalRows = textarea.rows;
  const originalValue = textarea.value;
  textarea.value = '';

  const scrollHeightAtRows = (rows: number): number => {
    textarea.rows = rows;
    return textarea.scrollHeight;
  };

  const oneRow = scrollHeightAtRows(1);
  const twoRows = scrollHeightAtRows(2);
  textarea.rows = originalRows;
  textarea.value = originalValue;

  const delta = twoRows - oneRow;
  if (delta <= 0) {
    return { lineHeight: Math.max(oneRow, 1), padding: 0 };
  }

  return { lineHeight: delta, padding: Math.max(oneRow - delta, 0) };
};

const rowsForHeight = (height: number, { lineHeight, padding }: RowMetrics, round: (value: number) => number): number =>
  Math.max(round((height - padding) / lineHeight), 1);

const computeMaxRows = ({ maxHeight, metrics }: ComputeMaxRowsProps): number => {
  if (maxHeight.unit === 'rows') {
    return Math.max(maxHeight.value, 1);
  }

  return rowsForHeight(maxHeight.value, metrics, Math.floor);
};

const computeMinRows = ({ minHeight, metrics }: ComputeMinRowsProps): number => {
  if (minHeight.unit === 'rows') {
    return Math.max(minHeight.value, 1);
  }

  return rowsForHeight(minHeight.value, metrics, Math.ceil);
};

const resizeTextarea = ({ minRows, maxRows, metrics, textarea }: ComputeNewRowsProps): void => {
  if (!Visibility.isVisible(SugarElement.fromDom(textarea))) {
    return;
  }
  textarea.rows = minRows;

  const { scrollHeight } = textarea;
  // In mathematical terms: newRows = (contentRows) such as minRows <= newRows <= maxRows
  const newRows = Math.min(Math.max(minRows, rowsForHeight(scrollHeight, metrics, Math.ceil)), maxRows);
  textarea.rows = newRows;
};

export {
  computeMaxRows,
  computeMinRows,
  computeRowMetrics,
  resizeTextarea
};
