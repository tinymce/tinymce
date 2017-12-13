import { ApproxStructure } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyDom } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/media/Plugin';
import Utils from 'tinymce/plugins/media/test/Utils';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsFalseEmbedTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  var struct = ApproxStructure.build(function (s, str) {
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
    var tinyUi = TinyUi(editor);
    var tinyApis = TinyApis(editor);

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
    plugins: ["media"],
    toolbar: "media",
    media_dimensions: false,
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

