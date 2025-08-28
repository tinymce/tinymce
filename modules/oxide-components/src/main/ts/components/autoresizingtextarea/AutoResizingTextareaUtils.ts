import type { Height } from './AutoResizingTextareaTypes';

interface ComputeMaxRowsProps {
  readonly maxHeight: Height;
  readonly singleRowHeight: number;
}

const computeSingleRowHeight = (textarea: HTMLTextAreaElement): number => {
  const originalRows = textarea.rows;
  const originalValue = textarea.value;
  textarea.value = '';
  textarea.rows = 1;
  const res = textarea.scrollHeight;
  textarea.rows = originalRows;
  textarea.value = originalValue;
  return res;
};

const computeMaxRows = ({ maxHeight, singleRowHeight }: ComputeMaxRowsProps): number => {
  if (maxHeight.unit === 'rows') {
    return Math.max(maxHeight.value, 1);
  }

  const maxRows = Math.floor(maxHeight.value / singleRowHeight);
  return Math.max(maxRows, 1);
};

interface ComputeMinRowsProps {
  readonly minHeight: Height;
  readonly singleRowHeight: number;
}
const computeMinRows = ({ minHeight, singleRowHeight }: ComputeMinRowsProps): number => {
  if (minHeight.unit === 'rows') {
    return Math.max(minHeight.value, 1);
  }

  const minRows = Math.ceil(minHeight.value / singleRowHeight);
  return Math.max(minRows, 1);
};

interface ComputeNewRowsProps {
  readonly minRows: number;
  readonly maxRows: number;
  readonly singleRowHeight: number;
  readonly textarea: HTMLTextAreaElement;
}

const resizeTextarea = ({ minRows, maxRows, singleRowHeight, textarea }: ComputeNewRowsProps): void => {
  textarea.rows = minRows;

  const { scrollHeight } = textarea;
  // In mathematical terms: newRows = (clientHeight / singleRowHeight) such as minRows <= newRows <= maxRows
  const newRows = Math.min(Math.max(minRows, Math.ceil(scrollHeight / singleRowHeight)), maxRows);
  textarea.rows = newRows;
};

export {
  computeMaxRows,
  computeMinRows,
  computeSingleRowHeight,
  resizeTextarea
};
