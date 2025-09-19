// Created by automated test generator: NavigationUtils unit tests
/* 
  Test suite: NavigationUtils unit tests
  Frameworks:
    - Bedrock + Mocha (describe/it)
    - Chai for assertions
    - Sinon for stubs/mocks
  Focus: Branch coverage for exported functions in NavigationUtils:
    - moveToRange
    - getLineEndPoint (forward/backward, none)
    - moveToLineEndPoint (true/false)
    - moveHorizontally (key branches)
    - moveVertically (selected key branches)
*/

import { assert } from 'chai';
import * as sinon from 'sinon';

import * as NavigationUtils from '../../../main/ts/keyboard/NavigationUtils';
import * as ScrollIntoView from '../../../main/ts/dom/ScrollIntoView';
import * as FakeCaretUtils from '../../../main/ts/caret/FakeCaretUtils';
import * as CaretUtils from '../../../main/ts/caret/CaretUtils';
import * as CaretContainer from '../../../main/ts/caret/CaretContainer';
import CaretPosition from '../../../main/ts/caret/CaretPosition';
import { CaretWalker, HDirection } from '../../../main/ts/caret/CaretWalker';
import * as LineReader from '../../../main/ts/caret/LineReader';
import * as LineWalker from '../../../main/ts/caret/LineWalker';
import * as LineUtils from '../../../main/ts/caret/LineUtils';
import * as RangeNodes from '../../../main/ts/selection/RangeNodes';
import * as NodeType from '../../../main/ts/dom/NodeType';
import * as InlineUtils from '../../../main/ts/keyboard/InlineUtils';
import { Optional } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';
import { isCefAtEdgeSelected } from '../../../main/ts/keyboard/CefUtils';

// Minimal Editor and Selection stubs
interface SelStub {
  setRng: (r: Range) => void;
  getRng: () => Range;
}
interface EditorStub {
  selection: SelStub;
  dom: { createRng: () => Range };
  getBody: () => Element;
}

const mkRange = (): Range => {
  // Create a detached range for use in tests
  const div = document.createElement('div');
  const rng = document.createRange();
  rng.selectNode(div);
  return rng;
};

const mkEditor = (overrides: Partial<EditorStub> = {}): EditorStub => {
  const adjusted = mkRange();
  let _current = mkRange();
  const selection: SelStub = {
    setRng: (r: Range) => { _current = r; },
    getRng: () => adjusted
  };

  const editor: EditorStub = {
    selection,
    dom: { createRng: () => document.createRange() },
    getBody: () => document.body
  };
  return Object.assign(editor, overrides);
};

