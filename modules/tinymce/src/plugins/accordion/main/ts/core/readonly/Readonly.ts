import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import type AstNode from 'tinymce/core/api/html/Node';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Utils from './Utils';

const setup = (editor: Editor): void => {
  // Prevent adding an undo level on ToggleAccordion in readonly mode
  editor.on('BeforeAddUndo', (event) => {
    // TODO: Fix the types so I wouldn't have to use any
    const isExecCommand = (event: any): event is EditorEvent<ExecCommandEvent> => {
      return event?.type === 'execcommand';
    };

    const originalEvent = event.originalEvent;
    if (editor.readonly && isExecCommand(originalEvent) && originalEvent.command === 'ToggleAccordion') {
      event.preventDefault();
    }
  });

  editor.on('SwitchMode', (event) => {
    const editorBody = SugarElement.fromDom(editor.getBody());
    const details = Utils.getDetailsElements(editorBody);
    if (event.mode === 'readonly') {
      addTemporaryAttributes(details);
    } else {
      restoreNormalState(details);
    }
  });
};

const parseDetailsInReadonly = (editor: Editor, detailsNode: AstNode): void => {
  if (editor.readonly) {
    addTemporaryAttributes([ detailsNode ]);
  }
};

const serializeDetailsInReadonly = (editor: Editor, detailsNode: AstNode): void => {
  if (editor.readonly) {
    restoreNormalState([ detailsNode ]);
  }
};

const addTemporaryAttributes = (detailsElements: Array<SugarElement<HTMLDetailsElement> | AstNode>) =>
  Arr.each(
    detailsElements,
    (details) => Utils.setMceOpenAttribute(details, Utils.hasOpenAttribute(details))
  );

const restoreNormalState = (detailsElements: Array<SugarElement<HTMLDetailsElement> | AstNode>) => {
  Arr.each(
    // At this point every <details> should have data-mce-open attribute. But I will ignore those that don't - just in case.
    Arr.filter(detailsElements, Utils.hasMceOpenAttribute),
    (details) => {
      const mceOpen = Utils.getMceOpenAttribute(details);
      Utils.removeMceOpenAttribute(details);
      if (mceOpen) {
        Utils.setOpenAttribute(details);
      } else {
        Utils.removeOpenAttribute(details);
      }
    }
  );
};

export {
  setup,
  parseDetailsInReadonly,
  serializeDetailsInReadonly
};
