import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import * as RangeNormalizer from 'tinymce/core/selection/RangeNormalizer';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.selection.RangeNormalizerTest', (success, failure) => {
  const viewBlock = ViewBlock();

  const sSetContent = (html) => {
    return Step.sync(() => {
      viewBlock.update(html);
    });
  };

  const mNormalizeRange = Step.stateful((value: any, next, _die) => {
    next(RangeNormalizer.normalize(value));
  });

  const mCreateRange = (startPath, startOffset, endPath, endOffset) => {
    return Step.stateful((_value, next, _die) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();
      const rng = document.createRange();
      rng.setStart(startContainer.dom, startOffset);
      rng.setEnd(endContainer.dom, endOffset);
      next(rng);
    });
  };

  const mAssertRange = (startPath, startOffset, endPath, endOffset) => {
    return Step.stateful((value: any, next, _die) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();

      Assertions.assertDomEq('Should be expected startContainer', startContainer, SugarElement.fromDom(value.startContainer));
      Assertions.assertEq('Should be expected startOffset', startOffset, value.startOffset);
      Assertions.assertDomEq('Should be expected endContainer', endContainer, SugarElement.fromDom(value.endContainer));
      Assertions.assertEq('Should be expected endOffset', endOffset, value.endOffset);

      next(value);
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Normalize range no change', GeneralSteps.sequence([
      sSetContent('<p><br></p>'),
      mCreateRange([ 0 ], 0, [ 0 ], 0),
      mNormalizeRange,
      mAssertRange([ 0 ], 0, [ 0 ], 0)
    ])),
    Logger.t('Normalize webkit triple click selection paragraph', GeneralSteps.sequence([
      sSetContent('<blockquote><p>a</p></blockquote><p>b</p>'),
      mCreateRange([ 0, 0, 0 ], 0, [ 1 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
    ])),
    Logger.t('Normalize webkit triple click selection heading', GeneralSteps.sequence([
      sSetContent('<blockquote><p>a</p></blockquote><h1>b</h1>'),
      mCreateRange([ 0, 0, 0 ], 0, [ 1 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
    ])),
    Logger.t('Normalize webkit triple click selection headings', GeneralSteps.sequence([
      sSetContent('<blockquote><h1>a</h1></blockquote><h1>b</h1>'),
      mCreateRange([ 0, 0, 0 ], 0, [ 1 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
    ])),
    Logger.t('Normalize webkit triple click selection divs', GeneralSteps.sequence([
      sSetContent('<blockquote><div>a</div></blockquote><div>b</div>'),
      mCreateRange([ 0, 0, 0 ], 0, [ 1 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
    ])),
    Logger.t('Normalize webkit triple click selection between LI:s', GeneralSteps.sequence([
      sSetContent('<ul><li>a</li></ul><ul><li>b</li></ul>'),
      mCreateRange([ 0, 0, 0 ], 0, [ 1, 0 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
    ])),
    Logger.t('Normalize from block start to previous block end', GeneralSteps.sequence([
      sSetContent('<p>a</p><p>b<p>'),
      mCreateRange([ 0, 0 ], 0, [ 1, 0 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0 ], 0, [ 0, 0 ], 1)
    ])),
    Logger.t('Do not normalize when end position has a valid previous position in the block', GeneralSteps.sequence([
      sSetContent('<p>a</p><p>b<p>'),
      mCreateRange([ 0, 0 ], 0, [ 1, 0 ], 1),
      mNormalizeRange,
      mAssertRange([ 0, 0 ], 0, [ 1, 0 ], 1)
    ])),
    Logger.t('Do not normalize when selection is on inline elements', GeneralSteps.sequence([
      sSetContent('<b>a</b><b>b<b>'),
      mCreateRange([ 0, 0 ], 0, [ 1, 0 ], 0),
      mNormalizeRange,
      mAssertRange([ 0, 0 ], 0, [ 1, 0 ], 0)
    ]))
  ], () => {
    viewBlock.detach();
    success();
  }, failure);
});
