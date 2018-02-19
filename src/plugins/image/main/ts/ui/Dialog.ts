/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import Utils from '../core/Utils';
import AdvTab from './AdvTab';
import MainTab from './MainTab';
import SizeManager from './SizeManager';
import UploadTab from './UploadTab';

/**
 * @class tinymce.image.ui.Dialog
 * @private
 */

export default function (editor) {
  const updateStyle = function (editor, rootControl) {
    if (!Settings.hasAdvTab(editor)) {
      return;
    }
    const dom = editor.dom;
    const data = rootControl.toJSON();
    let css = dom.parseStyle(data.style);

    css = Utils.mergeMargins(css);

    if (data.vspace) {
      css['margin-top'] = css['margin-bottom'] = Utils.addPixelSuffix(data.vspace);
    }
    if (data.hspace) {
      css['margin-left'] = css['margin-right'] = Utils.addPixelSuffix(data.hspace);
    }
    if (data.border) {
      css['border-width'] = Utils.addPixelSuffix(data.border);
    }
    if (data.borderStyle) {
      css['border-style'] = data.borderStyle;
    }

    rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
  };

  function showDialog(imageList) {
    let win, data: any = {}, imgElm, figureElm;
    const dom = editor.dom;
    let imageListCtrl;

    function onSubmitForm() {
      let figureElm, oldImg;

      SizeManager.updateSize(win);
      updateStyle(editor, win);

      data = Tools.extend(data, win.toJSON());

      if (!data.alt) {
        data.alt = '';
      }

      if (!data.title) {
        data.title = '';
      }

      if (data.width === '') {
        data.width = null;
      }

      if (data.height === '') {
        data.height = null;
      }

      if (!data.style) {
        data.style = null;
      }

      // Setup new data excluding style properties
      /*eslint dot-notation: 0*/
      data = {
        src: data.src,
        alt: data.alt,
        title: data.title,
        width: data.width,
        height: data.height,
        style: data.style,
        caption: data.caption,
        class: data.class
      };

      editor.undoManager.transact(function () {
        if (!data.src) {
          if (imgElm) {
            const elm = dom.is(imgElm.parentNode, 'figure.image') ? imgElm.parentNode : imgElm;
            dom.remove(elm);
            editor.focus();
            editor.nodeChanged();

            if (dom.isEmpty(editor.getBody())) {
              editor.setContent('');
              editor.selection.setCursorLocation();
            }
          }

          return;
        }

        if (data.title === '') {
          data.title = null;
        }

        if (!imgElm) {
          data.id = '__mcenew';
          editor.focus();
          editor.selection.setContent(dom.createHTML('img', data));
          imgElm = dom.get('__mcenew');
          dom.setAttrib(imgElm, 'id', null);
        } else {
          dom.setAttribs(imgElm, data);
        }

        editor.editorUpload.uploadImagesAuto();

        if (data.caption === false) {
          if (dom.is(imgElm.parentNode, 'figure.image')) {
            figureElm = imgElm.parentNode;
            dom.insertAfter(imgElm, figureElm);
            dom.remove(figureElm);
          }
        }

        if (data.caption === true) {
          if (!dom.is(imgElm.parentNode, 'figure.image')) {
            oldImg = imgElm;
            imgElm = imgElm.cloneNode(true);
            figureElm = dom.create('figure', { class: 'image' });
            figureElm.appendChild(imgElm);
            figureElm.appendChild(dom.create('figcaption', { contentEditable: true }, 'Caption'));
            figureElm.contentEditable = false;

            const textBlock = dom.getParent(oldImg, function (node) {
              return editor.schema.getTextBlockElements()[node.nodeName];
            });

            if (textBlock) {
              dom.split(textBlock, oldImg, figureElm);
            } else {
              dom.replace(figureElm, oldImg);
            }

            editor.selection.select(figureElm);
          }

          return;
        }

        Utils.waitLoadImage(editor, data, imgElm);
      });
    }

    imgElm = editor.selection.getNode();
    figureElm = dom.getParent(imgElm, 'figure.image');
    if (figureElm) {
      imgElm = dom.select('img', figureElm)[0];
    }

    if (imgElm &&
      (imgElm.nodeName !== 'IMG' ||
        imgElm.getAttribute('data-mce-object') ||
        imgElm.getAttribute('data-mce-placeholder'))) {
      imgElm = null;
    }

    if (imgElm) {
      data = {
        src: dom.getAttrib(imgElm, 'src'),
        alt: dom.getAttrib(imgElm, 'alt'),
        title: dom.getAttrib(imgElm, 'title'),
        class: dom.getAttrib(imgElm, 'class'),
        width: dom.getAttrib(imgElm, 'width'),
        height: dom.getAttrib(imgElm, 'height'),
        caption: !!figureElm
      };
    }

    if (imageList) {
      imageListCtrl = {
        type: 'listbox',
        label: 'Image list',
        name: 'image-list',
        values: Utils.buildListItems(
          imageList,
          function (item) {
            item.value = editor.convertURL(item.value || item.url, 'src');
          },
          [{ text: 'None', value: '' }]
        ),
        value: data.src && editor.convertURL(data.src, 'src'),
        onselect (e) {
          const altCtrl = win.find('#alt');

          if (!altCtrl.value() || (e.lastControl && altCtrl.value() === e.lastControl.text())) {
            altCtrl.value(e.control.text());
          }

          win.find('#src').value(e.control.value()).fire('change');
        },
        onPostRender () {
          /*eslint consistent-this: 0*/
          imageListCtrl = this;
        }
      };
    }

    if (Settings.hasAdvTab(editor) || Settings.hasUploadUrl(editor) || Settings.hasUploadHandler(editor)) {
      const body = [
        MainTab.makeTab(editor, imageListCtrl)
      ];

      if (Settings.hasAdvTab(editor)) {
        // Parse styles from img
        if (imgElm) {
          if (imgElm.style.marginLeft && imgElm.style.marginRight && imgElm.style.marginLeft === imgElm.style.marginRight) {
            data.hspace = Utils.removePixelSuffix(imgElm.style.marginLeft);
          }
          if (imgElm.style.marginTop && imgElm.style.marginBottom && imgElm.style.marginTop === imgElm.style.marginBottom) {
            data.vspace = Utils.removePixelSuffix(imgElm.style.marginTop);
          }
          if (imgElm.style.borderWidth) {
            data.border = Utils.removePixelSuffix(imgElm.style.borderWidth);
          }

          data.borderStyle = imgElm.style.borderStyle;
          data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
        }

        body.push(AdvTab.makeTab(editor, updateStyle));
      }

      if (Settings.hasUploadUrl(editor) || Settings.hasUploadHandler(editor)) {
        body.push(UploadTab.makeTab(editor));
      }

      // Advanced dialog shows general+advanced tabs
      win = editor.windowManager.open({
        title: 'Insert/edit image',
        data,
        bodyType: 'tabpanel',
        body,
        onSubmit: onSubmitForm
      });
    } else {
      // Simple default dialog
      win = editor.windowManager.open({
        title: 'Insert/edit image',
        data,
        body: MainTab.getGeneralItems(editor, imageListCtrl),
        onSubmit: onSubmitForm
      });
    }

    SizeManager.syncSize(win);
  }

  function open() {
    Utils.createImageList(editor, showDialog);
  }

  return {
    open
  };
}