import Editor from '../api/Editor';

export const setup = (editor: Editor): void => {
  editor.on('BeforeInput', (e) => {
    // Normally input is blocked on non-editable elements that have contenteditable="false" however we are also treating
    // SVG elements as non-editable and Firefox lets you delete parts of the SVG if you manage to select a part. So this
    // checks for that scenario and prevents the default behaviour.
    if (!editor.selection.isEditable()) {
      e.preventDefault();
    }
  });
};
