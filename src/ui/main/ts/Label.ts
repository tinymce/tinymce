/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Widget from './Widget';
import DomUtils from './DomUtils';

/**
 * This class creates a label element. A label is a simple text control
 * that can be bound to other controls.
 *
 * @-x-less Label.less
 * @class tinymce.ui.Label
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} multiline Multiline label.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    self.classes.add('widget').add('label');
    self.canFocus = false;

    if (settings.multiline) {
      self.classes.add('autoscroll');
    }

    if (settings.strong) {
      self.classes.add('strong');
    }
  },

  /**
   * Initializes the current controls layout rect.
   * This will be executed by the layout managers to determine the
   * default minWidth/minHeight etc.
   *
   * @method initLayoutRect
   * @return {Object} Layout rect instance.
   */
  initLayoutRect () {
    const self = this, layoutRect = self._super();

    if (self.settings.multiline) {
      const size = DomUtils.getSize(self.getEl());

      // Check if the text fits within maxW if not then try word wrapping it
      if (size.width > layoutRect.maxW) {
        layoutRect.minW = layoutRect.maxW;
        self.classes.add('multiline');
      }

      self.getEl().style.width = layoutRect.minW + 'px';
      layoutRect.startMinH = layoutRect.h = layoutRect.minH = Math.min(layoutRect.maxH, DomUtils.getSize(self.getEl()).height);
    }

    return layoutRect;
  },

  /**
   * Repaints the control after a layout operation.
   *
   * @method repaint
   */
  repaint () {
    const self = this;

    if (!self.settings.multiline) {
      self.getEl().style.lineHeight = self.layoutRect().h + 'px';
    }

    return self._super();
  },

  severity (level) {
    this.classes.remove('error');
    this.classes.remove('warning');
    this.classes.remove('success');
    this.classes.add(level);
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;
    let targetCtrl, forName, forId = self.settings.forId;
    const text = self.settings.html ? self.settings.html : self.encode(self.state.get('text'));

    if (!forId && (forName = self.settings.forName)) {
      targetCtrl = self.getRoot().find('#' + forName)[0];

      if (targetCtrl) {
        forId = targetCtrl._id;
      }
    }

    if (forId) {
      return (
        '<label id="' + self._id + '" class="' + self.classes + '"' + (forId ? ' for="' + forId + '"' : '') + '>' +
        text +
        '</label>'
      );
    }

    return (
      '<span id="' + self._id + '" class="' + self.classes + '">' +
      text +
      '</span>'
    );
  },

  bindStates () {
    const self = this;

    self.state.on('change:text', function (e) {
      self.innerHtml(self.encode(e.value));

      if (self.state.get('rendered')) {
        self.updateLayoutRect();
      }
    });

    return self._super();
  }
});