/**
 * Layout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Class from 'tinymce/core/api/util/Class';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * Base layout manager class.
 *
 * @class tinymce.ui.Layout
 */

export default Class.extend({
  Defaults: {
    firstControlClass: 'first',
    lastControlClass: 'last'
  },

  /**
   * Constructs a layout instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   */
  init (settings) {
    this.settings = Tools.extend({}, this.Defaults, settings);
  },

  /**
   * This method gets invoked before the layout renders the controls.
   *
   * @method preRender
   * @param {tinymce.ui.Container} container Container instance to preRender.
   */
  preRender (container) {
    container.bodyClasses.add(this.settings.containerClass);
  },

  /**
   * Applies layout classes to the container.
   *
   * @private
   */
  applyClasses (items) {
    const self = this;
    const settings = self.settings;
    let firstClass, lastClass, firstItem, lastItem;

    firstClass = settings.firstControlClass;
    lastClass = settings.lastControlClass;

    items.each(function (item) {
      item.classes.remove(firstClass).remove(lastClass).add(settings.controlClass);

      if (item.visible()) {
        if (!firstItem) {
          firstItem = item;
        }

        lastItem = item;
      }
    });

    if (firstItem) {
      firstItem.classes.add(firstClass);
    }

    if (lastItem) {
      lastItem.classes.add(lastClass);
    }
  },

  /**
   * Renders the specified container and any layout specific HTML.
   *
   * @method renderHtml
   * @param {tinymce.ui.Container} container Container to render HTML for.
   */
  renderHtml (container) {
    const self = this;
    let html = '';

    self.applyClasses(container.items());

    container.items().each(function (item) {
      html += item.renderHtml();
    });

    return html;
  },

  /**
   * Recalculates the positions of the controls in the specified container.
   *
   * @method recalc
   * @param {tinymce.ui.Container} container Container instance to recalc.
   */
  recalc () {
  },

  /**
   * This method gets invoked after the layout renders the controls.
   *
   * @method postRender
   * @param {tinymce.ui.Container} container Container instance to postRender.
   */
  postRender () {
  },

  isNative () {
    return false;
  }
});