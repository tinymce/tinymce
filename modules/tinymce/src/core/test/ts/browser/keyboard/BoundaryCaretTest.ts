import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { Hierarchy, Selectors, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as BoundaryCaret from 'tinymce/core/keyboard/BoundaryCaret';
import * as BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import { ZWSP } from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.keyboard.BoundaryCaretTest', () => {
  const isInlineTarget = (elm: Node) => {
    return Selectors.is(SugarElement.fromDom(elm), 'a[href],code');
  };

  const createLocation = (elm: SugarElement<Node>, elementPath: number[], offset: number) => {
    const container = Hierarchy.follow(elm, elementPath);
    const pos = CaretPosition(container.getOrDie().dom, offset);
    const location = BoundaryLocation.readLocation(isInlineTarget, elm.dom, pos);
    return location;
  };

  const testRenderCaret = (html: string, elementPath: number[], offset: number, expectedHtml: string, expectedPath: number[], expectedOffset: number) => {
    const elm = SugarElement.fromHtml<HTMLDivElement>('<div>' + html + '</div>');
    const location = createLocation(elm, elementPath, offset);
    const caret = Cell<Text | null>(null);

    assert.isTrue(location.isSome(), 'Should be a valid location: ' + html);

    const pos = BoundaryCaret.renderCaret(caret, location.getOrDie()).getOrDie();
    Assertions.assertHtml('Should be equal html', expectedHtml, elm.dom.innerHTML);

    const container = Hierarchy.follow(elm, expectedPath);
    Assertions.assertDomEq('Should be equal nodes', container.getOrDie(), SugarElement.fromDom(pos.container()));
    assert.equal(pos.offset(), expectedOffset, 'Should be expected offset');
  };

  it('renderCaret', () => {
    testRenderCaret('<p><a href="#">a</a></p>', [ 0 ], 0, '<p>' + ZWSP + '<a href="#">a</a></p>', [ 0, 0 ], 0); // TODO: This used to expect offset === 1. Investigate if that's correct
    testRenderCaret('<p><a href="#">a</a></p>', [ 0, 0, 0 ], 0, '<p><a href="#">' + ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1);
    testRenderCaret('<p><a href="#">a</a></p>', [ 0, 0, 0 ], 1, '<p><a href="#">a' + ZWSP + '</a></p>', [ 0, 0, 0 ], 1);
    testRenderCaret('<p><a href="#">a</a></p>', [ 0 ], 1, '<p><a href="#">a</a>' + ZWSP + '</p>', [ 0, 1 ], 1);
    testRenderCaret('<p><img src="#"><a href="#">a</a></p>', [ 0 ], 1, '<p><img src="#">' + ZWSP + '<a href="#">a</a></p>', [ 0, 1 ], 0);
    testRenderCaret('<p><a href="#"><img src="#">a</a></p>', [ 0, 0 ], 0, '<p><a href="#">' + ZWSP + '<img src="#">a</a></p>', [ 0, 0, 0 ], 1);
    testRenderCaret('<p><a href="#">a<img src="#"></a></p>', [ 0, 0 ], 2, '<p><a href="#">a<img src="#">' + ZWSP + '</a></p>', [ 0, 0, 2 ], 0); // TODO: This used to expect offset === 1. Investigate if that's correct
    testRenderCaret('<p><a href="#">a</a><img src="#"></p>', [ 0 ], 1, '<p><a href="#">a</a>' + ZWSP + '<img src="#"></p>', [ 0, 1 ], 1);
  });
});
