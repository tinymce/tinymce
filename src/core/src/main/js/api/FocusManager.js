/**
 * FocusManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
 */
define(
  'tinymce.core.api.FocusManager',
  [
    'global!document'
  ],
  function (document) {
    /**
     * Returns true if the specified element is part of the UI for example an button or text input.
     *
     * @static
     * @method isEditorUIElement
     * @param  {Element} elm Element to check if it's part of the UI or not.
     * @return {Boolean} True/false state if the element is part of the UI or not.
     */
    var isEditorUIElement = function (elm) {
      // Needs to be converted to string since svg can have focus: #6776
      return elm.className.toString().indexOf('mce-') !== -1;
    };

    return {
      isEditorUIElement: isEditorUIElement
    };
  }
);
