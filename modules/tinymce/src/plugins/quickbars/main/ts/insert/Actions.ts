import { Id } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const insertTable = (editor: Editor, columns: number, rows: number): void => {
  editor.execCommand('mceInsertTable', false, { rows, columns });
};

const insertBlob = (editor: Editor, base64: string, blob: Blob): void => {
  const blobCache = editor.editorUpload.blobCache;
  const blobInfo = blobCache.create(Id.generate('mceu'), blob, base64);
  blobCache.add(blobInfo);

  editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
};

export {
  insertTable,
  insertBlob
};
