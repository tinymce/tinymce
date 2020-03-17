import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Hierarchy, Element, Node } from '@ephox/sugar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as InlineUtils from 'tinymce/core/keyboard/InlineUtils';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock-client';
import { Text } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.keyboard.InlineUtilsTest', function (success, failure) {
  const ZWSP = Zwsp.ZWSP;

  const cCreateElement = function (html) {
    return Chain.injectThunked(function () {
      return Element.fromHtml(html);
    });
  };

  const cNormalizePosition = function (forward, path, offset) {
    return Chain.mapper(function (elm: any) {
      const container = Hierarchy.follow(elm, path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return { pos: InlineUtils.normalizePosition(forward, pos), elm };
    });
  };

  const cAssertPosition = function (path, expectedOffset) {
    return Chain.mapper(function (elmPos: any) {
      const expectedContainer = Hierarchy.follow(elmPos.elm, path).getOrDie();
      Assertions.assertDomEq('Should be expected container', Element.fromDom(elmPos.pos.container()), expectedContainer);
      Assertions.assertEq('Should be expected offset', elmPos.pos.offset(), expectedOffset);
      return {};
    });
  };

  const cSplitAt = function (path, offset) {
    return Chain.mapper(function (elm: any) {
      const textNode = Hierarchy.follow(elm, path).filter(Node.isText).getOrDie();
      textNode.dom().splitText(offset);
      return elm;
    });
  };

  const createFakeEditor = function (settings) {
    return {
      settings,
      getParam: (name: string, defaultVal?: any, type?: string) => settings[name] || defaultVal
    } as any;
  };

  Pipeline.async({}, [
    Logger.t('isInlineTarget with various editor settings', Step.sync(function () {
      Assertions.assertEq('Links should be inline target', true, InlineUtils.isInlineTarget(createFakeEditor({ }), Element.fromHtml('<a href="a">').dom()));
      Assertions.assertEq('Code should be inline target', true, InlineUtils.isInlineTarget(createFakeEditor({ }), Element.fromHtml('<code>').dom()));
      Assertions.assertEq('Annotations should be inline target', true, InlineUtils.isInlineTarget(createFakeEditor({ }), Element.fromHtml('<span class="mce-annotation"></span>').dom()));
      Assertions.assertEq('None link anchor should not be inline target', false, InlineUtils.isInlineTarget(createFakeEditor({ }), Element.fromHtml('<a>').dom()));
      Assertions.assertEq('Bold should not be inline target', false, InlineUtils.isInlineTarget(createFakeEditor({ }), Element.fromHtml('<b>').dom()));
      Assertions.assertEq('Bold should be inline target if configured', true, InlineUtils.isInlineTarget(createFakeEditor({
        inline_boundaries_selector: 'b'
      }), Element.fromHtml('<b>').dom()));
      Assertions.assertEq('Italic should be inline target if configured', true, InlineUtils.isInlineTarget(createFakeEditor({
        inline_boundaries_selector: 'b,i'
      }), Element.fromHtml('<i>').dom()));
    })),

    Logger.t('normalizePosition on text forwards', GeneralSteps.sequence([
      Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cNormalizePosition(true, [ 0 ], 0),
        cAssertPosition([ 0 ], 1)
      ])),
      Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cNormalizePosition(true, [ 0 ], 1),
        cAssertPosition([ 0 ], 1)
      ])),
      Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cNormalizePosition(true, [ 0 ], 1),
        cAssertPosition([ 0 ], 2)
      ])),
      Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cNormalizePosition(true, [ 0 ], 2),
        cAssertPosition([ 0 ], 2)
      ]))
    ])),

    Logger.t('normalizePosition on text backwards', GeneralSteps.sequence([
      Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cNormalizePosition(false, [ 0 ], 2),
        cAssertPosition([ 0 ], 1)
      ])),
      Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cNormalizePosition(false, [ 0 ], 1),
        cAssertPosition([ 0 ], 1)
      ])),
      Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cNormalizePosition(false, [ 0 ], 1),
        cAssertPosition([ 0 ], 0)
      ])),
      Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cNormalizePosition(false, [ 0 ], 0),
        cAssertPosition([ 0 ], 0)
      ]))
    ])),

    Logger.t('normalizePosition on element forwards', GeneralSteps.sequence([
      Logger.t('normalizePosition start of zwsp before element', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + '<input></p>'),
        cNormalizePosition(true, [ 0 ], 0),
        cAssertPosition([], 1)
      ])),
      Logger.t('normalizePosition end of zwsp before element', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + '<input></p>'),
        cNormalizePosition(true, [ 0 ], 1),
        cAssertPosition([], 1)
      ])),
      Logger.t('normalizePosition start of zwsp after element', Chain.asStep({}, [
        cCreateElement('<p><input>' + ZWSP + '</p>'),
        cNormalizePosition(true, [ 1 ], 0),
        cAssertPosition([], 2)
      ])),
      Logger.t('normalizePosition end of zwsp after element', Chain.asStep({}, [
        cCreateElement('<p><input>' + ZWSP + '</p>'),
        cNormalizePosition(true, [ 1 ], 1),
        cAssertPosition([], 2)
      ]))
    ])),

    Logger.t('normalizePosition on element backwards', GeneralSteps.sequence([
      Logger.t('normalizePosition end of zwsp after element', Chain.asStep({}, [
        cCreateElement('<p><input>' + ZWSP + '</p>'),
        cNormalizePosition(false, [ 1 ], 1),
        cAssertPosition([], 1)
      ])),
      Logger.t('normalizePosition start of zwsp after element', Chain.asStep({}, [
        cCreateElement('<p><input>' + ZWSP + '</p>'),
        cNormalizePosition(false, [ 1 ], 0),
        cAssertPosition([], 1)
      ])),
      Logger.t('normalizePosition end of zwsp before element', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + '<input></p>'),
        cNormalizePosition(false, [ 0 ], 1),
        cAssertPosition([], 0)
      ])),
      Logger.t('normalizePosition start of zwsp before element', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + '<input></p>'),
        cNormalizePosition(false, [ 0 ], 0),
        cAssertPosition([], 0)
      ]))
    ])),

    Logger.t('normalizePosition on text forwards', GeneralSteps.sequence([
      Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cSplitAt([ 0 ], 1),
        cNormalizePosition(true, [ 0 ], 0),
        cAssertPosition([ 1 ], 0)
      ])),
      Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
        cCreateElement('<p>' + ZWSP + 'a</p>'),
        cSplitAt([ 0 ], 1),
        cNormalizePosition(true, [ 0 ], 1),
        cAssertPosition([ 1 ], 0)
      ])),
      Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cSplitAt([ 0 ], 1),
        cNormalizePosition(true, [ 1 ], 0),
        cAssertPosition([], 2)
      ])),
      Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
        cCreateElement('<p>a' + ZWSP + '</p>'),
        cSplitAt([ 0 ], 1),
        cNormalizePosition(true, [ 1 ], 1),
        cAssertPosition([], 2)
      ]))
    ]))
  ], function () {
    success();
  }, failure);
});
