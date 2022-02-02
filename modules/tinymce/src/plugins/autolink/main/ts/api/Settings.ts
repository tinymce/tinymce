/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Regexes } from '@ephox/polaris';

import Editor from 'tinymce/core/api/Editor';

// Use the Polaris link detection, however for autolink we need to make it be an exact match
const defaultLinkPattern = new RegExp('^' + Regexes.link().source + '$', 'i');

const getAutoLinkPattern = (editor: Editor): RegExp =>
  editor.getParam('autolink_pattern', defaultLinkPattern);

const getDefaultLinkTarget = (editor: Editor): boolean =>
  editor.getParam('default_link_target', false);

const getDefaultLinkProtocol = (editor: Editor): string =>
  editor.getParam('link_default_protocol', 'http', 'string');

export {
  getAutoLinkPattern,
  getDefaultLinkTarget,
  getDefaultLinkProtocol
};
