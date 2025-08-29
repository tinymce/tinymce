import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Utils from './Utils';

const setup = (editor: Editor): void => {
  // Prevent adding an undo level on ToggleAccordion in readonly mode
  editor.on('BeforeAddUndo', (event) => {
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
    if (event.mode === 'readonly') {
      onEnterReadonly(editor);
    } else {
      onPossibleExitReadonly(editor);
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
    if (editor.readonly) {
      setupMceOpenAttributes(editor);
    }
  });

  /* TODO: A lot of places overriding this event excludes partial selection, should I do this as well? */
  editor.on('GetContent', () => {
    // Unfortunatelly we have to work at the string level... This is a nightmare
    if (editor.readonly) {
    }
  });
};

const onEnterReadonly = (editor: Editor) => {
  setupMceOpenAttributes(editor);
};

const onPossibleExitReadonly = (editor: Editor) => {
  updateOpenAttributes(editor);
  removeMceOpenAttributes(editor);
};

const setupMceOpenAttributes = (editor: Editor) =>
  Arr.each(Utils.getDetailsElements(editor), (details) => Utils.setMceOpenAttribute(details, Utils.hasOpenAttribute(details)));

const updateOpenAttributes = (editor: Editor) => {
  Arr.each(
    // At this point every <details> should have data-mce-open attribute. But I will ignore those that don't - just in case.
    Arr.filter(Utils.getDetailsElements(editor), Utils.hasMceOpenAttribute),
    (details) => {
      const mceOpen = Utils.getMceOpenAttribute(details);
      if (mceOpen) {
        Utils.setOpenAttribute(details);
      } else {
        Utils.removeOpenAttribute(details);
      }
    }
  );
};

const removeMceOpenAttributes = (editor: Editor) =>
  Arr.each(Utils.getDetailsElements(editor), Utils.removeMceOpenAttribute);

export {
  setup
};
