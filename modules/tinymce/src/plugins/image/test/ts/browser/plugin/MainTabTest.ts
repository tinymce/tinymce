import { Log, Pipeline } from '@ephox/agar';
import { Editor } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import {
  cAssertCleanHtml,
  cExecCommand,
  cFillActiveDialog,
  cSubmitDialog,
  cWaitForDialog,
  silverSettings,
} from '../../module/Helpers';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('All image dialog ui options on empty editor' + (Env.ceFalse ? '' : ' (old IE)'), (success, failure) => {
  SilverTheme();
  ImagePlugin();
  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Image: all image dialog ui options on empty editor' + (Env.ceFalse ? '' : ' (old IE)'), [
      Editor.cFromSettings({
        ...silverSettings,
        image_caption: true,
        image_list: [
          { title: 'link1', value: 'link1' },
          { title: 'link2', value: 'link2' }
        ],
        image_class_list: [
          { title: 'None', value: '' },
          { title: 'class1', value: 'class1' },
          { title: 'class2', value: 'class2' }
        ]
      }),
      cExecCommand('mceImage', true),
      cWaitForDialog(),
      cFillActiveDialog({
        src: { value: 'src' },
        alt: 'alt',
        classIndex: 1,
        dimensions: {
          width: '100',
          height: '200'
        },
        caption: true
      }),
      cSubmitDialog(),
      cAssertCleanHtml('Checking output', (() => {
        if (Env.ceFalse) {
          return (
            '<figure class="image">' +
            '<img class="class1" src="src" alt="alt" width="100" height="200" />' +
            '<figcaption>Caption</figcaption>' +
            '</figure>'
          );
        } else { // old IE
          return (
            '<p><img class="class1" src="src" alt="alt" width="100" height="200" /></p>'
          );
        }
      })()),
      Editor.cRemove
    ])
  ], () => success(), failure);
});
