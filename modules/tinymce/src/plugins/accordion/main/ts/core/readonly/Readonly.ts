import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
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

  // Save snapshot of accordion state on entering readonly
  editor.on('SwitchMode', (event) => {
    const editorBofy = SugarElement.fromDom(editor.getBody());
    if (event.mode === 'readonly') {
      addTemporaryAttributes(editorBofy);
    } else {
      restoreNormalState(editorBofy);
    }
  });

  /*
    Using `editor.setContent` is possible in `readonly` mode. `setContent` may add new <details> elements
    therefore we have to add `data-mce-open` attributes.

    TODO: Here I'm doing this after setting the content. I could also utilise `BeforeSetContent`
    but this would require serializing the content, as in BeforeSetContent event `content` is a string.

    TODO: Re-think. Adding a new element in readonly-mode and re-iterating over all the details could override data-mce-open
    to the current open attribute value. Which could be tempered with in readonly mode.

    TODO: Should we ignore SetContent events when format is raw?
  */
  editor.on('SetContent', () => {
    const editorBody = SugarElement.fromDom(editor.getBody());
    if (editor.readonly) {
      addTemporaryAttributes(editorBody);
    }
  });

  /*
    TODO: A lot of places overriding this event excludes partial selection, should I do this as well?
    TODO: Should we Ignore GetContent override even when format is raw?
  */
  editor.on('GetContent', (event) => {
    // TODO: I know this can't be done that way. Unfurtunately I can't parse the content here. So I will need to work on a string level...
    if (editor.readonly) {
      const currentContent = event.content;
      const parsedContent = new DOMParser().parseFromString(currentContent, 'text/html');
      restoreNormalState(SugarElement.fromDom(parsedContent));
      event.content = parsedContent.body.innerHTML;
    }
  });
};

const restoreNormalState = (scope: SugarElement<Node>) => {
  Arr.each(
    // At this point every <details> should have data-mce-open attribute. But I will ignore those that don't - just in case.
    Arr.filter(Utils.getDetailsElements(scope), Utils.hasMceOpenAttribute),
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

const addTemporaryAttributes = (scope: SugarElement<Node>) =>
  Arr.each(
    Utils.getDetailsElements(scope),
    (details) => Utils.setMceOpenAttribute(details, Utils.hasOpenAttribute(details))
  );

export {
  setup
};
