import { Assertions, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { MediaData, MediaDialogData } from '../../../main/ts/core/Types';
import Dialog from '../../../main/ts/ui/Dialog';

UnitTest.asynctest('browser.core.DataToHtmlTest', function (success, failure) {
  Plugin();
  Theme();

  TinyLoader.setupLight(function (_editor, onSuccess, onFailure) {
    const inputData: MediaDialogData = {
      source: {
        value: 'www.test.com',
        meta: {
          altsource: 'www.newaltsource.com',
          poster: 'www.newposter.com/image.jpg',
        }
      },
      altsource: {
        value: 'www.altsource.com',
        meta: {}
      },
      poster: { value: '', meta: {} },
      embed: '',
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
      height: '200px',
    };

    Pipeline.async({}, Log.steps('TINY-4163', 'Test Dialog.unwrap() ', [
      Assertions.sAssertEq('Test unwrap without dimensions', outputData, Dialog.unwrap(inputData, 'source')),
      Assertions.sAssertEq('Test unwrap with dimensions', outputDataWithDimensions, Dialog.unwrap(inputDataWithDimensions, 'source')),
    ]), onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});