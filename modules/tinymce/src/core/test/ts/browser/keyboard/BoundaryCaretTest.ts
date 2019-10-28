import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Cell } from '@ephox/katamari';
import { Hierarchy, Element, Selectors } from '@ephox/sugar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import BoundaryCaret from 'tinymce/core/keyboard/BoundaryCaret';
import BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock-client';
import { HTMLDivElement } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.keyboard.BoundaryCaretTest', function (success, failure) {
  const ZWSP = Zwsp.ZWSP;

  const isInlineTarget = function (elm) {
    return Selectors.is(Element.fromDom(elm), 'a[href],code');
  };

  const createLocation = function (elm, elementPath, offset) {
    const container = Hierarchy.follow(elm, elementPath);
    const pos = CaretPosition(container.getOrDie().dom(), offset);
    const location = BoundaryLocation.readLocation(isInlineTarget, elm.dom(), pos);
    return location;
  };

  const sTestRenderCaret = function (html, elementPath, offset, expectedHtml, expectedPath, expectedOffset) {
    return Step.sync(function () {
      const elm = Element.fromHtml<HTMLDivElement>('<div>' + html + '</div>');
      const location = createLocation(elm, elementPath, offset);
      const caret = Cell(null);

      Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());

      const pos = BoundaryCaret.renderCaret(caret, location.getOrDie()).getOrDie();
      Assertions.assertHtml('Should be equal html', expectedHtml, elm.dom().innerHTML);

      const container = Hierarchy.follow(elm, expectedPath);
      Assertions.assertDomEq('Should be equal nodes', container.getOrDie(), Element.fromDom(pos.container()));
    });
  };

  Pipeline.async({}, [
    Logger.t('sTestRenderCaret', GeneralSteps.sequence([
      sTestRenderCaret('<p><a href="#">a</a></p>', [0], 0, '<p>' + ZWSP + '<a href="#">a</a></p>', [0, 0], 1),
      sTestRenderCaret('<p><a href="#">a</a></p>', [0, 0, 0], 0, '<p><a href="#">' + ZWSP + 'a</a></p>', [0, 0, 0], 1),
      sTestRenderCaret('<p><a href="#">a</a></p>', [0, 0, 0], 1, '<p><a href="#">a' + ZWSP + '</a></p>', [0, 0, 0], 1),
      sTestRenderCaret('<p><a href="#">a</a></p>', [0], 1, '<p><a href="#">a</a>' + ZWSP + '</p>', [0, 1], 1),
      sTestRenderCaret('<p><img src="#"><a href="#">a</a></p>', [0], 1, '<p><img src="#">' + ZWSP + '<a href="#">a</a></p>', [0, 1], 0),
      sTestRenderCaret('<p><a href="#"><img src="#">a</a></p>', [0, 0], 0, '<p><a href="#">' + ZWSP + '<img src="#">a</a></p>', [0, 0, 0], 1),
      sTestRenderCaret('<p><a href="#">a<img src="#"></a></p>', [0, 0], 2, '<p><a href="#">a<img src="#">' + ZWSP + '</a></p>', [0, 0, 2], 1),
      sTestRenderCaret('<p><a href="#">a</a><img src="#"></p>', [0], 1, '<p><a href="#">a</a>' + ZWSP + '<img src="#"></p>', [0, 1], 1)
    ]))
  ], function () {
    success();
  }, failure);
});
