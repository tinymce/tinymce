import { Fun } from '@ephox/katamari';
import { Compare, Css, SugarElement, TransformFind } from '@ephox/sugar';

import Editor from '../api/Editor';
import { mapRange } from '../selection/RangeMap';

export const lineHeightQuery = (editor: Editor): string => mapRange(editor, (elm) => {
  const root = SugarElement.fromDom(editor.getBody());

  const specifiedStyle = TransformFind.closest(elm, (elm) => Css.getRaw(elm, 'line-height'), Fun.curry(Compare.eq, root));
  const computedStyle = () => {
    // Css.get returns computed values (in px), and parseFloat will strip any non-number suffix
    const lineHeight = parseFloat(Css.get(elm, 'line-height'));
    const fontSize = parseFloat(Css.get(elm, 'font-size'));
    return String(lineHeight / fontSize);
  };

  return specifiedStyle.getOrThunk(computedStyle);
}).getOr('');

export const lineHeightAction = (editor: Editor, lineHeight: number): void => {
  editor.formatter.toggle('lineheight', { value: String(lineHeight) });
  editor.nodeChanged();
};
