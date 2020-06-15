import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { Element, Hierarchy } from '@ephox/sugar';
import * as MergeBlocks from 'tinymce/core/delete/MergeBlocks';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.delete.MergeBlocksTest', function (success, failure) {
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cAssertHtml = function (expectedHtml) {
    return Chain.op(function () {
      Assertions.assertHtml('Should equal html', expectedHtml, viewBlock.get().innerHTML);
    });
  };

  const cMergeBlocks = function (forward, block1Path, block2Path) {
    return Chain.mapper(function (viewBlock: any) {
      const block1 = Hierarchy.follow(Element.fromDom(viewBlock.get()), block1Path).getOrDie();
      const block2 = Hierarchy.follow(Element.fromDom(viewBlock.get()), block2Path).getOrDie();
      return MergeBlocks.mergeBlocks(Element.fromDom(viewBlock.get()), forward, block1, block2);
    });
  };

  const cAssertPosition = function (expectedPath, expectedOffset) {
    return Chain.op(function (position: Option<any>) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), expectedPath).getOrDie();

      Assertions.assertDomEq('Should be expected container', container, Element.fromDom(position.getOrDie().container()));
      Assertions.assertEq('Should be expected offset', expectedOffset, position.getOrDie().offset());
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Merge forward', GeneralSteps.sequence([
      Logger.t('Merge two simple blocks', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<p>ab</p>')
      ])),

      Logger.t('Merge two simple blocks with br', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br></p><p>b</p>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<p>ab</p>')
      ])),

      Logger.t('Merge two complex blocks', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>')
      ])),

      Logger.t('Merge two headers blocks', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a</h1><h2>b</h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<h1>ab</h1>')
      ])),

      Logger.t('Merge two headers blocks first one empty', Chain.asStep(viewBlock, [
        cSetHtml('<h1><br></h1><h2>b</h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 0),
        cAssertHtml('<h2>b</h2>')
      ])),

      Logger.t('Merge two headers blocks second one empty', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a</h1><h2><br></h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<h1>a</h1>')
      ])),

      Logger.t('Merge two headers complex blocks', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<h1>a<b>b</b>c<b>d</b></h1>')
      ])),

      Logger.t('Merge two headers blocks first one empty second one complex', Chain.asStep(viewBlock, [
        cSetHtml('<h1><br></h1><h2>a<b>b</b></h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 0 ], 0),
        cAssertHtml('<h2>a<b>b</b></h2>')
      ])),

      Logger.t('Merge two headers blocks second one empty first one complex', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a<b>b</b></h1><h2><br></h2>'),
        cMergeBlocks(true, [ 0 ], [ 1 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<h1>a<b>b</b></h1>')
      ])),

      Logger.t('Merge two list items', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a<b>b</b></li><li>c<b>d</b></li></ul>'),
        cMergeBlocks(true, [ 0, 0 ], [ 0, 1 ]),
        cAssertPosition([ 0, 0, 1, 0 ], 1),
        cAssertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>')
      ])),

      Logger.t('Merge paragraph into list item', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a<b>b</b></li></ul><p>c<b>d</b></p>'),
        cMergeBlocks(true, [ 0, 0 ], [ 1 ]),
        cAssertPosition([ 0, 0, 1, 0 ], 1),
        cAssertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>')
      ])),

      Logger.t('Merge empty block into empty containing block', Chain.asStep(viewBlock, [
        cSetHtml('<div><h1></h1></div>'),
        cMergeBlocks(true, [ 0 ], [ 0, 0 ]),
        cAssertPosition([ 0 ], 0),
        cAssertHtml('<div><br data-mce-bogus="1"></div>')
      ])),

      Logger.t('Merge empty block into containing block', Chain.asStep(viewBlock, [
        cSetHtml('<div><h1></h1>c</div>'),
        cMergeBlocks(true, [ 0 ], [ 0, 0 ]),
        cAssertPosition([ 0 ], 0),
        cAssertHtml('<div><br>c</div>')
      ])),

      Logger.t('Merge first empty item of nested list into containing list item', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li><ul><li></li><li>a</li></ul></li></ul>'),
        cMergeBlocks(true, [ 0, 0 ], [ 0, 0, 0, 0 ]),
        cAssertPosition([ 0, 0 ], 0),
        cAssertHtml('<ul><li><br><ul><li>a</li></ul></li></ul>')
      ]))
    ])),

    Logger.t('Merge backwards', GeneralSteps.sequence([
      Logger.t('Merge two simple blocks', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<p>ab</p>')
      ])),

      Logger.t('Merge two simple blocks with br', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br></p><p>b</p>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<p>ab</p>')
      ])),

      Logger.t('Merge two complex blocks', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>')
      ])),

      Logger.t('Merge two headers blocks', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a</h1><h2>b</h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<h1>ab</h1>')
      ])),

      Logger.t('Merge two headers blocks first one empty', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a</h1><h2><br></h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<h1>a</h1>')
      ])),

      Logger.t('Merge two headers blocks second one empty', Chain.asStep(viewBlock, [
        cSetHtml('<h1><br></h1><h2>b</h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 0),
        cAssertHtml('<h2>b</h2>')
      ])),

      Logger.t('Merge two headers complex blocks', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<h1>a<b>b</b>c<b>d</b></h1>')
      ])),

      Logger.t('Merge two headers blocks first one empty second one complex', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a<b>b</b></h1><h2><br></h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<h1>a<b>b</b></h1>')
      ])),

      Logger.t('Merge two headers blocks second one empty first one complex', Chain.asStep(viewBlock, [
        cSetHtml('<h1><br></h1><h2>a<b>b</b></h2>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 0),
        cAssertHtml('<h2>a<b>b</b></h2>')
      ])),

      Logger.t('Merge two list items', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a<b>b</b></li><li>c<b>d</b></li></ul>'),
        cMergeBlocks(false, [ 0, 1 ], [ 0, 0 ]),
        cAssertPosition([ 0, 0, 1, 0 ], 1),
        cAssertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>')
      ])),

      Logger.t('Merge list item into paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<b>b</b></p><ul><li>c<b>d</b></li></ul>'),
        cMergeBlocks(false, [ 1, 0 ], [ 0 ]),
        cAssertPosition([ 0, 1, 0 ], 1),
        cAssertHtml('<p>a<b>b</b>c<b>d</b></p>')
      ])),

      Logger.t('Merge h1 into parent wrapper div', Chain.asStep(viewBlock, [
        cSetHtml('<div>a<h1>b</h1></div>'),
        cMergeBlocks(false, [ 0, 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<div>ab</div>')
      ])),

      Logger.t('Merge h1 inside a div into parent wrapper div', Chain.asStep(viewBlock, [
        cSetHtml('<div>a<div><h1>b</h1></div></div>'),
        cMergeBlocks(false, [ 0, 1, 0 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<div>ab</div>')
      ])),

      Logger.t('Merge div > div > div > h1 into root div', Chain.asStep(viewBlock, [
        cSetHtml('<div>a<div><div><h1>b</h1></div></div></div>'),
        cMergeBlocks(false, [ 0, 1, 0, 0 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<div>ab</div>')
      ])),

      Logger.t('Merge children until we find a block', Chain.asStep(viewBlock, [
        cSetHtml('<div>a</div><div>b<h1>c</h1></div>'),
        cMergeBlocks(false, [ 1 ], [ 0 ]),
        cAssertPosition([ 0, 0 ], 1),
        cAssertHtml('<div>ab</div><div><h1>c</h1></div>')
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
