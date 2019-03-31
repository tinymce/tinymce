/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';

/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
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
const isEditorUIElement = function (elm: Element) {
  // Needs to be converted to string since svg can have focus: #6776
  return elm.className.toString().indexOf('tox-') !== -1 || elm.className.toString().indexOf('mce-') !== -1;
};

const FocusManager: FocusManager = {
  isEditorUIElement
};

export default FocusManager;