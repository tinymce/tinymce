import { Fun } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Rtc from '../Rtc';
import { Content, GetContentArgs, ContentFormat } from './ContentTypes';
import { postProcessGetContent, preProcessGetContent } from './PrePostProcess';

const defaultFormat = 'html';

const setupArgs = (args: Partial<GetContentArgs>, format: ContentFormat): GetContentArgs => ({
  ...args,
  format,
  get: true,
  getInner: true
});

export const getContent = (editor: Editor, args: Partial<GetContentArgs> = {}): Content => {
  const format = args.format ? args.format : defaultFormat;
  const defaultedArgs = setupArgs(args, format);
  return preProcessGetContent(editor, defaultedArgs).fold(Fun.identity, (updatedArgs) => {
    const content = Rtc.getContent(editor, updatedArgs);
    return postProcessGetContent(editor, content, updatedArgs);
  });
};
