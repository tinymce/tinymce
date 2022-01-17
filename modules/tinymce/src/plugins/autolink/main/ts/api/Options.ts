/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Regexes } from '@ephox/polaris';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
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
const getDefaultLinkTarget = option<string>('link_default_target');
const getDefaultLinkProtocol = option<string>('link_default_protocol');

export {
  register,
  getAutoLinkPattern,
  getDefaultLinkTarget,
  getDefaultLinkProtocol
};
