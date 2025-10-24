import { Arr } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type AstNode from 'tinymce/core/api/html/Node';

import * as AstNodeAttributeUtils from './attribute/AstNodeAttributeUtils';
import * as SugarAttributeUtils from './attribute/SugarAttributeUtils';

const setup = (editor: Editor): void => {
  editor.on('SwitchMode', (event) => {
    const editorBody = SugarElement.fromDom(editor.getBody());
    const details = SelectorFilter.descendants<HTMLDetailsElement>(editorBody, 'details');
    if (event.mode === 'readonly') {
      Arr.each(details, SugarAttributeUtils.addTemporaryAttributes);
    } else {
      Arr.each(details, SugarAttributeUtils.restoreNormalState);
    }
  });
};

const parseDetailsInReadonly = (editor: Editor, detailsNode: AstNode): void => {
  if (editor.readonly) {
    AstNodeAttributeUtils.addTemporaryAttributes(detailsNode);
  }
};

const serializeDetailsInReadonly = (editor: Editor, detailsNode: AstNode): void => {
  if (editor.readonly) {
    AstNodeAttributeUtils.restoreNormalState(detailsNode);
  }
};

export {
  setup,
  parseDetailsInReadonly,
  serializeDetailsInReadonly
};
