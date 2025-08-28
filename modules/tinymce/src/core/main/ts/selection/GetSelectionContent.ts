import Editor from '../api/Editor';
import { Content, ContentFormat, GetSelectionContentArgs } from '../content/ContentTypes';
import * as Rtc from '../Rtc';

const getContent = (editor: Editor, args: Partial<GetSelectionContentArgs> = {}): Content => {
  const format: ContentFormat = args.format ? args.format : 'html';

  return Rtc.getSelectedContent(editor, format, args);
};

export { getContent };
