import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import AstNode from 'tinymce/core/api/html/Node';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

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

  editor.on('PreInit', () => {
    const { serializer, parser } = editor;
    const accordionTag = 'details';

    /*
      Using `editor.setContent` is possible in `readonly` mode. `setContent` may add new <details> elements
      therefore we have to add `data-mce-open` attributes.

      Purpose:
        - add 'data-mce-open' attribute to <details> elements if the editor is in readonly mode
    */
    parser.addNodeFilter(accordionTag, (nodes) => {
      if (editor.readonly) {
        addTemporaryAttributes(nodes);
      }
    });

    /*
      Using `editor.getContent` in `readonly` mode we have to update <details> `open` attribute according to
      `data-mce-open` attribute and remove `data-mce-open` attribute.

      Purpose:
      - in readonly mode: update <details> `open` attribute according to `data-mce-open` attribute value
      - in readonly mode: remove `data-mce-open` attribute
    */
    serializer.addNodeFilter(accordionTag, (nodes) => {
      if (editor.readonly) {
        restoreNormalState(nodes);
      }
    });
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

const addTemporaryAttributes = (detailsElements: Array<SugarElement<HTMLDetailsElement> | AstNode>) =>
  Arr.each(
    detailsElements,
    (details) => Utils.setMceOpenAttribute(details, Utils.hasOpenAttribute(details))
  );

export {
  setup
};
