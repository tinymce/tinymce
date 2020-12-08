import { Assertions, Chain, Log, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Insert, Remove, SugarBody, SugarElement, SugarHead, TextContent, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Grid sink sizing test', (success, failure) => {
  Theme();

  const style = SugarElement.fromTag('style');
  TextContent.set(style, `
body {
  display: grid;
  grid-template-columns: 200px 1fr;
}
`);
  Insert.append(SugarHead.head(), style);

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Log.chainsAsStep('TINY-6783', 'Sink width matches body width when in display grid', [
        NamedChain.asChain([
          NamedChain.writeValue('body', SugarBody.body()),
          NamedChain.direct('body', Chain.mapper((body) => Width.get(body)), 'bodyWidth'),
          NamedChain.direct('body', UiFinder.cFindIn('.tox-silver-sink'), 'sink'),
          NamedChain.direct('sink', Chain.mapper((sink) => Width.get(sink)), 'sinkWidth'),
          NamedChain.merge([ 'bodyWidth', 'sinkWidth' ], 'widths'),
          NamedChain.read('widths', Chain.op((widths) => {
            Assertions.assertEq(`Sink should be ${widths.bodyWidth}px wide`, widths.bodyWidth, widths.sinkWidth);
          }))
        ]),
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, () => {
    Remove.remove(style);
    success();
  }, failure);
});
