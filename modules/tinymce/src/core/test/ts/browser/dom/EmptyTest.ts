import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import * as Empty from 'tinymce/core/dom/Empty';

UnitTest.asynctest('browser.tinymce.core.dom.EmptyTest', (success, failure) => {

  const sTestEmpty = (html, expected) => {
    return Step.sync(() => {
      const elm = SugarElement.fromHtml(html);
      const expectedLabel = expected ? 'empty' : 'not empty';
      Assertions.assertEq(html + ' should be treated as ' + expectedLabel, expected, Empty.isEmpty(elm));
    });
  };

  Pipeline.async({}, [
    Logger.t('Empty elements', GeneralSteps.sequence([
      sTestEmpty(' ', true),
      sTestEmpty('\t', true),
      sTestEmpty('\r', true),
      sTestEmpty('\n', true),
      sTestEmpty(' \t\r\n ', true),
      sTestEmpty('<!-- x -->', true),
      sTestEmpty('<p></p>', true),
      sTestEmpty('<b></b>', true),
      sTestEmpty('<p><b></b></p>', true),
      sTestEmpty('<p><br></p>', true),
      sTestEmpty('<p><i><b></b></i><b><i></i></b></p>', true),
      sTestEmpty('<span></span>', true),
      sTestEmpty('<p><i><b></b></i><b><i data-mce-bogus="all"><img src="#"></i></b></p>', true),
      sTestEmpty('<p><br data-mce-bogus="1"><br></p>', true),
      sTestEmpty('<a id="link" href="http://some.url/"></a>', true)
    ])),
    Logger.t('Non empty elements', GeneralSteps.sequence([
      sTestEmpty('<br>', false),
      sTestEmpty('<img src="#">', false),
      sTestEmpty('<input>', false),
      sTestEmpty('<textarea></textarea>', false),
      sTestEmpty('<hr>', false),
      sTestEmpty('a', false),
      sTestEmpty('abc', false),
      sTestEmpty('<p>abc</p>', false),
      sTestEmpty('<p><br><br></p>', false),
      sTestEmpty('<p><i><b></b></i><b><i><img src="#"></i></b></p>', false),
      sTestEmpty('<span data-mce-bookmark="x"></span>', false),
      sTestEmpty('<span contenteditable="false"></span>', false),
      sTestEmpty('<a id="anchor"></a>', false)
    ]))
  ], success, failure);
});
