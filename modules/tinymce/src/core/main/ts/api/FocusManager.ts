/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
 * @private
 */

interface FocusManager {
  isEditorUIElement: (elm: Element) => boolean;
}

/**
 * Returns true if the specified element is part of the UI for example an button or text input.
 *
 * @static
 * @method isEditorUIElement
 * @param  {Element} elm Element to check if it's part of the UI or not.
 * @return {Boolean} True/false state if the element is part of the UI or not.
 */
const isEditorUIElement = (elm: Element): boolean => {
  // Needs to be converted to string since svg can have focus: #6776
  const className = elm.className.toString();
  return className.indexOf('tox-') !== -1 || className.indexOf('mce-') !== -1;
};

const FocusManager: FocusManager = {
  isEditorUIElement
};

export default FocusManager;
