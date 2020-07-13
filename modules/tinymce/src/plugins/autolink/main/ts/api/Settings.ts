/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getAutoLinkPattern = (editor: Editor) =>
  editor.getParam('autolink_pattern', /^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.|(?:mailto:)?[A-Z0-9._%+\-]+@(?!.*@))(.+)$/i);

const getDefaultLinkTarget = getSetting('default_link_target', false);

const getDefaultLinkProtocol = getSetting('link_default_protocol', 'http', 'string');

export {
  getAutoLinkPattern,
  getDefaultLinkTarget,
  getDefaultLinkProtocol
};
