import { ApproxStructure, Pipeline, Waiter, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsFalseEmbedTest', function (success, failure) {
  Plugin();
  Theme();

  const struct = ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              attrs: {
                'data-mce-object': str.is('iframe')
              },
              children: [
                s.element('iframe', {
                  attrs: {
                    width: str.is('200'),
                    height: str.is('100')
                  }
                }),
                s.anything()
              ]
            }),
            s.anything()
          ]
        })
      ]
    });
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TINY-950', 'Media: Open dialog, set text area content, close dialog and assert content structure', [
        Utils.sOpenDialog(tinyUi),
        Utils.sPasteTextareaValue(
          tinyUi,
          '<iframe width="200" height="100" src="a" ' +
          ' frameborder="0" allowfullscreen></iframe>'
        ),
        Utils.sSubmitDialog(tinyUi),
        Waiter.sTryUntil(
          'content was not expected structure',
          tinyApis.sAssertContentStructure(struct)
        )
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    media_dimensions: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
