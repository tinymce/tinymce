import { GeneralSteps, Logger, Pipeline, Step, Assertions, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import RangePoint from 'tinymce/core/dom/RangePoint';

UnitTest.asynctest('browser.tinymce.core.dom.RangePointsTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertXYWithinRange = (x: number, y: number) => Waiter.sTryUntil('Assert XY position is within selection range', Step.sync(() => {
      const actual = RangePoint.isXYWithinRange(x, y, editor.selection.getRng());
      Assertions.assertEq('Assert XY position is within selection range', true, actual);
    }));

    Pipeline.async({}, [
      Logger.t('point in image selection', GeneralSteps.sequence([
        // Insert 20x20px image
        tinyApis.sSetContent('<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAHUlEQVR42mNk+A+EVASMowaOGjhq4KiBowaOVAMBOBYn7dVkgssAAAAASUVORK5CYII="></p>'),
        tinyApis.sSetSelection([0], 0, [0], 1),
        sAssertXYWithinRange(10, 10)
      ])),
      Logger.t('point in text content selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Some text content</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 9),
        sAssertXYWithinRange(15, 5)
      ])),
      Logger.t('point in table selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><table><tbody><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table></p>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 1, 0], 8),
        sAssertXYWithinRange(25, 20),
        sAssertXYWithinRange(150, 20),
      ]))
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body, p { margin: 0 }'
  }, success, failure);
});
