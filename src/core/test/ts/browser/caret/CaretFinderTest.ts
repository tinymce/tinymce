import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { Hierarchy, Element } from '@ephox/sugar';
import CaretFinder from 'tinymce/core/caret/CaretFinder';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.CaretFinderTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cCreateFromPosition = function (path, offset) {
    return Chain.mapper(function (viewBlock: any) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      return CaretPosition(container.dom(), offset);
    });
  };

  const cAssertCaretPosition = function (path, expectedOffset) {
    return Chain.op(function (posOption: Option<any>) {
      const pos = posOption.getOrDie();
      const expectedContainer = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      Assertions.assertDomEq('Should be the expected container', expectedContainer, Element.fromDom(pos.container()));
      Assertions.assertEq('Should be the expected offset', expectedOffset, pos.offset());
    });
  };

  const cAssertNone = Chain.op(function (pos: Option<any>) {
    Assertions.assertEq('Should be the none but got some', true, pos.isNone());
  });

  const cFromPosition = function (forward) {
    return Chain.mapper(function (from: CaretPosition) {
      return CaretFinder.fromPosition(forward, viewBlock.get(), from);
    });
  };

  const cNavigate = function (forward) {
    return Chain.mapper(function (from: CaretPosition) {
      return CaretFinder.navigate(forward, viewBlock.get(), from);
    });
  };

  const cPositionIn = function (forward, path) {
    return Chain.mapper(function (_) {
      const element = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      return CaretFinder.positionIn(forward, element.dom());
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('fromPosition', GeneralSteps.sequence([
      Logger.t('Should walk to first text node offset', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cCreateFromPosition([], 0),
        cFromPosition(true),
        cAssertCaretPosition([0, 0], 0)
      ])),
      Logger.t('Should walk to last text node offset', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cCreateFromPosition([], 1),
        cFromPosition(false),
        cAssertCaretPosition([0, 0], 1)
      ])),
      Logger.t('Should walk to from text node offset 0 to 1', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cCreateFromPosition([0, 0], 0),
        cFromPosition(true),
        cAssertCaretPosition([0, 0], 1)
      ])),
      Logger.t('Should walk to from text node offset 1 to 0', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cCreateFromPosition([0, 0], 1),
        cFromPosition(false),
        cAssertCaretPosition([0, 0], 0)
      ])),
      Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
        cSetHtml(''),
        cCreateFromPosition([], 0),
        cFromPosition(false),
        cAssertNone
      ]))
    ])),

    Logger.t('navigate', GeneralSteps.sequence([
      Logger.t('navigate - forward', GeneralSteps.sequence([
        Logger.t('Should walk to second offset in text inside b', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<b>b</b></p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1, 0], 1)
        ])),
        Logger.t('Should walk from last text position in one b into the second text position in another b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b><b>b</b></p>'),
          cCreateFromPosition([0, 0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1, 0], 1)
        ])),
        Logger.t('Should walk to after input in b', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<b><input></b></p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1], 1)
        ])),
        Logger.t('Should walk from after input to after input in b', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><b><input></b></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1], 1)
        ])),
        Logger.t('Should walk from after input inside b to after input in another b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b><b><input></b></p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1], 1)
        ])),
        Logger.t('Should walk from after input to second text offset in b', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><b>a</b></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 1, 0], 1)
        ])),
        Logger.t('Should walk from over input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cCreateFromPosition([0], 0),
          cNavigate(true),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk from before first input to after first input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input></p>'),
          cCreateFromPosition([0], 0),
          cNavigate(true),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk from after first input to after second input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertCaretPosition([0], 2)
        ])),
        Logger.t('Should walk from after first input to after second input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertCaretPosition([0], 2)
        ])),
        Logger.t('should walk from after last text node offset to before CEF span', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br><span contenteditable="false">b</span></p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0], 2)
        ])),
        Logger.t('Should walk from last text node offset over br to first text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br>b</p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 2], 0)
        ])),
        Logger.t('Should walk from after input over br to first text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><br>b</p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertCaretPosition([0, 2], 0)
        ])),
        Logger.t('Should walk from last text offset in first paragraph to first text offset in second paragraph', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertCaretPosition([1, 0], 0)
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml(''),
          cCreateFromPosition([], 0),
          cNavigate(true),
          cAssertNone
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([0, 0], 1),
          cNavigate(true),
          cAssertNone
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(true),
          cAssertNone
        ]))
      ])),

      Logger.t('navigate - backwards', GeneralSteps.sequence([
        Logger.t('Should walk to first offset in text inside b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b>b</p>'),
          cCreateFromPosition([0, 1], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0, 0], 0)
        ])),
        Logger.t('Should walk from last text position in one b into the second text position in another b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b><b>b</b></p>'),
          cCreateFromPosition([0, 1, 0], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0, 0], 0)
        ])),
        Logger.t('Should walk to before input in b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b>b</p>'),
          cCreateFromPosition([0, 1], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk from before input to before input in b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk from before input inside b to before input in another b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b><b><input></b></p>'),
          cCreateFromPosition([0, 1], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk from before input to first text offset in b', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(false),
          cAssertCaretPosition([0, 0, 0], 0)
        ])),
        Logger.t('Should walk from over input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(false),
          cAssertCaretPosition([0], 0)
        ])),
        Logger.t('Should walk from after last input to after first input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input></p>'),
          cCreateFromPosition([0], 2),
          cNavigate(false),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should from after first input to before first input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input></p>'),
          cCreateFromPosition([0], 1),
          cNavigate(false),
          cAssertCaretPosition([0], 0)
        ])),
        Logger.t('Should from before last input to after first input', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><input><input></p>'),
          cCreateFromPosition([0], 2),
          cNavigate(false),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk from first text node offset over br to last text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br>b</p>'),
          cCreateFromPosition([0, 2], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should walk from before input over br to last text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br><input></p>'),
          cCreateFromPosition([0], 2),
          cNavigate(false),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk from first text offset in second paragraph to first text offset in first paragraph', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cCreateFromPosition([1, 0], 0),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml(''),
          cCreateFromPosition([], 0),
          cNavigate(false),
          cAssertNone
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([0, 0], 0),
          cNavigate(false),
          cAssertNone
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cCreateFromPosition([0], 0),
          cNavigate(false),
          cAssertNone
        ])),
        Logger.t('Should jump over bogus elements', Chain.asStep(viewBlock, [
          cSetHtml([
            '<p>1</p>',
            '<p data-mce-bogus="all"></p>',
            '<p>2</p>'
          ].join('')),
          cCreateFromPosition([], 2),
          cNavigate(false),
          cAssertCaretPosition([0, 0], 1)
        ])),
      ]))
    ])),

    Logger.t('positionIn', GeneralSteps.sequence([
      Logger.t('Should walk to first text node offset', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cPositionIn(true, [0]),
        cAssertCaretPosition([0, 0], 0)
      ])),
      Logger.t('Should walk to last text node offset', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cPositionIn(false, [0]),
        cAssertCaretPosition([0, 0], 1)
      ])),
      Logger.t('Should walk to first element offset', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p>'),
        cPositionIn(true, [0]),
        cAssertCaretPosition([0], 0)
      ])),
      Logger.t('Should walk to last element offset', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p>'),
        cPositionIn(false, [0]),
        cAssertCaretPosition([0], 1)
      ])),
      Logger.t('Should walk to last element offset skip br', Chain.asStep(viewBlock, [
        cSetHtml('<p><input><br></p>'),
        cPositionIn(false, [0]),
        cAssertCaretPosition([0], 1)
      ])),
      Logger.t('Should walk to first inner element offset', Chain.asStep(viewBlock, [
        cSetHtml('<p><b><input></b></p>'),
        cPositionIn(true, [0]),
        cAssertCaretPosition([0, 0], 0)
      ])),
      Logger.t('Should walk to last inner element offset', Chain.asStep(viewBlock, [
        cSetHtml('<p><b><input></b></p>'),
        cPositionIn(false, [0]),
        cAssertCaretPosition([0, 0], 1)
      ])),
      Logger.t('Should not find any position in an empty element', Chain.asStep(viewBlock, [
        cSetHtml('<p></p>'),
        cPositionIn(true, [0]),
        cAssertNone
      ])),
      Logger.t('Should not find any position in an empty element', Chain.asStep(viewBlock, [
        cSetHtml('<p></p>'),
        cPositionIn(false, [0]),
        cAssertNone
      ])),
      Logger.t('Should not find any position in an empty element and not walk outside backwards', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p></p><p>b</p>'),
        cPositionIn(false, [1]),
        cAssertNone
      ])),
      Logger.t('Should not find any position in an empty element and not walk outside forwards', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p></p><p>b</p>'),
        cPositionIn(true, [1]),
        cAssertNone
      ])),
      Logger.t('Should walk past comment node backwards', Chain.asStep(viewBlock, [
        cSetHtml('<p><!-- a-->b<!-- c --></p>'),
        cPositionIn(false, []),
        cAssertCaretPosition([0, 1], 1)
      ])),
      Logger.t('Should walk past comment node forwards', Chain.asStep(viewBlock, [
        cSetHtml('<p><!-- a-->b<!-- c --></p>'),
        cPositionIn(true, []),
        cAssertCaretPosition([0, 1], 0)
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
