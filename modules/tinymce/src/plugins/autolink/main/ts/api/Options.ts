import { Regexes } from '@ephox/polaris';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('autolink_pattern', {
    processor: 'regexp',
    // Use the Polaris link detection, however for autolink we need to make it be an exact match
    default: new RegExp('^' + Regexes.link().source + '$', 'i')
  });

  registerOption('link_default_target', {
    processor: 'string'
  });

  registerOption('link_default_protocol', {
    processor: 'string',
    default: 'https'
  });
};

const getAutoLinkPattern = option<RegExp>('autolink_pattern');
const getDefaultLinkTarget = option<string | undefined>('link_default_target');
const getDefaultLinkProtocol = option<string>('link_default_protocol');
const allowUnsafeLinkTarget = option('allow_unsafe_link_target');

export {
  register,
  allowUnsafeLinkTarget,
  getAutoLinkPattern,
  getDefaultLinkTarget,
  getDefaultLinkProtocol
};
