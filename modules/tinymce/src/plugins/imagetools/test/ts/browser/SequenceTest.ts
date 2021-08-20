import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { ImageOps } from '../module/test/ImageOps';
import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.SequenceTest', () => {
  // TODO: TINY-3693 investigate why this test is so flaky. It's likely caused by race conditions.
  before(function () {
    // Disabled due to being too flaky and causing fairly consistent failures
    this.skip();
  });

  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  // var corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'imagetools',
    imagetools_cors_hosts: [ 'moxiecode.cachefly.net' ],
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'editimage'
  }, [ Plugin, Theme ]);

  it('TBA: Test image operations on an image from the same domain', async () => {
    const editor = hook.editor();
    await ImageUtils.pLoadImage(editor, srcUrl);
    TinySelections.select(editor, 'img', []);
    await ImageOps.pExecToolbar(editor, 'Flip horizontally');
    await ImageOps.pExecToolbar(editor, 'Rotate clockwise');
    await ImageOps.pExecDialog(editor, 'Invert');
    await ImageOps.pExecDialog(editor, 'Crop');
    await ImageOps.pExecDialog(editor, 'Resize');
    await ImageOps.pExecDialog(editor, 'Flip vertically');
    await ImageOps.pExecDialog(editor, 'Rotate clockwise');
    await ImageOps.pExecDialog(editor, 'Brightness');
    await ImageOps.pExecDialog(editor, 'Sharpen');
    await ImageOps.pExecDialog(editor, 'Contrast');
    await ImageOps.pExecDialog(editor, 'Color levels');
    await ImageOps.pExecDialog(editor, 'Gamma');
  });
});
