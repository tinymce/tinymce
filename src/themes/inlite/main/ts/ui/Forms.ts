/**
 * Forms.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Factory from 'tinymce/core/api/ui/Factory';
import Promise from 'tinymce/core/api/util/Promise';
import Actions from '../core/Actions';
import UrlType from '../core/UrlType';
import { Editor } from 'tinymce/core/api/Editor';

const focusFirstTextBox = function (form) {
  form.find('textbox').eq(0).each(function (ctrl) {
    ctrl.focus();
  });
};

const createForm = function (name: string, spec: Record<string, any>) {
  const form = Factory.create(
    Tools.extend({
      type: 'form',
      layout: 'flex',
      direction: 'row',
      padding: 5,
      name,
      spacing: 3
    }, spec)
  );

  form.on('show', function () {
    focusFirstTextBox(form);
  });

  return form;
};

const toggleVisibility = function (ctrl, state: boolean) {
  return state ? ctrl.show() : ctrl.hide();
};

const askAboutPrefix = function (editor: Editor, href: string) {
  return new Promise<string>(function (resolve) {
    editor.windowManager.confirm(
      'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
      function (result) {
        const output = result === true ? 'http://' + href : href;
        resolve(output);
      }
    );
  });
};

const convertLinkToAbsolute = function (editor: Editor, href: string) {
  return !UrlType.isAbsolute(href) && UrlType.isDomainLike(href) ? askAboutPrefix(editor, href) : Promise.resolve(href);
};

const createQuickLinkForm = function (editor: Editor, hide: Function) {
  let attachState: any = {};

  const unlink = function () {
    editor.focus();
    Actions.unlink(editor);
    hide();
  };

  const onChangeHandler = function (e) {
    const meta = e.meta;

    if (meta && meta.attach) {
      attachState = {
        href: this.value(),
        attach: meta.attach
      };
    }
  };

  const onShowHandler = function (e) {
    if (e.control === this) {
      let elm, linkurl = '';

      elm = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
      if (elm) {
        linkurl = editor.dom.getAttrib(elm, 'href');
      }

      this.fromJSON({
        linkurl
      });

      toggleVisibility(this.find('#unlink'), elm);
      this.find('#linkurl')[0].focus();
    }
  };

  return createForm('quicklink', {
    items: [
      { type: 'button', name: 'unlink', icon: 'unlink', onclick: unlink, tooltip: 'Remove link' },
      { type: 'filepicker', name: 'linkurl', placeholder: 'Paste or type a link', filetype: 'file', onchange: onChangeHandler },
      { type: 'button', icon: 'checkmark', subtype: 'primary', tooltip: 'Ok', onclick: 'submit' }
    ],
    onshow: onShowHandler,
    onsubmit (e) {
      convertLinkToAbsolute(editor, e.data.linkurl).then(function (url) {
        editor.undoManager.transact(function () {
          if (url === attachState.href) {
            attachState.attach();
            attachState = {};
          }

          Actions.createLink(editor, url);
        });

        hide();
      });
    }
  });
};

export default {
  createQuickLinkForm
};