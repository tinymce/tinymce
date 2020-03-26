import { ApproxStructure, Assertions, Pipeline, Step, Waiter, Logger, Log, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.EphoxEmbedTest', function (success, failure) {
  Plugin();
  Theme();

  const ephoxEmbedStructure = ApproxStructure.build(function (s, str/* , arr*/) {
    return s.element('p', {
      children: [
        s.element('div', {
          children: [
            s.element('iframe', {
              attrs: {
                src: str.is('about:blank')
              }
            })
          ],
          attrs: {
            'data-ephox-embed-iri': str.is('embed-iri'),
            'contenteditable': str.is('false')
          }
        })
      ]
    });
  });

  const sAssertDivStructure = function (editor: Editor, expected: StructAssert) {
    return Logger.t(`Assert div structure ${expected}`, Step.sync(function () {
      const div = editor.dom.select('div')[0];
      const actual = div ? Element.fromHtml(div.outerHTML) : Element.fromHtml('');
      return Assertions.sAssertStructure('Should be the same structure', expected, actual);
    }));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    const content = '<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>';

    Pipeline.async({},
      Log.steps('TBA', 'Media: Open dialog, assert embeded content, close dialog and aseert div structure', [
        apis.sFocus(),
        apis.sSetContent(content),
        sAssertDivStructure(editor, ephoxEmbedStructure),
        apis.sSelect('div', []),
        Utils.sOpenDialog(ui),
        Utils.sAssertSourceValue(ui, 'embed-iri'),
        Utils.sAssertEmbedData(ui, content),
        Utils.sSubmitDialog(ui),
        Waiter.sTryUntil('wait for div struture', sAssertDivStructure(editor, ephoxEmbedStructure))
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'media',
    toolbar: 'media',
    theme: 'silver',
    media_url_resolver(data, resolve) {
      resolve({
        html: '<video width="300" height="150" ' +
          'controls="controls">\n<source src="' + data.url + '" />\n</video>'
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
