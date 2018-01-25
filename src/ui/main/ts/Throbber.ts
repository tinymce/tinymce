/**
 * Throbber.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import $ from 'tinymce/core/api/dom/DomQuery';
import Control from './Control';
import Delay from 'tinymce/core/api/util/Delay';

/**
 * This class enables you to display a Throbber for any element.
 *
 * @-x-less Throbber.less
 * @class tinymce.ui.Throbber
 */

export default function (elm, inline?) {
  const self = this;
  let state;
  const classPrefix = Control.classPrefix;
  let timer;

  /**
   * Shows the throbber.
   *
   * @method show
   * @param {Number} [time] Time to wait before showing.
   * @param {function} [callback] Optional callback to execute when the throbber is shown.
   * @return {tinymce.ui.Throbber} Current throbber instance.
   */
  self.show = function (time, callback) {
    function render() {
      if (state) {
        $(elm).append(
          '<div class="' + classPrefix + 'throbber' + (inline ? ' ' + classPrefix + 'throbber-inline' : '') + '"></div>'
        );

        if (callback) {
          callback();
        }
      }
    }

    self.hide();

    state = true;

    if (time) {
      timer = Delay.setTimeout(render, time);
    } else {
      render();
    }

    return self;
  };

  /**
   * Hides the throbber.
   *
   * @method hide
   * @return {tinymce.ui.Throbber} Current throbber instance.
   */
  self.hide = function () {
    const child = elm.lastChild;

    Delay.clearTimeout(timer);

    if (child && child.className.indexOf('throbber') !== -1) {
      child.parentNode.removeChild(child);
    }

    state = false;

    return self;
  };
}