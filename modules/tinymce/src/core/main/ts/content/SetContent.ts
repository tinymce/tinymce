import Editor from '../api/Editor';
import * as Rtc from '../Rtc';

import { Content, SetContentArgs } from './ContentTypes';
import { postProcessSetContent, preProcessSetContent } from './PrePostProcess';

const defaultFormat = 'html';

const setupArgs = (args: Partial<SetContentArgs>, content: Content): SetContentArgs => ({
  format: defaultFormat,
  ...args,
  set: true,
  content
});

export const setContent = (editor: Editor, content: Content, args: Partial<SetContentArgs> = {}): void => {
  const defaultedArgs = setupArgs(args, content);

  preProcessSetContent(editor, defaultedArgs).each((updatedArgs) => {
    const result = Rtc.setContent(editor, updatedArgs.content, updatedArgs);
    postProcessSetContent(editor, result.html, updatedArgs);
  });
};
