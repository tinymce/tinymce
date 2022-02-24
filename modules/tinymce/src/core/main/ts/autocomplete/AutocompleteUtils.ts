export const isValidTextRange = (rng: Range): boolean => rng.collapsed && rng.startContainer.nodeType === 3;

// Normalize the text by replacing non-breaking spaces with regular spaces and stripping zero-width spaces (fake carets).
export const getText = (rng: Range) => rng.toString().replace(/\u00A0/g, ' ').replace(/\uFEFF/g, '');

export const isWhitespace = (chr: string) => chr !== '' && ' \u00a0\f\n\r\t\v'.indexOf(chr) !== -1;
