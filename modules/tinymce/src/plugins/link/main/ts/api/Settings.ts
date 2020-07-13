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

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

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

const hasContextToolbar = getSetting('link_context_toolbar', false, 'boolean');

const getLinkList = getSetting<string | ListItem[]>('link_list');

const getDefaultLinkTarget = getSetting<string>('default_link_target');

const getTargetList = getSetting<boolean | ListItem[]>('target_list', true);

const getRelList = getSetting<ListItem[]>('rel_list', [], 'array');

const getLinkClassList = getSetting<ListItem[]>('link_class_list', [], 'array');

const shouldShowLinkTitle = getSetting('link_title', true, 'boolean');

const allowUnsafeLinkTarget = getSetting('allow_unsafe_link_target', false, 'boolean');

const useQuickLink = getSetting('link_quicklink', false, 'boolean');

const getDefaultLinkProtocol = getSetting('link_default_protocol', 'http', 'string');

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
