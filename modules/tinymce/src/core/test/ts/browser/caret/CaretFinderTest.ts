import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as CaretFinder from 'tinymce/core/caret/CaretFinder';
import CaretPosition from 'tinymce/core/caret/CaretPosition';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretFinderTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const createFromPosition = (path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    return CaretPosition(container.dom, offset);
  };

  const assertCaretPosition = (posOption: Optional<any>, path: number[], expectedOffset: number) => {
    const pos = posOption.getOrDie();
    const expectedContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    Assertions.assertDomEq('Should be the expected container', expectedContainer, SugarElement.fromDom(pos.container()));
    assert.equal(pos.offset(), expectedOffset, 'Should be the expected offset');
  };

  const assertNone = (pos: Optional<CaretPosition>) => {
    assert.isTrue(pos.isNone(), 'Should be the none but got some');
  };

  const fromPosition = (from: CaretPosition, forward: boolean) => {
    return CaretFinder.fromPosition(forward, viewBlock.get(), from);
  };

  const navigate = (from: CaretPosition, forward: boolean) => {
    return CaretFinder.navigate(forward, viewBlock.get(), from);
  };

  const positionIn = (forward: boolean, path: number[]) => {
    const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie() as SugarElement<HTMLElement>;
    return CaretFinder.positionIn(forward, element.dom);
  };

  context('fromPosition', () => {
    it('Should walk to first text node offset', () => {
      setHtml('<p>a</p>');
      const pos = createFromPosition([], 0);
      const fromOpt = fromPosition(pos, true);
      assertCaretPosition(fromOpt, [ 0, 0 ], 0);
    });

    it('Should walk to last text node offset', () => {
      setHtml('<p>a</p>');
      const pos = createFromPosition([], 1);
      const fromOpt = fromPosition(pos, false);
      assertCaretPosition(fromOpt, [ 0, 0 ], 1);
    });

    it('Should walk to from text node offset 0 to 1', () => {
      setHtml('<p>a</p>');
      const pos = createFromPosition([ 0, 0 ], 0);
      const fromOpt = fromPosition(pos, true);
      assertCaretPosition(fromOpt, [ 0, 0 ], 1);
    });

    it('Should walk to from text node offset 1 to 0', () => {
      setHtml('<p>a</p>');
      const pos = createFromPosition([ 0, 0 ], 1);
      const fromOpt = fromPosition(pos, false);
      assertCaretPosition(fromOpt, [ 0, 0 ], 0);
    });

    it('Should not walk anywhere since there is nothing to walk to 1', () => {
      setHtml('');
      const pos = createFromPosition([], 0);
      const fromOpt = fromPosition(pos, false);
      assertNone(fromOpt);
    });
  });

  context('navigate', () => {
    context('navigate forward', () => {
      it('Should walk to second offset in text inside b', () => {
        setHtml('<p>a<b>b</b></p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1, 0 ], 1);
      });

      it('Should walk from last text position in one b into the second text position in another b', () => {
        setHtml('<p><b>a</b><b>b</b></p>');
        const pos = createFromPosition([ 0, 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1, 0 ], 1);
      });

      it('Should walk to after input in b', () => {
        setHtml('<p>a<b><input></b></p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1 ], 1);
      });

      it('Should walk from after input to after input in b', () => {
        setHtml('<p><input><b><input></b></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1 ], 1);
      });

      it('Should walk from after input inside b to after input in another b', () => {
        setHtml('<p><b><input></b><b><input></b></p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1 ], 1);
      });

      it('Should walk from after input to second text offset in b', () => {
        setHtml('<p><input><b>a</b></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 1, 0 ], 1);
      });

      it('Should walk from over input', () => {
        setHtml('<p><input></p>');
        const pos = createFromPosition([ 0 ], 0);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0 ], 1);
      });

      it('Should walk from before first input to after first input', () => {
        setHtml('<p><input><input></p>');
        const pos = createFromPosition([ 0 ], 0);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0 ], 1);
      });

      it('Should walk from after first input to after second input', () => {
        setHtml('<p><input><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0 ], 2);
      });

      it('Should walk from after first input to after second input with three inputs', () => {
        setHtml('<p><input><input><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0 ], 2);
      });

      it('should walk from after last text node offset to before CEF span', () => {
        setHtml('<p>a<br><span contenteditable="false">b</span></p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0 ], 2);
      });

      it('Should walk from last text node offset over br to first text node offset', () => {
        setHtml('<p>a<br>b</p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 2 ], 0);
      });

      it('Should walk from after input over br to first text node offset', () => {
        setHtml('<p><input><br>b</p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 0, 2 ], 0);
      });

      it('Should walk from last text offset in first paragraph to first text offset in second paragraph', () => {
        setHtml('<p>a</p><p>b</p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertCaretPosition(navigateOpt, [ 1, 0 ], 0);
      });

      it('Should not walk anywhere since there is nothing to walk to (forwards) 1', () => {
        setHtml('');
        const pos = createFromPosition([], 0);
        const navigateOpt = navigate(pos, true);
        assertNone(navigateOpt);
      });

      it('Should not walk anywhere since there is nothing to walk to (forwards) 2', () => {
        setHtml('<p>a</p>');
        const pos = createFromPosition([ 0, 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertNone(navigateOpt);
      });

      it('Should not walk anywhere since there is nothing to walk to (forwards) 3', () => {
        setHtml('<p><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, true);
        assertNone(navigateOpt);
      });
    });

    context('navigate backwards', () => {
      it('Should walk to first offset in text inside b', () => {
        setHtml('<p><b>a</b>b</p>');
        const pos = createFromPosition([ 0, 1 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0, 0 ], 0);
      });

      it('Should walk from last text position in one b into the second text position in another b', () => {
        setHtml('<p><b>a</b><b>b</b></p>');
        const pos = createFromPosition([ 0, 1, 0 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0, 0 ], 0);
      });

      it('Should walk to before input in b', () => {
        setHtml('<p><b><input></b>b</p>');
        const pos = createFromPosition([ 0, 1 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 0);
      });

      it('Should walk from before input to before input in b', () => {
        setHtml('<p><b><input></b><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 0);
      });

      it('Should walk from before input inside b to before input in another b', () => {
        setHtml('<p><b><input></b><b><input></b></p>');
        const pos = createFromPosition([ 0, 1 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 0);
      });

      it('Should walk from before input to first text offset in b', () => {
        setHtml('<p><b>a</b><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0, 0 ], 0);
      });

      it('Should walk from over input', () => {
        setHtml('<p><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0 ], 0);
      });

      it('Should walk from after last input to after first input', () => {
        setHtml('<p><input><input></p>');
        const pos = createFromPosition([ 0 ], 2);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0 ], 1);
      });

      it('Should from after first input to before first input', () => {
        setHtml('<p><input><input></p>');
        const pos = createFromPosition([ 0 ], 1);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0 ], 0);
      });

      it('Should from before last input to after first input', () => {
        setHtml('<p><input><input><input></p>');
        const pos = createFromPosition([ 0 ], 2);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0 ], 1);
      });

      it('Should walk from first text node offset over br to last text node offset', () => {
        setHtml('<p>a<br>b</p>');
        const pos = createFromPosition([ 0, 2 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 1);
      });

      it('Should walk from before input over br to last text node offset', () => {
        setHtml('<p>a<br><input></p>');
        const pos = createFromPosition([ 0 ], 2);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0 ], 1);
      });

      it('Should walk from first text offset in second paragraph to first text offset in first paragraph', () => {
        setHtml('<p>a</p><p>b</p>');
        const pos = createFromPosition([ 1, 0 ], 0);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 1);
      });

      it('Should not walk anywhere since there is nothing to walk to (backwards) 1', () => {
        setHtml('');
        const pos = createFromPosition([], 0);
        const navigateOpt = navigate(pos, false);
        assertNone(navigateOpt);
      });

      it('Should not walk anywhere since there is nothing to walk to (backwards) 2', () => {
        setHtml('<p>a</p>');
        const pos = createFromPosition([ 0, 0 ], 0);
        const navigateOpt = navigate(pos, false);
        assertNone(navigateOpt);
      });

      it('Should not walk anywhere since there is nothing to walk to (backwards) 3', () => {
        setHtml('<p><input></p>');
        const pos = createFromPosition([ 0 ], 0);
        const navigateOpt = navigate(pos, false);
        assertNone(navigateOpt);
      });

      it('Should jump over bogus elements', () => {
        setHtml([
          '<p>1</p>',
          '<p data-mce-bogus="all"></p>',
          '<p>2</p>'
        ].join(''));
        const pos = createFromPosition([], 2);
        const navigateOpt = navigate(pos, false);
        assertCaretPosition(navigateOpt, [ 0, 0 ], 1);
      });
    });
  });

  context('positionIn', () => {
    it('Should walk to first text node offset', () => {
      setHtml('<p>a</p>');
      const posOpt = positionIn(true, [ 0 ]);
      assertCaretPosition(posOpt, [ 0, 0 ], 0);
    });

    it('Should walk to last text node offset', () => {
      setHtml('<p>a</p>');
      const posOpt = positionIn(false, [ 0 ]);
      assertCaretPosition(posOpt, [ 0, 0 ], 1);
    });

    it('Should walk to first element offset', () => {
      setHtml('<p><input></p>');
      const posOpt = positionIn(true, [ 0 ]);
      assertCaretPosition(posOpt, [ 0 ], 0);
    });

    it('Should walk to last element offset', () => {
      setHtml('<p><input></p>');
      const posOpt = positionIn(false, [ 0 ]);
      assertCaretPosition(posOpt, [ 0 ], 1);
    });

    it('Should walk to last element offset skip br', () => {
      setHtml('<p><input><br></p>');
      const posOpt = positionIn(false, [ 0 ]);
      assertCaretPosition(posOpt, [ 0 ], 1);
    });

    it('Should walk to first inner element offset', () => {
      setHtml('<p><b><input></b></p>');
      const posOpt = positionIn(true, [ 0 ]);
      assertCaretPosition(posOpt, [ 0, 0 ], 0);
    });

    it('Should walk to last inner element offset', () => {
      setHtml('<p><b><input></b></p>');
      const posOpt = positionIn(false, [ 0 ]);
      assertCaretPosition(posOpt, [ 0, 0 ], 1);
    });

    it('Should not find any position in an empty element (forwards)', () => {
      setHtml('<p></p>');
      const posOpt = positionIn(true, [ 0 ]);
      assertNone(posOpt);
    });

    it('Should not find any position in an empty element (backwards)', () => {
      setHtml('<p></p>');
      const posOpt = positionIn(false, [ 0 ]);
      assertNone(posOpt);
    });

    it('Should not find any position in an empty element and not walk outside backwards', () => {
      setHtml('<p>a</p><p></p><p>b</p>');
      const posOpt = positionIn(false, [ 1 ]);
      assertNone(posOpt);
    });

    it('Should not find any position in an empty element and not walk outside forwards', () => {
      setHtml('<p>a</p><p></p><p>b</p>');
      const posOpt = positionIn(true, [ 1 ]);
      assertNone(posOpt);
    });

    it('Should walk past comment node backwards', () => {
      setHtml('<p><!-- a-->b<!-- c --></p>');
      const posOpt = positionIn(false, []);
      assertCaretPosition(posOpt, [ 0, 1 ], 1);
    });

    it('Should walk past comment node forwards', () => {
      setHtml('<p><!-- a-->b<!-- c --></p>');
      const posOpt = positionIn(true, []);
      assertCaretPosition(posOpt, [ 0, 1 ], 0);
    });
  });
});
