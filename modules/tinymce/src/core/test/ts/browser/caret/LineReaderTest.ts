import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import * as LineReader from 'tinymce/core/caret/LineReader';

import * as ViewBlock from '../../module/test/ViewBlock';

const BreakType = LineReader.BreakType;
type LineInfo = LineReader.LineInfo;

describe('browser.tinymce.core.caret.LineReader', () => {
  const viewBlock = ViewBlock.bddSetup();
  const browser = PlatformDetection.detect().browser;
  const isSafari13OrLower = browser.isSafari() && (browser.version.major < 13 || browser.version.major === 13 && browser.version.minor < 1);

  interface Path {
    path: number[];
    offset: number;
  }

  const setHtml = viewBlock.update;

  const logPositions = (msg: string, positions: CaretPosition[]) => {
    Arr.each(positions, (pos) => {
      // eslint-disable-next-line no-console
      console.log(msg, pos.container(), pos.offset(), pos.getClientRects());
    });
  };

  const getPositionsUntilPreviousLine = (path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return LineReader.getPositionsUntilPreviousLine(viewBlock.get(), pos);
  };

  const getPositionsUntilNextLine = (path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return LineReader.getPositionsUntilNextLine(viewBlock.get(), pos);
  };

  const getAbovePositions = (path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return LineReader.getPositionsAbove(viewBlock.get(), pos);
  };

  const getBelowPositions = (path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return LineReader.getPositionsBelow(viewBlock.get(), pos);
  };

  const findClosestHorizontalPosition = (positions: CaretPosition[], path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return LineReader.findClosestHorizontalPosition(positions, pos);
  };

  const assertPositions = (actualPositions: CaretPosition[], expectedPositions: Path[]) => {
    assert.lengthOf(actualPositions, expectedPositions.length, 'Should be the expected amount of positions');
    Arr.each(expectedPositions, (p: Path, i) => {
      const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), p.path).getOrDie();
      Assertions.assertDomEq('Should be the expected container', container, SugarElement.fromDom(actualPositions[i].container()));
      assert.equal(actualPositions[i].offset(), p.offset, 'Should be the expected offset');
    });
  };

  const assertCaretPositions = (actualPositions: CaretPosition[], expectedPositions: Path[]) => {
    if (expectedPositions.length !== actualPositions.length) {
      logPositions('cAssertCaretPositions', actualPositions);
    }
    assertPositions(actualPositions, expectedPositions);
  };

  const assertNone = (a: Optional<CaretPosition>) => {
    assert.isTrue(a.isNone(), 'Optional return value should be none');
  };

  const assertLineInfoCaretPositions = (lineInfo: LineInfo, expectedPositions: Path[]) => {
    const actualPositions = lineInfo.positions;
    if (expectedPositions.length !== actualPositions.length) {
      logPositions('cAssertLineInfoCaretPositions', actualPositions);
    }
    assertPositions(actualPositions, expectedPositions);
  };

  const assertBreakPositionNone = (linebreak: LineInfo) => {
    assert.isTrue(linebreak.breakAt.isNone(), 'Should not be a line break position');
  };

  const assertBreakPosition = (linebreak: LineInfo, path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const breakPos = linebreak.breakAt.getOrDie();

    Assertions.assertDomEq('Should be the expected container', container, SugarElement.fromDom(breakPos.container()));
    assert.equal(breakPos.offset(), offset, 'Should be the expected offset');
  };

  const assertBreakType = (linebreak: LineInfo, expectedBreakType: LineReader.BreakType) => {
    const actualBreakType = linebreak.breakType;
    assert.equal(actualBreakType, expectedBreakType, 'Should be the expected break type');
  };

  const assertCaretPosition = (posOpt: Optional<CaretPosition>, path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = posOpt.getOrDie('Needs to return a caret');

    Assertions.assertDomEq('Should be the expected container', container, SugarElement.fromDom(pos.container()));
    assert.equal(pos.offset(), offset, 'Should be the expected offset');
  };

  const visualCaretCheck = (predicate: (scope: HTMLElement, pos: CaretPosition) => boolean, path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return predicate(viewBlock.get(), pos);
  };

  const isAtFirstLine = Fun.curry(visualCaretCheck, LineReader.isAtFirstLine);
  const isAtLastLine = Fun.curry(visualCaretCheck, LineReader.isAtLastLine);

  context('getPositionsUntilPreviousLine', () => {
    it('Should be an empty array of positions and no linebreak', () => {
      setHtml('<p>a</p>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 0 ], 0);
      assertLineInfoCaretPositions(lineInfo, []);
      assertBreakType(lineInfo, BreakType.Eol);
      assertBreakPositionNone(lineInfo);
    });

    it('Should be an array with the first position and second position and no linebreak', () => {
      setHtml('<p>ab</p>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 0 ], 2);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 0 ], offset: 0 },
        { path: [ 0, 0 ], offset: 1 }
      ]);
      assertBreakType(lineInfo, BreakType.Eol);
      assertBreakPositionNone(lineInfo);
    });

    it('Should be an array with one position from the second line and a break on the first line 1 <br>', () => {
      setHtml('<p>a<br>b</p>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 2 ], 1);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 2 ], offset: 0 }
      ]);
      assertBreakType(lineInfo, BreakType.Br);
      assertBreakPosition(lineInfo, [ 0 ], 1);
    });

    it('Should be an array with one position from the second line and a break on the first line 2 <br>', () => {
      setHtml('<p>a<br>bc</p>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 2 ], 1);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 2 ], offset: 0 }
      ]);
      assertBreakType(lineInfo, BreakType.Br);
      assertBreakPosition(lineInfo, [ 0 ], 1);
    });

    it('Should be an array with one position from the second line and a break on the first line <p>', () => {
      setHtml('<p>a</p><p>b</p>');
      const lineInfo = getPositionsUntilPreviousLine([ 1, 0 ], 1);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 1, 0 ], offset: 0 }
      ]);
      assertBreakType(lineInfo, BreakType.Block);
      assertBreakPosition(lineInfo, [ 0, 0 ], 1);
    });

    it('Should be an array with one position from the second line and a break on the first line (wrap)', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 0 ], 6);
      if (isSafari13OrLower) {
        assertLineInfoCaretPositions(lineInfo, [
          { path: [ 0, 0 ], offset: 4 },
          { path: [ 0, 0 ], offset: 5 }
        ]);
        assertBreakType(lineInfo, BreakType.Wrap);
        assertBreakPosition(lineInfo, [ 0, 0 ], 3);
      } else {
        assertLineInfoCaretPositions(lineInfo, [
          { path: [ 0, 0 ], offset: 5 }
        ]);
        assertBreakType(lineInfo, BreakType.Wrap);
        assertBreakPosition(lineInfo, [ 0, 0 ], 4);
      }
    });

    it('Should be an array with zero positions from the second line and a break on the first line', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const lineInfo = getPositionsUntilPreviousLine([ 0, 0 ], 5);
      if (isSafari13OrLower) {
        assertLineInfoCaretPositions(lineInfo, [
          { path: [ 0, 0 ], offset: 4 }
        ]);
        assertBreakType(lineInfo, BreakType.Wrap);
        assertBreakPosition(lineInfo, [ 0, 0 ], 3);
      } else {
        assertLineInfoCaretPositions(lineInfo, []);
        assertBreakType(lineInfo, BreakType.Wrap);
        assertBreakPosition(lineInfo, [ 0, 0 ], 4);
      }
    });
  });

  context('getPositionsUntilNextLine', () => {
    it('Should be an empty array of positions and no linebreak', () => {
      setHtml('<p>a</p>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 1);
      assertLineInfoCaretPositions(lineInfo, []);
      assertBreakType(lineInfo, BreakType.Eol);
      assertBreakPositionNone(lineInfo);
    });

    it('Should be an array with the first position and second position and no linebreak', () => {
      setHtml('<p>ab</p>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 0);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 0 ], offset: 1 },
        { path: [ 0, 0 ], offset: 2 }
      ]);
      assertBreakType(lineInfo, BreakType.Eol);
      assertBreakPositionNone(lineInfo);
    });

    it('Should be an array with one position from the first line and a break on the first line <br>', () => {
      setHtml('<p>a<br>b</p>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 0);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 0 ], offset: 1 },
        { path: [ 0 ], offset: 1 }
      ]);
      assertBreakType(lineInfo, BreakType.Br);
      assertBreakPosition(lineInfo, [ 0 ], 1);
    });

    it('Should be an array with one position from the first line with input and a break on the first line <br>', () => {
      setHtml('<p><input><br>b</p>');
      const lineInfo = getPositionsUntilNextLine([ 0 ], 0);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0 ], offset: 1 }
      ]);
      assertBreakType(lineInfo, BreakType.Br);
      assertBreakPosition(lineInfo, [ 0 ], 1);
    });

    it('Should be an array with one position from the first line and a break on the first line <p>', () => {
      setHtml('<p>a</p><p>b</p>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 0);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 0 ], offset: 1 }
      ]);
      assertBreakType(lineInfo, BreakType.Block);
      assertBreakPosition(lineInfo, [ 1, 0 ], 0);
    });

    it('Should be an array with one position from the second line and a break on the last line', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 6);
      assertLineInfoCaretPositions(lineInfo, [
        { path: [ 0, 0 ], offset: 7 }
      ]);
      assertBreakType(lineInfo, BreakType.Wrap);
      assertBreakPosition(lineInfo, [ 0, 0 ], 8);
    });

    it('Should be an array with zero positions from the second line and a break on the last line', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const lineInfo = getPositionsUntilNextLine([ 0, 0 ], 7);
      assertLineInfoCaretPositions(lineInfo, []);
      assertBreakType(lineInfo, BreakType.Wrap);
      assertBreakPosition(lineInfo, [ 0, 0 ], 8);
    });
  });

  context('isAtFirstLine', () => {
    it('Should return true at first visual position in paragraph', () => {
      setHtml('<p>a</p>');
      const firstLine = isAtFirstLine([ 0, 0 ], 0);
      assert.isTrue(firstLine, 'Should be true on first position in paragraph');
    });

    it('Should return true at second visual position in paragraph', () => {
      setHtml('<p>a</p>');
      const firstLine = isAtFirstLine([ 0, 0 ], 1);
      assert.isTrue(firstLine, 'Should be true on second position in paragraph');
    });

    it('Should return false at second br line in paragraph', () => {
      setHtml('<p>a<br>b</p>');
      const firstLine = isAtFirstLine([ 0, 2 ], 0);
      assert.isFalse(firstLine, 'Should be false on second line in paragraph');
    });

    it('Should return false at second pos after br line in paragraph', () => {
      setHtml('<p>a<br>b</p>');
      const firstLine = isAtFirstLine([ 0, 2 ], 1);
      assert.isFalse(firstLine, 'Should be false on second line in paragraph');
    });

    it('Should return false at second paragraph', () => {
      setHtml('<p>a</p><p>b</p>');
      const firstLine = isAtFirstLine([ 1, 0 ], 0);
      assert.isFalse(firstLine, 'Should be false on second line in paragraph');
    });

    it('Should return false at second line in a wrapped element', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const firstLine = isAtFirstLine([ 0, 0 ], 4);
      assert.isFalse(firstLine, 'Should be false on second line in paragraph');
    });

    it('Should return true at paragraph in td', () => {
      setHtml('<table><tbody><tr><td><p>a</p></td></tr></tbody></table>');
      const firstLine = isAtFirstLine([ 0, 0, 0, 0, 0, 0 ], 0);
      assert.isTrue(firstLine, 'Should be true since it is the first line in td');
    });

    it('Should return false at second paragraph in td', () => {
      setHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>');
      const firstLine = isAtFirstLine([ 0, 0, 0, 0, 1, 0 ], 0);
      assert.isFalse(firstLine, 'Should be false since it is the second line in td');
    });
  });

  context('isAtLastLine', () => {
    it('Should return true at first visual position in paragraph', () => {
      setHtml('<p>a</p>');
      const lastLine = isAtLastLine([ 0, 0 ], 0);
      assert.isTrue(lastLine, 'Should be true on first position in paragraph');
    });

    it('Should return true at second visual position in paragraph', () => {
      setHtml('<p>a</p>');
      const lastLine = isAtLastLine([ 0, 0 ], 1);
      assert.isTrue(lastLine, 'Should be true on second position in paragraph');
    });

    it('Should return false at before first br line in paragraph', () => {
      setHtml('<p>a<br>b</p>');
      const lastLine = isAtLastLine([ 0, 0 ], 0);
      assert.isFalse(lastLine, 'Should be false on first line in paragraph');
    });

    it('Should return false at first line at second pos before br line in paragraph', () => {
      setHtml('<p>a<br>b</p>');
      const lastLine = isAtLastLine([ 0, 0 ], 1);
      assert.isFalse(lastLine, 'Should be false on first line in paragraph');
    });

    it('Should return false at first paragraph', () => {
      setHtml('<p>a</p><p>b</p>');
      const lastLine = isAtLastLine([ 0, 0 ], 0);
      assert.isFalse(lastLine, 'Should be false on first paragraph line');
    });

    it('Should return false at second line in a wrapped element', () => {
      setHtml('<div style="width: 10px">abc def ghi</div>');
      const lastLine = isAtLastLine([ 0, 0 ], 6);
      assert.isFalse(lastLine, 'Should be false on second line in paragraph');
    });

    it('Should return false at first paragraph in td', () => {
      setHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>');
      const lastLine = isAtLastLine([ 0, 0, 0, 0, 0, 0 ], 0);
      assert.isFalse(lastLine, 'Should be false since it is the first line in td');
    });

    it('Should return true at second paragraph in td', () => {
      setHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>');
      const lastLine = isAtLastLine([ 0, 0, 0, 0, 1, 0 ], 0);
      assert.isTrue(lastLine, 'Should be true since it is the second line in td');
    });
  });

  context('getAbovePositions', () => {
    it('Should return zero positions since there is no line above', () => {
      setHtml('<p>a</p>');
      const positions = getAbovePositions([ 0, 0 ], 1);
      assertCaretPositions(positions, []);
    });

    it('Should return three positions for the line above', () => {
      setHtml('<p>ab</p><p>a</p>');
      const positions = getAbovePositions([ 1, 0 ], 0);
      assertCaretPositions(positions, [
        { path: [ 0, 0 ], offset: 0 },
        { path: [ 0, 0 ], offset: 1 },
        { path: [ 0, 0 ], offset: 2 }
      ]);
    });

    it('Should return four positions for the line above2', () => {
      setHtml('<p>a<input>b</p><p>a</p>');
      const positions = getAbovePositions([ 1, 0 ], 0);
      assertCaretPositions(positions, [
        { path: [ 0, 0 ], offset: 0 },
        { path: [ 0, 0 ], offset: 1 },
        { path: [ 0 ], offset: 1 },
        { path: [ 0 ], offset: 2 },
        { path: [ 0, 2 ], offset: 0 },
        { path: [ 0, 2 ], offset: 1 }
      ]);
    });
  });

  context('getBelowPositions', () => {
    it('Should return zero positions since there is no line below', () => {
      setHtml('<p>a</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      assertCaretPositions(positions, []);
    });

    it('Should return three positions for the line below', () => {
      setHtml('<p>a</p><p>ab</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      assertCaretPositions(positions, [
        { path: [ 1, 0 ], offset: 0 },
        { path: [ 1, 0 ], offset: 1 },
        { path: [ 1, 0 ], offset: 2 }
      ]);
    });

    it('Should return five positions for the line below', () => {
      setHtml('<p>a</p><p>a<input>b</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      assertCaretPositions(positions, [
        { path: [ 1, 0 ], offset: 0 },
        { path: [ 1, 0 ], offset: 1 },
        { path: [ 1 ], offset: 1 },
        { path: [ 1 ], offset: 2 },
        { path: [ 1, 2 ], offset: 0 },
        { path: [ 1, 2 ], offset: 1 }
      ]);
    });
  });

  context('findClosestHoriontalPosition (above)', () => {
    it('Should not return a position since there is no above positions', () => {
      setHtml('<p>ab</p>');
      const positions = getAbovePositions([ 0, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 0 ], 0);
      assertNone(closestPosOpt);
    });

    it('Should return first caret position on the line above', () => {
      setHtml('<p>ab</p><p>cd</p>');
      const positions = getAbovePositions([ 1, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 1, 0 ], 0);
      assertCaretPosition(closestPosOpt, [ 0, 0 ], 0);
    });

    it('Should return last caret position on the line above', () => {
      setHtml('<p>ab</p><p>cd</p>');
      const positions = getAbovePositions([ 1, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 1, 0 ], 2);
      assertCaretPosition(closestPosOpt, [ 0, 0 ], 2);
    });

    it('Should return first indexed caret position on the line above', () => {
      setHtml('<p><input></p><p><input></p>');
      const positions = getAbovePositions([ 1 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 1 ], 0);
      assertCaretPosition(closestPosOpt, [ 0 ], 0);
    });

    it('Should return last indexed caret position on the line above', () => {
      setHtml('<p><input></p><p><input></p>');
      const positions = getAbovePositions([ 1 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 1 ], 1);
      assertCaretPosition(closestPosOpt, [ 0 ], 1);
    });

    it('Should return last text node position at the line above', () => {
      setHtml('<p>a<input>b</p><p>a<input>b</p>');
      const positions = getAbovePositions([ 1, 2 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 1, 2 ], 0);
      assertCaretPosition(closestPosOpt, [ 0, 2 ], 0);
    });
  });

  context('findClosestHorizontalPosition (below)', () => {
    it('Should not return a position since there is no below positions', () => {
      setHtml('<p>ab</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 0 ], 0);
      assertNone(closestPosOpt);
    });

    it('Should return first caret position on the line below', () => {
      setHtml('<p>ab</p><p>cd</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 0 ], 0);
      assertCaretPosition(closestPosOpt, [ 1, 0 ], 0);
    });

    it('Should return last caret position on the line below', () => {
      setHtml('<p>ab</p><p>cd</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 0 ], 2);
      assertCaretPosition(closestPosOpt, [ 1, 0 ], 2);
    });

    it('Should return first indexed caret position on the line below', () => {
      setHtml('<p><input></p><p><input></p>');
      const positions = getBelowPositions([ 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0 ], 0);
      assertCaretPosition(closestPosOpt, [ 1 ], 0);
    });

    it('Should return last indexed caret position on the line below', () => {
      setHtml('<p><input></p><p><input></p>');
      const positions = getBelowPositions([ 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0 ], 1);
      assertCaretPosition(closestPosOpt, [ 1 ], 1);
    });

    it('Should return first text node position at the line below', () => {
      setHtml('<p>a<input>b</p><p>a<input>b</p>');
      const positions = getBelowPositions([ 0, 0 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 0 ], 0);
      assertCaretPosition(closestPosOpt, [ 1, 0 ], 0);
    });

    it('Should return last text node position at the line below', () => {
      setHtml('<p>a<input>b</p><p>a<input>b</p>');
      const positions = getBelowPositions([ 0, 2 ], 0);
      const closestPosOpt = findClosestHorizontalPosition(positions, [ 0, 2 ], 0);
      assertCaretPosition(closestPosOpt, [ 1, 2 ], 0);
    });
  });
});