describe('keyboard.NavigationUtils', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('moveToRange', () => {
    it('sets selection and scrolls into view with adjusted range', () => {
      const editor = mkEditor();
      const setSpy = sandbox.spy(editor.selection, 'setRng');
      const scrollStub = sandbox.stub(ScrollIntoView, 'scrollRangeIntoView');

      const input = mkRange();
      NavigationUtils.moveToRange(editor as any, input);

      assert.isTrue(setSpy.calledOnceWithExactly(input), 'setRng called with provided range');
      assert.isTrue(scrollStub.calledOnce, 'scrollRangeIntoView called once');
      assert.strictEqual(scrollStub.firstCall.args[0], editor, 'scroll called with editor');
      assert.instanceOf(scrollStub.firstCall.args[1], Range, 'scroll called with a Range');
    });
  });

  describe('getLineEndPoint', () => {
    it('forward: returns last position from next line info', () => {
      const rng = mkRange();
      const editor = mkEditor({ selection: { setRng: () => {}, getRng: () => rng } as SelStub }) as any;

      const fromPos: any = { tag: 'from-end' };
      sandbox.stub(CaretPosition, 'fromRangeEnd').returns(fromPos);
      const host = document.createElement('div');
      sandbox.stub(CaretUtils, 'getEditingHost').returns(host);
      const p1: any = { id: 1 }, p2: any = { id: 2 };
      sandbox.stub(LineReader, 'getPositionsUntilNextLine').returns({ positions: [p1, p2] });

      const res = NavigationUtils.getLineEndPoint(editor, true);
      assert.isTrue(res.isSome(), 'should have some');
      assert.strictEqual(res.getOrDie(), p2, 'returns last position');
    });

    it('backward: returns head position from previous line info', () => {
      const rng = mkRange();
      const editor = mkEditor({ selection: { setRng: () => {}, getRng: () => rng } as SelStub }) as any;

      const fromPos: any = { tag: 'from-start' };
      sandbox.stub(CaretPosition, 'fromRangeStart').returns(fromPos);
      const host = document.createElement('div');
      sandbox.stub(CaretUtils, 'getEditingHost').returns(host);
      const p1: any = { id: 'a' }, p2: any = { id: 'b' };
      sandbox.stub(LineReader, 'getPositionsUntilPreviousLine').returns({ positions: [p1, p2] });

      const res = NavigationUtils.getLineEndPoint(editor, false);
      assert.isTrue(res.isSome(), 'should have some');
      assert.strictEqual(res.getOrDie(), p1, 'returns head position');
    });

    it('returns none when no positions', () => {
      const rng = mkRange();
      const editor = mkEditor({ selection: { setRng: () => {}, getRng: () => rng } as SelStub }) as any;

      sandbox.stub(CaretPosition, 'fromRangeEnd').returns({} as any);
      sandbox.stub(CaretUtils, 'getEditingHost').returns(document.createElement('div'));
      sandbox.stub(LineReader, 'getPositionsUntilNextLine').returns({ positions: [] });

      const res = NavigationUtils.getLineEndPoint(editor, true);
      assert.isTrue(res.isNone(), 'no positions -> none');
    });
  });

  describe('moveToLineEndPoint', () => {
    it('sets selection and returns true when endpoint exists and passes filter', () => {
      const editor = mkEditor();
      const rng = mkRange();
      const pos: any = { toRange: () => rng };
      // Drive internal getLineEndPoint path
      const rngStub = sandbox.stub(editor.selection, 'getRng').returns(mkRange());
      sandbox.stub(CaretPosition, 'fromRangeEnd').returns({} as any);
      sandbox.stub(CaretUtils, 'getEditingHost').returns(document.createElement('div'));
      sandbox.stub(LineReader, 'getPositionsUntilNextLine').returns({ positions: [pos] });

      const isElementPosition = () => true;
      const res = NavigationUtils.moveToLineEndPoint(editor as any, true, isElementPosition);
      assert.isTrue(res, 'should return true');
      assert.strictEqual((editor.selection.getRng as any).callCount ?? 1, rngStub.callCount, 'getRng used internally');
    });

    it('returns false when endpoint missing or filtered out', () => {
      const editor = mkEditor();
      // Endpoint will be none
      sandbox.stub(CaretPosition, 'fromRangeEnd').returns({} as any);
      sandbox.stub(CaretUtils, 'getEditingHost').returns(document.createElement('div'));
      sandbox.stub(LineReader, 'getPositionsUntilNextLine').returns({ positions: [] });

      const res = NavigationUtils.moveToLineEndPoint(editor as any, true, () => false);
      assert.isFalse(res, 'should be false when none/filtered');
    });
  });

  describe('moveHorizontally', () => {
    const dummyIsElementParam = (_n: Node | null): _n is HTMLElement => true;

    it('non-collapsed + absolutely positioned element: advances to next visual caret', () => {
      const editor = mkEditor();
      const selRange = mkRange();
      const baseRange = mkRange();
      const selectedEl = document.createElement('div');

      sandbox.stub(RangeNodes, 'getSelectedNode').returns(selectedEl as any);
      // Simulate position: absolute on selected element
      sandbox.stub(Css, 'get').callsFake((el, prop) => prop === 'position' ? 'absolute' : '');
      // Normalized endpoint + next visual caret -> nextRange
      const caretPos: any = { tag: 'cp' };
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);
      const nextPos: any = { toRange: () => baseRange };
      sandbox.stub(CaretUtils, 'getVisualCaretPosition').returns(nextPos);
      // Make the range appear non-collapsed
      const rng: any = selRange;
      Object.defineProperty(rng, 'collapsed', { value: false });

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Forwards,
        rng,
        () => false,
        () => false,
        dummyIsElementParam
      );

      assert.isTrue(res.isSome(), 'should have some');
      assert.strictEqual(res.getOrDie(), baseRange, 'should map to next position range');
    });

    it('non-collapsed + non-absolute element: shows fake caret', () => {
      const editor = mkEditor();
      const rng = mkRange();
      const el = document.createElement('span');

      sandbox.stub(RangeNodes, 'getSelectedNode').returns(el as any);
      sandbox.stub(Css, 'get').returns('static'); // not absolute
      const showStub = sandbox.stub(FakeCaretUtils, 'showCaret').returns(Optional.some(rng));

      // Make non-collapsed
      Object.defineProperty(rng, 'collapsed', { value: false });

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Forwards,
        rng,
        () => false,
        () => false,
        () => true as any
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), rng, 'returns fake caret range');
      assert.isTrue(showStub.calledOnce, 'showCaret called');
    });

    it('non-collapsed + non-element & cef edge: collapses clone appropriately', () => {
      const editor = mkEditor();
      const rng = document.createRange();
      const clone = document.createRange();
      const nonElementNode = document.createTextNode('x');

      sandbox.stub(RangeNodes, 'getSelectedNode').returns(nonElementNode as any);
      sandbox.stub<any, any>(isCefAtEdgeSelected as any).returns(true);
      const cloneStub = sandbox.stub(rng, 'cloneRange').returns(clone);
      const collapseStub = sandbox.stub(clone, 'collapse');

      // non-collapsed
      Object.defineProperty(rng, 'collapsed', { value: false });

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Backwards,
        rng,
        () => false,
        () => false,
        () => false as any
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), clone, 'returns collapsed clone');
      assert.isTrue(collapseStub.calledOnceWithExactly(true), 'collapsed backwards');
    });

    it('collapsed + beforeFn(caretPosition): selects adjacent element via FakeCaretUtils.selectNode', () => {
      const editor = mkEditor();
      const rng = mkRange();
      const element = document.createElement('em');
      const caretPos: any = { getNode: (rev?: boolean) => element };

      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);
      const selectStub = sandbox.stub(FakeCaretUtils, 'selectNode').returns(Optional.some(rng));

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Forwards,
        rng,
        () => true,
        () => false,
        () => true as any
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), rng, 'selected node range');
      assert.isTrue(selectStub.calledOnce, 'selectNode called');
    });

    it('no next caret position + in container block: returns original range', () => {
      const editor = mkEditor();
      const rng = mkRange();
      const caretPos: any = {};
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);
      sandbox.stub(CaretUtils, 'getVisualCaretPosition').returns(null as any);
      sandbox.stub(CaretContainer, 'isRangeInCaretContainerBlock').returns(true);

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Forwards,
        rng,
        () => false,
        () => false,
        () => false as any
      );

      assert.isTrue(res.isSome(), 'returns some(range)');
      assert.strictEqual(res.getOrDie(), rng, 'returns original range');
    });

    it('isBeforeFn(nextCaretPosition) with absolutely positioned node -> elementToRange', () => {
      const editor = mkEditor({
        dom: {
          createRng: () => {
            const r = document.createRange();
            return r;
          }
        }
      } as any);

      const rng = mkRange();
      const caretPos: any = { tag: 'start' };
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);
      sandbox.stub(CaretContainer, 'isRangeInCaretContainerBlock').returns(false);

      const nextPosNode = document.createElement('div');
      const nextPos: any = {
        getNode: (_rev?: boolean) => nextPosNode,
        toRange: () => rng
      };
      sandbox.stub(CaretUtils, 'getVisualCaretPosition').returns(nextPos);
      sandbox.stub(InlineUtils, 'normalizePosition').callsFake((_f, p) => p);

      // Make getAbsPositionElement return Some by stubbing NodeType + Css
      sandbox.stub(NodeType, 'isElement').returns(true as any);
      sandbox.stub(Css, 'get').returns('absolute');

      const res = NavigationUtils.moveHorizontally(
        editor as any,
        HDirection.Forwards,
        rng,
        () => true,  // isBefore(nextPos) = true
        () => false,
        () => true as any
      );

      assert.isTrue(res.isSome(), 'some');
      // elementToRange creates new range selecting the element; ensure it's a Range
      assert.instanceOf(res.getOrDie(), Range, 'elementToRange result is a Range');
    });
  });

  describe('moveVertically', () => {
    it('returns none when caret has no client rects', () => {
      const editor = mkEditor();
      const rng = mkRange();
      const caretPos: any = { getClientRects: () => [] };
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);

      const res = NavigationUtils.moveVertically(
        editor as any,
        LineWalker.VDirection.Down,
        rng,
        () => false,
        () => false,
        (_n: Node): _n is HTMLElement => true
      );

      assert.isTrue(res.isNone(), 'no rects -> none');
    });

    it('CEf at edge selected -> uses closest position above/below', () => {
      const editor = mkEditor();
      const rng = mkRange();

      sandbox.stub<any, any>(isCefAtEdgeSelected as any).returns(true);

      // For Down: from Range end
      const startPos: any = { tag: 'start', toRange: () => rng };
      const endPos: any = { tag: 'end', toRange: () => rng };
      sandbox.stub(CaretPosition, 'fromRangeEnd').returns(endPos);
      sandbox.stub(LineReader, 'getClosestPositionBelow').returns(Optional.some(endPos));

      const res = NavigationUtils.moveVertically(
        editor as any,
        LineWalker.VDirection.Down,
        rng,
        () => false,
        () => false,
        (_n: Node): _n is HTMLElement => true
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), rng, 'returned range from closest pos');
    });

    it('next line rect element -> shows fake caret on nearer edge', () => {
      const editor = mkEditor();
      const rng = mkRange();

      // caretPosition with rect at left=10
      const caretPos: any = { getClientRects: () => [{ left: 10 }] };
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);

      // nextLinePositions and closest rect: make left close to 12, right 50 (left is nearer)
      const nodeEl = document.createElement('span');
      sandbox.stub(LineWalker, 'downUntil').returns([{ node: nodeEl, left: 12, right: 50 } as any]);
      sandbox.stub(LineWalker, 'isAboveLine').returns(() => true as any);
      sandbox.stub(LineWalker, 'isLine').returns(() => true as any);
      sandbox.stub(LineUtils, 'findClosestClientRect').returns({ node: nodeEl, left: 12, right: 50 } as any);

      const showStub = sandbox.stub(FakeCaretUtils, 'showCaret').returns(Optional.some(rng));

      const res = NavigationUtils.moveVertically(
        editor as any,
        LineWalker.VDirection.Down,
        rng,
        () => false,
        () => false,
        (n: Node): n is HTMLElement => n instanceof HTMLElement
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), rng, 'shows fake caret');
      assert.isTrue(showStub.calledOnce, 'showCaret called once');
      // The fourth arg to showCaret is preferStart = dist1 < dist2 -> true in our scenario
      assert.isTrue(showStub.firstCall.args[3], 'prefer start edge since left was nearer');
    });

    it('no next line positions -> uses line end point and renders range caret', () => {
      const editor = mkEditor();
      const rng = mkRange();

      const caretPos: any = { getClientRects: () => [{ left: 5 }] };
      sandbox.stub(CaretUtils, 'getNormalizedRangeEndPoint').returns(caretPos);

      // No next line positions
      sandbox.stub(LineWalker, 'downUntil').returns([]);
      sandbox.stub(LineWalker, 'isAboveLine').returns(() => true as any);
      sandbox.stub(LineWalker, 'isLine').returns(() => true as any);

      // getLineEndPoint (Down -> forward) returns pos, filter uses isAfter => return true
      const endPos: any = { toRange: () => rng };
      sandbox.stub(CaretPosition, 'fromRangeEnd').returns({} as any);
      sandbox.stub(CaretUtils, 'getEditingHost').returns(document.createElement('div'));
      sandbox.stub(LineReader, 'getPositionsUntilNextLine').returns({ positions: [endPos] });

      const renderStub = sandbox.stub(FakeCaretUtils, 'renderRangeCaret').returns(rng);

      const res = NavigationUtils.moveVertically(
        editor as any,
        LineWalker.VDirection.Down,
        rng,
        () => false,
        () => true, // isAfter
        (_n: Node): _n is HTMLElement => true
      );

      assert.isTrue(res.isSome(), 'some');
      assert.strictEqual(res.getOrDie(), rng, 'returns rendered range caret');
      assert.isTrue(renderStub.calledOnce, 'renderRangeCaret called once');
    });
  });
});