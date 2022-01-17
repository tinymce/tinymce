import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { MediaData, MediaDialogData } from 'tinymce/plugins/media/core/Types';
import Plugin from 'tinymce/plugins/media/Plugin';
import * as Dialog from 'tinymce/plugins/media/ui/Dialog';

describe('browser.tinymce.plugins.media.core.DataUnwrapTest', () => {
  TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const inputData: MediaDialogData = {
    source: {
      value: 'www.test.com',
      meta: {
        altsource: 'www.newaltsource.com',
        poster: 'www.newposter.com/image.jpg'
      }
    },
    altsource: {
      value: 'www.altsource.com',
      meta: {}
    },
    poster: { value: '', meta: {}},
    embed: ''
  };

  const outputData: MediaData = {
    source: 'www.test.com',
    altsource: 'www.newaltsource.com',
    poster: 'www.newposter.com/image.jpg',
    embed: ''
  };

  const inputDataWithDimensions: MediaDialogData = {
    ...inputData,
    dimensions: {
      width: '100px',
      height: '200px'
    }
  };

  const outputDataWithDimensions: MediaData = {
    ...outputData,
    width: '100px',
    height: '200px'
  };

  it('TINY-4163: Dialog.unwrap() without dimensions', () => {
    assert.deepEqual(Dialog.unwrap(inputData, 'source'), outputData);
  });

  it('TINY-4163: Dialog.unwrap() with dimensions', () => {
    assert.deepEqual(Dialog.unwrap(inputDataWithDimensions, 'source'), outputDataWithDimensions);
  });
});
