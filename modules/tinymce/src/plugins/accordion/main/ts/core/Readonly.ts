import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const setup = (editor: Editor): void => {
  editor.on('BeforeAddUndo', (event) => {
    const isExecCommand = (event: any): event is EditorEvent<ExecCommandEvent> => {
      return event?.type === 'execcommand';
    };

    const originalEvent = event.originalEvent;
    if (editor.readonly && isExecCommand(originalEvent) && originalEvent.command === 'ToggleAccordion') {
      event.preventDefault();
    }
  });

  editor.on('SwitchMode', (event) => {
    if (event.mode === 'readonly') {
      setMceOpenAttributes(editor);
    } else if (event.mode === 'design') {
      removeMceOpenAttributes(editor);
    }
  });
};

const setMceOpenAttributes = (editor: Editor) => {
  const detailsElements = Array.from(editor.getDoc().querySelectorAll('details'));
  detailsElements.forEach((detail) => {
    detail.setAttribute('data-mce-open', '' + detail.hasAttribute('open'));
  });
};

const removeMceOpenAttributes = (editor: Editor) => {
  const detailsElements = Array.from(editor.getDoc().querySelectorAll('details'));
  detailsElements.forEach((detail) => {
    detail.removeAttribute('data-mce-open');
  });
};

export {
  setup
};
