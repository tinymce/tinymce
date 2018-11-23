/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Utils from '../core/Utils';
import AdvTab from './AdvTab';
import MainTab from './MainTab';
import SizeManager from './SizeManager';
import UploadTab from './UploadTab';
import { Fun, Merger } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { insertOrUpdateImage, readImageDataFromSelection } from 'tinymce/plugins/image/core/ImageSelection';

const submitForm = (editor: Editor, evt) => {
  const win = evt.control.getRoot();

  SizeManager.updateSize(win);

  editor.undoManager.transact(() => {
    const data = Merger.merge(readImageDataFromSelection(editor), win.toJSON());
    insertOrUpdateImage(editor, data);
  });

  editor.editorUpload.uploadImagesAuto();
};

export default function (editor) {
  function showDialog(imageList) {
    const data = readImageDataFromSelection(editor);
    let win, imageListCtrl;

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
        body.push(AdvTab.makeTab(editor));
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
        onSubmit: Fun.curry(submitForm, editor)
      });
    } else {
      // Simple default dialog
      win = editor.windowManager.open({
        title: 'Insert/edit image',
        data,
        body: MainTab.getGeneralItems(editor, imageListCtrl),
        onSubmit: Fun.curry(submitForm, editor)
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