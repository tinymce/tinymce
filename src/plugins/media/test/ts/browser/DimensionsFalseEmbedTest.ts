import { ApproxStructure, Pipeline, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsFalseEmbedTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

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

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Utils.sOpenDialog(tinyUi),
      Utils.sPasteTextareaValue(
        tinyUi,
        '<iframe width="200" height="100" src="a" ' +
        ' frameborder="0" allowfullscreen></iframe>'
      ),
      Utils.sSubmitDialog(tinyUi),
      Waiter.sTryUntil(
        'content was not expected structure',
        tinyApis.sAssertContentStructure(struct),
        100,
        4000
      )
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    media_dimensions: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
