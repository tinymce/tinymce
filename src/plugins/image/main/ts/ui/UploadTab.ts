/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { URL } from '@ephox/sand';
import Factory from 'tinymce/core/api/ui/Factory';
import Settings from '../api/Settings';
import Utils from '../core/Utils';
import Uploader from '../core/Uploader';

const onFileInput = function (editor) {
  return function (evt) {
    const Throbber = Factory.get('Throbber');
    const rootControl = evt.control.rootControl;
    const throbber = new Throbber(rootControl.getEl());
    const file = evt.control.value();
    const blobUri = URL.createObjectURL(file);

    const uploader = Uploader({
      url: Settings.getUploadUrl(editor),
      basePath: Settings.getUploadBasePath(editor),
      credentials: Settings.getUploadCredentials(editor),
      handler: Settings.getUploadHandler(editor)
    });

    const finalize = function () {
      throbber.hide();
      URL.revokeObjectURL(blobUri);
    };

    throbber.show();

    return Utils.blobToDataUri(file).then(function (dataUrl) {
      const blobInfo = editor.editorUpload.blobCache.create({
        blob: file,
        blobUri,
        name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null, // strip extension
        base64: dataUrl.split(',')[1]
      });
      return uploader.upload(blobInfo).then(function (url) {
        const src = rootControl.find('#src');
        src.value(url);
        rootControl.find('tabpanel')[0].activateTab(0); // switch to General tab
        src.fire('change'); // this will invoke onSrcChange (and any other handlers, if any).
        finalize();
        return url;
      });
    }).catch(function (err) {
      editor.windowManager.alert(err);
      finalize();
    });
  };
};

const acceptExts = '.jpg,.jpeg,.png,.gif';

const makeTab = function (editor) {
  return {
    title: 'Upload',
    type: 'form',
    layout: 'flex',
    direction: 'column',
    align: 'stretch',
    padding: '20 20 20 20',
    items: [
      {
        type: 'container',
        layout: 'flex',
        direction: 'column',
        align: 'center',
        spacing: 10,
        items: [
          {
            text: 'Browse for an image',
            type: 'browsebutton',
            accept: acceptExts,
            onchange: onFileInput(editor)
          },
          {
            text: 'OR',
            type: 'label'
          }
        ]
      },
      {
        text: 'Drop an image here',
        type: 'dropzone',
        accept: acceptExts,
        height: 100,
        onchange: onFileInput(editor)
      }
    ]
  };
};

export default {
  makeTab
};