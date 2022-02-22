import { DragnDrop, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.paste.DragDropImageTest', () => {
  const base64ImgSrc = [
    'R0lGODdhZABkAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgAAACwAAAAAZABkAIEAAAD78jY/',
    'P3SsMjIC/4SPqcvtD6OctNqLs968+w+G4kiW5ommR8C27gvHrxrK9g3TIM7f+tcL5n4doZFFLB6F',
    'Sc6SCRFIp9SqVTp6BiPXbjer5XG95Ck47IuWy2e0bLz2tt3DR5w8p7vgd2tej6TW5ycCGMM3aFZo',
    'OCOYqFjDuOf4KPAHiPh4qZeZuEnXOfjpFto3ilZ6dxqWGreq1br2+hTLtigZaFcJuYOb67DLC+Qb',
    'UIt3i2sshyzZtEFc7JwBLT1NXI2drb3N3e39DR4uPk5ebn6Onq6+zu488A4fLz9P335Aj58fb2+g',
    '71/P759AePwADBxY8KDAhAr9MWyY7yFEgPYmRgxokWK7jEYa2XGcJ/HjgJAfSXI0mRGlRZUTWUJ0',
    '2RCmQpkHaSLEKPKdzYU4c+78VzCo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9eqEAADs='
  ].join('');

  const base64ToBlob = (base64: string, type: string, filename: string): File => {
    const buff = atob(base64);
    const bytes = new Uint8Array(buff.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = buff.charCodeAt(i);
    }

    return new window.File([ bytes ], filename, { type });
  };

  const pSetupAndDropImage = async (editor: Editor) => {
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    await DragnDrop.pDropFiles(TinyDom.body(editor), [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ], true);
  };

  it('TINY-8486: Drop image - paste_data_images: true', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      automatic_uploads: false,
      paste_data_images: true,
      base_url: '/project/tinymce/js/tinymce'
    });

    await pSetupAndDropImage(editor);

    const image = await UiFinder.pWaitFor<HTMLImageElement>(`Wait for image to exist`, TinyDom.body(editor), 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '">a</p>');
    assert.strictEqual(image.dom.src.indexOf('blob:'), 0);

    McEditor.remove(editor);
  });

  it('TINY-8486: Drop image - paste_data_images: false', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      automatic_uploads: false,
      paste_data_images: false,
      base_url: '/project/tinymce/js/tinymce'
    });

    await pSetupAndDropImage(editor);

    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);

    McEditor.remove(editor);
  });
});
