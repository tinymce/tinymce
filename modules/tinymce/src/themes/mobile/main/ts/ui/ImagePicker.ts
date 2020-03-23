/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, Button, Memento, NativeEvents, SketchSpec } from '@ephox/alloy';
import { BlobConversions } from '@ephox/imagetools';
import { Id, Option } from '@ephox/katamari';

import * as Buttons from '../ui/Buttons';
import Editor from 'tinymce/core/api/Editor';
import { Blob } from '@ephox/dom-globals';

const addImage = (editor: Editor, blob: Blob) => {
  BlobConversions.blobToBase64(blob).then((base64) => {
    editor.undoManager.transact(() => {
      const cache = editor.editorUpload.blobCache;
      const info = cache.create(
        Id.generate('mceu'), blob, base64
      );
      cache.add(info);
      const img = editor.dom.createHTML('img', {
        src: info.blobUri()
      });
      editor.insertContent(img);
    });
  });
};

const extractBlob = (simulatedEvent): Option<Blob> => {
  const event = simulatedEvent.event();
  const files = event.raw().target.files || event.raw().dataTransfer.files;
  return Option.from(files[0]);
};

const sketch = (editor): SketchSpec => {
  const pickerDom = {
    tag: 'input',
    attributes: { accept: 'image/*', type: 'file', title: '' },
    // Visibility hidden so that it cannot be seen, and position absolute so that it doesn't
    // disrupt the layout
    styles: { visibility: 'hidden', position: 'absolute' }
  };

  const memPicker = Memento.record({
    dom: pickerDom,
    events: AlloyEvents.derive([
      // Stop the event firing again at the button level
      AlloyEvents.cutter(NativeEvents.click()),

      AlloyEvents.run(NativeEvents.change(), (picker, simulatedEvent) => {
        extractBlob(simulatedEvent).each((blob) => {
          addImage(editor, blob);
        });
      })
    ])
  });

  return Button.sketch({
    dom: Buttons.getToolbarIconButton('image', editor),
    components: [
      memPicker.asSpec()
    ],
    action(button) {
      const picker = memPicker.get(button);
      // Trigger a dom click for the file input
      picker.element().dom().click();
    }
  });
};

export {
  sketch
};
