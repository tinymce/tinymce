export const zeroWidth = '\uFEFF';
export const nbsp = '\u00A0';
export const softHyphen = '\u00AD';

export const isZwsp = (char: string): boolean => char === zeroWidth;
export const removeZwsp = (s: string): string => s.replace(/\uFEFF/g, '');
