import * as NodeType from '../dom/NodeType';
import * as Zwsp from '../text/Zwsp';

export const isValidTextRange = (rng: Range): boolean =>
  rng.collapsed && NodeType.isText(rng.startContainer);

// Normalize the text by replacing non-breaking spaces with regular spaces and stripping zero-width spaces (fake carets).
export const getText = (rng: Range): string =>
  Zwsp.trim(rng.toString().replace(/\u00A0/g, ' '));

export const isWhitespace = (chr: string): boolean =>
  chr !== '' && ' \u00a0\f\n\r\t\v'.indexOf(chr) !== -1;
