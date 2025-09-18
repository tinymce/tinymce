import { Arr } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import type AstNode from 'tinymce/core/api/html/Node';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as AstNodeAttributeUtils from './attribute/AstNodeAttributeUtils';
import * as SugarAttributeUtils from './attribute/SugarAttributeUtils';

const setup = (editor: Editor): void => {
  // Prevent adding an undo level on ToggleAccordion in readonly mode
  editor.on('BeforeAddUndo', (event) => {
    if (editor.readonly) {
      const originalEvent = event.originalEvent as unknown as EditorEvent<unknown> | undefined;
      const shouldStopEvent = isBlur(originalEvent) || (isExecCommand(originalEvent) && originalEvent.command === 'ToggleAccordion');
      if (shouldStopEvent) {
        event.preventDefault();
      }
    }
  });

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

const isExecCommand = (event?: EditorEvent<unknown>): event is EditorEvent<ExecCommandEvent> =>
  event?.type === 'execcommand';

const isBlur = (event?: EditorEvent<unknown>): boolean =>
  event?.type === 'blur';

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
