/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AssumeExternalTargets } from './Types';
import Editor from 'tinymce/core/api/Editor';
import { ListItem } from '../ui/DialogTypes';
import { Type } from '@ephox/katamari';

const assumeExternalTargets = (editor: Editor): AssumeExternalTargets => {
  const externalTargets = editor.getParam('link_assume_external_targets', false);
  if (Type.isBoolean(externalTargets) && externalTargets) {
    return AssumeExternalTargets.WARN;
  } else if (Type.isString(externalTargets)
      && (externalTargets === AssumeExternalTargets.ALWAYS_HTTP
        || externalTargets === AssumeExternalTargets.ALWAYS_HTTPS)) {
    return externalTargets;
  }
  return AssumeExternalTargets.OFF;
};

const hasContextToolbar = (editor: Editor) => editor.getParam('link_context_toolbar', false, 'boolean');

const getLinkList = (editor: Editor): string | ListItem[] | ((success: (val: any) => void) => void) => editor.getParam('link_list');

const getDefaultLinkTarget = (editor: Editor) => editor.getParam('default_link_target');

const getTargetList = (editor: Editor): boolean | ListItem[] => editor.getParam('target_list', true);

const getRelList = (editor: Editor): ListItem[] => editor.getParam('rel_list', [], 'array');

const getLinkClassList = (editor: Editor): ListItem[] => editor.getParam('link_class_list', [], 'array');

const shouldShowLinkTitle = (editor: Editor) => editor.getParam('link_title', true, 'boolean');

const allowUnsafeLinkTarget = (editor: Editor) => editor.getParam('allow_unsafe_link_target', false, 'boolean');

const useQuickLink = (editor: Editor) => editor.getParam('link_quicklink', false, 'boolean');

const getDefaultLinkProtocol = (editor: Editor): string => editor.getParam('link_default_protocol', 'http', 'string');

export {
  assumeExternalTargets,
  hasContextToolbar,
  getLinkList,
  getDefaultLinkTarget,
  getTargetList,
  getRelList,
  getLinkClassList,
  shouldShowLinkTitle,
  allowUnsafeLinkTarget,
  useQuickLink,
  getDefaultLinkProtocol
};
