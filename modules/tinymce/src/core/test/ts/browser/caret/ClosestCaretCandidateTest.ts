import { Cursors } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { ContentEditable, Css, Html, Insert, Remove, SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';
import { assert } from 'chai';

import { FakeCaretPosition, closestCaretCandidateNodeRect, closestFakeCaretCandidate } from 'tinymce/core/caret/ClosestCaretCandidate';

interface TestCaretInfo {
  readonly path: number[];
  readonly position: FakeCaretPosition;
}

interface TestArgs<T> {
  readonly html: string;
  readonly targetPath: number[];
  readonly dx: number;
  readonly dy: number;
  readonly expected: Optional<T>;
}

describe('browser.tinymce.core.ClosestCaretCandidateTest', () => {
  const drawHelperPoint = (container: SugarElement<Element>, x: number, y: number, color: string) => {
    const cpos = SugarLocation.absolute(container);
    const elm = SugarElement.fromTag('div');

    Css.setAll(elm, {
      'position': 'absolute',
      'left': `${x - cpos.left}px`,
      'top': `${y - cpos.top}px`,
      'width': '1px',
      'height': '1px',
      'outline': '1px solid red',
      'background-color': color,
    });

    Insert.append(container, elm);

    // Uncomment the following line to see the X, Y spot for each test
    // debugger
  };

  const createContainer = (html: string) => {
    const container = SugarElement.fromTag('div');
    ContentEditable.set(container, true);
    Html.set(container, html);
    Css.setAll(container, {
      outline: '1px solid black',
      position: 'relative',
      padding: '10px',
      margin: '10px'
    });
    Insert.append(SugarBody.body(), container);
    return container;
  };

  context('closestCaretCandidateNodeRect', () => {
    const testClosestCaretCandidate = (args: TestArgs<number[]>) => {
      const container = createContainer(args.html);
      const target = Cursors.calculateOne(container, args.targetPath) as SugarElement<Element>;
      const pos = SugarLocation.absolute(target);
      const actualDomRect = closestCaretCandidateNodeRect(container.dom, pos.left + args.dx, pos.top + args.dy);

      drawHelperPoint(container, pos.left + args.dx, pos.top + args.dy, 'red');

      actualDomRect.fold(
        () => args.expected.each((_) => assert.fail('Expected caret info got none')),
        (nodeRect) => {
          args.expected.fold(
            () => assert.fail('Expected none caret info got some'),
            (expectedPath) => {
              const expectedTarget = Cursors.calculateOne(container, expectedPath) as SugarElement<Element>;

              assert.equal(nodeRect.node, expectedTarget.dom, 'should be expected node');
            }
          );
        }
      );

      Remove.remove(container);
    };

    context('inline caret candidates', () => {
      it('TINY-8169: should find the closest text node in the last child node when point is after all of the children', () =>
        testClosestCaretCandidate({
          html: 'a<span>b</span>',
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 1, 0 ])
        })
      );

      it('TINY-8169: should find the last img element if the point is after all of the children', () =>
        testClosestCaretCandidate({
          html: 'a<img src="about:blank" style="width: 10px; height: 10px">',
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8169: should find the closest br element if the point is after all of the children', () =>
        testClosestCaretCandidate({
          html: '<span style="display: inline-block; margin: 10px">a</span><br>',
          targetPath: [ 1 ],
          dx: 50, dy: 10,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8169: should find the closest noneditable element if the point is after the children', () =>
        testClosestCaretCandidate({
          html: 'a<span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8169: should find the closest text node when there is a empty visual element in between point and text node', () =>
        testClosestCaretCandidate({
          html: 'a<span style="display: inline-block; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 0 ])
        })
      );

      it('TINY-8169: should find the closest text node when there is multiple visual element with no valid caret candidates between point and text node', () =>
        testClosestCaretCandidate({
          html: [
            'a<span style="display: inline-block; width: 10px; height: 10px; background: green"><b></b></span>',
            '<span style="display: inline-block; width: 10px; height: 10px; background: cyan"><b></b></span>'
          ].join(''),
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 0 ])
        })
      );

      it('TINY-8169: should not find any caret candidate since there is none', () =>
        testClosestCaretCandidate({
          html: '<span style="display: inline-block; width: 10px; height: 10px; background: green"><b></b></span>',
          targetPath: [ 0 ],
          dx: 50, dy: 5,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find the closest nested text node when there is multiple visual element with no valid caret candidates between point and text node', () =>
        testClosestCaretCandidate({
          html: [
            '<span><b>a</b></span><span style="display: inline-block; width: 10px; height: 10px; background: green"><b></b></span>',
            '<span style="display: inline-block; width: 10px; height: 10px; background: cyan"><b></b></span>'
          ].join(''),
          targetPath: [ 1 ],
          dx: 50, dy: 5,
          expected: Optional.some([ 0, 0, 0 ])
        })
      );

      it('TINY-8169: should find the closest vertical noneditable even if point is above text', () =>
        testClosestCaretCandidate({
          html: 'hello<span contenteditable="false" style="display: inline-block; margin-top: 40px; border-top: 10px solid black; background: green">x</span>',
          targetPath: [ 1 ],
          dx: -15, dy: -25,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8169: should find the table as the closest caret candidate when the point is before the table', () =>
        testClosestCaretCandidate({
          html: '<table style="background: green"><tbody><tr><td>a</td></tr></tbody></table>',
          targetPath: [ 0 ],
          dx: -5, dy: 5,
          expected: Optional.some([ 0 ])
        })
      );

      it('TINY-8567: should find the text node as the closest caret candidate since the point is within the text node', () =>
        testClosestCaretCandidate({
          html: '<span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span>hello',
          targetPath: [ 0 ],
          dx: 15, dy: 5,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8567: should find the left text node as the closest candidate since the point is at the edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: 'hello<span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: 0, dy: 5,
          expected: Optional.some([ 0 ])
        })
      );

      it('TINY-8567: should find the right text node as the closest candidate since the point is at the edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span>hello',
          targetPath: [ 0 ],
          dx: 10, dy: 5,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8567: should find the left wrapped text node as the closest candidate since the point is at the edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span>hello</span><span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: 0, dy: 5,
          expected: Optional.some([ 0, 0 ])
        })
      );

      it('TINY-8567: should find the right wrapped text node as the closest candidate since the point is at the edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span contenteditable="false" style="display: inline-block; width: 10px; height: 10px; background: green"></span><span>hello</span>',
          targetPath: [ 0 ],
          dx: 10, dy: 5,
          expected: Optional.some([ 1, 0 ])
        })
      );

      it('TINY-8567: should find the left wrapped text node as the closest candidate since the point is within the 2 pixels edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span>hello</span><span contenteditable="false" style="display: inline-block; margin-left: 2px; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: -1, dy: 5,
          expected: Optional.some([ 0, 0 ])
        })
      );

      it('TINY-8567: should find the right wrapped text node as the closest candidate since the point is within the 2 pixels edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span contenteditable="false" style="display: inline-block; margin-right: 2px; width: 10px; height: 10px; background: green"></span><span>hello</span>',
          targetPath: [ 0 ],
          dx: 11, dy: 5,
          expected: Optional.some([ 1, 0 ])
        })
      );

      it('TINY-8567: should find the right noneditable node as the closest candidate since the point is beyond the 2 pixels edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span>hello</span><span contenteditable="false" style="display: inline-block; margin-left: 5px; width: 10px; height: 10px; background: green"></span>',
          targetPath: [ 1 ],
          dx: -1, dy: 5,
          expected: Optional.some([ 1 ])
        })
      );

      it('TINY-8567: should find the left noneditable node as the closest candidate since the point is beyond the 2 pixels edge between the text node and element', () =>
        testClosestCaretCandidate({
          html: '<span contenteditable="false" style="display: inline-block; margin-right: 5px; width: 10px; height: 10px; background: green"></span><span>hello</span>',
          targetPath: [ 0 ],
          dx: 11, dy: 5,
          expected: Optional.some([ 0 ])
        })
      );

      it('TINY-10380: should not take long to find the text candidate in next to a deeply nested structure', () => {
        const el: SugarElement<HTMLElement> = SugarElement.fromHtml('<div style="height: 100px; width: 20px"></div>');
        const depth = 32;

        const innerMost = Arr.foldl(Arr.range(depth, (_) => SugarElement.fromTag('em')), (el, child) => {
          Insert.append(el, child);
          Insert.append(el, SugarElement.fromTag('b'));
          return child;
        }, el);

        Insert.append(innerMost, SugarElement.fromText('xx xx'));

        testClosestCaretCandidate({
          html: Html.getOuter(el),
          targetPath: [ 0 ],
          dx: 10, dy: 60,
          expected: Optional.some(Arr.range(depth + 2, Fun.constant(0)))
        });
      });

      it('TINY-10380: should not take long to find the img candidate in next to a deeply nested structure', () => {
        const el: SugarElement<HTMLElement> = SugarElement.fromHtml('<div style="height: 100px; width: 20px"></div>');
        const depth = 32;

        const innerMost = Arr.foldl(Arr.range(depth, (_) => SugarElement.fromTag('em')), (el, child) => {
          Insert.append(el, child);
          Insert.append(el, SugarElement.fromTag('b'));
          return child;
        }, el);

        Insert.append(innerMost, SugarElement.fromHtml('<img src="#">'));

        testClosestCaretCandidate({
          html: Html.getOuter(el),
          targetPath: [ 0 ],
          dx: 10, dy: 60,
          expected: Optional.some(Arr.range(depth + 2, Fun.constant(0)))
        });
      });
    });
  });

  context('closestFakeCaretCandidate', () => {
    const testClosestFakeCaret = (args: TestArgs<TestCaretInfo>) => {
      const container = createContainer(args.html);
      const target = Cursors.calculateOne(container, args.targetPath) as SugarElement<Element>;
      const pos = SugarLocation.absolute(target);
      const actualCaretInfo = closestFakeCaretCandidate(container.dom, pos.left + args.dx, pos.top + args.dy);

      drawHelperPoint(container, pos.left + args.dx, pos.top + args.dy, 'red');

      actualCaretInfo.fold(
        () => args.expected.each((_) => assert.fail('Expected caret info got none')),
        (caretInfo) => {
          args.expected.fold(
            () => assert.fail('Expected none caret info got some'),
            (expectedCaretInfo) => {
              const expectedTarget = Cursors.calculateOne(container, expectedCaretInfo.path) as SugarElement<Element>;

              assert.equal(caretInfo.node, expectedTarget.dom, 'should be expected node');
              assert.equal(caretInfo.position, expectedCaretInfo.position, 'should be expected before');
            }
          );
        }
      );

      Remove.remove(container);
    };

    context('inline noneditables', () => {
      it('TINY-8169: should not produce a fake caret location when point is on the margin before the noneditable but closer to the text', () =>
        testClosestFakeCaret({
          html: 'a<span contenteditable="false" style="display: inline-block; margin: 10px; background: green">b</span>c',
          targetPath: [ 1 ],
          dx: -5, dy: 5,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find a caret position before the noneditable when point is on the margin before it closer further from the text', () =>
        testClosestFakeCaret({
          html: 'a<span contenteditable="false" style="display: inline-block; margin: 10px; background: green">b</span>c',
          targetPath: [ 1 ],
          dx: -3, dy: 5,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should not find a fake caret position when the point is on the margin after the noneditable but closer to the text', () =>
        testClosestFakeCaret({
          html: 'a<span contenteditable="false" style="display: inline-block; margin: 10px; height: 40px; background: green">b</span>c',
          targetPath: [ 1 ],
          dx: 47, dy: 5,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find a caret position after the noneditable when the point is the margin after it further from the text', () =>
        testClosestFakeCaret({
          html: 'a<span contenteditable="false" style="display: inline-block; margin: 10px; width: 40px; background: green">b</span>c',
          targetPath: [ 1 ],
          dx: 43, dy: 5,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should not find a caret position if the point is above the text in a block', () =>
        testClosestFakeCaret({
          html: '<p>a<span contenteditable="false" style="display: inline-block; margin: 20px; background: green">b</span></p>',
          targetPath: [ 0 ],
          dx: 5, dy: 5,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find a caret position before the noneditable if the point is above left of the noneditable closer to the noneditable', () =>
        testClosestFakeCaret({
          html: '<span style="font-size: 50px;">a</span><span style="margin: 10px; background: green" contenteditable="false">b</span>',
          targetPath: [ 1 ],
          dx: -3, dy: -15,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the noneditable if the point is above right of the noneditable closer to the noneditable', () =>
        testClosestFakeCaret({
          html: '<span style="font-size: 50px;">a</span><span style="margin: 10px; display: inline-block; width: 30px; background: green" contenteditable="false">b</span>',
          targetPath: [ 1 ],
          dx: 33, dy: -15,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position after the left noneditable if the point is closer to that with two adjacent noneditables', () =>
        testClosestFakeCaret({
          html: [
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: green">a</span>',
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: cyan">b</span>'
          ].join(''),
          targetPath: [ 1 ],
          dx: -12, dy: 5,
          expected: Optional.some({ path: [ 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the right noneditable if the point closer to that to that with two adjacent noneditables', () =>
        testClosestFakeCaret({
          html: [
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: green">a</span>',
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: cyan">b</span>'
          ].join(''),
          targetPath: [ 1 ],
          dx: -7, dy: 5,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.Before })
        })
      );
    });

    context('overlaping', () => {
      it('TINY-8169: should find a caret postion before the second noneditable even if the first is closer the overlap in Y is only 33%', () =>
        testClosestFakeCaret({
          html: [
            '<div style="display: flex; flex-direction: row; align-items: flex-start">',
            '<div contenteditable="false" style="margin: 30px 20px 0 0; width: 30px; min-height: 50px; background: green">a</div>',
            '<div contenteditable="false" style="margin: 10px; width: 30px; min-height: 30px; background: cyan">b</div>',
            '</div>'
          ].join(''),
          targetPath: [ 0, 0 ],
          dx: 35, dy: -7,
          expected: Optional.some({ path: [ 0, 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret postion after the first noneditable even since the overlap in Y is 66%', () =>
        testClosestFakeCaret({
          html: [
            '<div style="display: flex; flex-direction: row; align-items: flex-start">',
            '<div contenteditable="false" style="margin: 20px 20px 0 0; width: 30px; min-height: 50px; background: green">a</div>',
            '<div contenteditable="false" style="margin: 10px; width: 30px; min-height: 30px; background: cyan">b</div>',
            '</div>'
          ].join(''),
          targetPath: [ 0, 0 ],
          dx: 35, dy: -7,
          expected: Optional.some({ path: [ 0, 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8881: ghost caret should not be considered', () => {
        const ghostCaret = '<div class="mce-drag-container" contenteditable="false">|</div>';
        testClosestFakeCaret({
          html: [
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: green">a</span>',
            ghostCaret,
            '<span contenteditable="false" style="display: inline-block; margin: 10px; background: cyan">b</span>'
          ].join(''),
          targetPath: [ 1 ],
          dx: -7, dy: 5,
          expected: Optional.some({ path: [ 2 ], position: FakeCaretPosition.Before })
        });
      });
    });

    context('block noneditables', () => {
      it('TINY-8169: should find a caret position before block if the point is top, left of it', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="background: green">a</div>',
          targetPath: [ 0 ],
          dx: -3, dy: -3,
          expected: Optional.some({ path: [ 0 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after block if the point is top, right of it', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="width: 40px; background: green">a</div>',
          targetPath: [ 0 ],
          dx: 45, dy: -3,
          expected: Optional.some({ path: [ 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before block if the point is bottom, left of it', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="height: 40px; background: green">a</div>',
          targetPath: [ 0 ],
          dx: -3, dy: 43,
          expected: Optional.some({ path: [ 0 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after block if the point is bottom, right of it', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="width: 40px; height: 40px; background: green">a</div>',
          targetPath: [ 0 ],
          dx: 43, dy: 43,
          expected: Optional.some({ path: [ 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should favor horizontal noneditables over vertical even when the vertical is closer', () =>
        testClosestFakeCaret({
          html: [
            '<div contenteditable="false" style="width: 100px; height: 30px; background: green">a</div>',
            '<div contenteditable="false" style="width: 30px; height: 30px; background: cyan">b</div>'
          ].join(''),
          targetPath: [ 1 ],
          dx: 90, dy: 5,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the second element if the point is closer to the first between two elements', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          targetPath: [ 1 ],
          dx: 10, dy: -7,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position before the second element if the point is closer to the second between two elements', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          targetPath: [ 1 ],
          dx: 10, dy: -3,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the second element if the point is closer to the second between two elements and after the second element', () =>
        testClosestFakeCaret({
          html: '<div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; width: 40px; background: cyan">b</div>',
          targetPath: [ 1 ],
          dx: 43, dy: -3,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the first noneditable element if the point is top, left outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0 ],
          dx: -7, dy: -7,
          expected: Optional.some({ path: [ 0, 0 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the first noneditable element if the point is top, right outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div style="width: 100px"><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0 ],
          dx: 107, dy: -7,
          expected: Optional.some({ path: [ 0, 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the second noneditable element if the point is bottom, left outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div style="height: 100px"><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0 ],
          dx: -7, dy: 107,
          expected: Optional.some({ path: [ 0, 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the second noneditable element if the point is bottom, right outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div style="width: 100px; height: 100px"><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0 ],
          dx: 107, dy: 107,
          expected: Optional.some({ path: [ 0, 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the second noneditable element if the point is left of it outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0, 1 ],
          dx: -14, dy: 5,
          expected: Optional.some({ path: [ 0, 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the second noneditable element if the point is right of it outside the container element', () =>
        testClosestFakeCaret({
          html: [
            '<div style="width: 100px"><div contenteditable="false" style="margin: 10px; background: green">a</div><div contenteditable="false" style="margin: 10px; background: cyan">b</div>',
          ].join(''),
          targetPath: [ 0, 1 ],
          dx: 114, dy: 5,
          expected: Optional.some({ path: [ 0, 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position after the second noneditable when the element partially intersects the boundary box of the inline elements', () =>
        testClosestFakeCaret({
          html: [
            '<div contenteditable="false" style="margin-left: 20px; background: green">a</div>',
            '<div contenteditable="false" style="margin-left: 5px; margin-top: 10px; background: cyan; width: 50px">b</div>',
            '<div contenteditable="false" style="margin-left: 20px; background: yellow">c</div>',
          ].join(''),
          targetPath: [ 1 ],
          dx: 70, dy: -7,
          expected: Optional.some({ path: [ 1 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the second nested element if the point is closer to the first element but between two elements', () =>
        testClosestFakeCaret({
          html: [
            '<div contenteditable="false">a<div contenteditable="true"><div contenteditable="false" style="margin: 10px; background: green">b</div>',
            '<div contenteditable="false" style="margin: 10px; background: cyan">c</div></div>d</div>'
          ].join(''),
          targetPath: [ 0, 1, 1 ],
          dx: 10, dy: -7,
          expected: Optional.some({ path: [ 0, 1, 1 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position before the second nested element if the point is closer to the second element but between two elements', () =>
        testClosestFakeCaret({
          html: [
            '<div contenteditable="false">a<div contenteditable="true"><div contenteditable="false" style="margin: 10px; background: green">b</div>',
            '<div contenteditable="false" style="margin: 10px; background: cyan">c</div></div>d</div>'
          ].join(''),
          targetPath: [ 0, 1, 1 ],
          dx: 10, dy: -3,
          expected: Optional.some({ path: [ 0, 1, 1 ], position: FakeCaretPosition.Before })
        })
      );
    });

    context('inside tables', () => {
      it('TINY-8169: should not find caret position for a plain text node in a cell at the left of a cell with a noneditable element', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1</td><td><div contenteditable="false" style="background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 0 ],
          dx: 3, dy: 3,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find a caret position before the noneditable element if coordinate is top, left next to the noneditable', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1</td><td><div contenteditable="false" style="margin: 10px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 1 ],
          dx: 5, dy: 5,
          expected: Optional.some({ path: [ 0, 0, 0, 1, 0 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the noneditable element if coordinate is top, right next to the noneditable', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1</td><td><div contenteditable="false" style="margin: 10px; width: 40px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 1 ],
          dx: 45, dy: 5,
          expected: Optional.some({ path: [ 0, 0, 0, 1, 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should find a caret position before the noneditable element if coordinate is bottom, left next to the noneditable', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1</td><td><div contenteditable="false" style="margin: 10px; height: 40px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 1 ],
          dx: 5, dy: 45,
          expected: Optional.some({ path: [ 0, 0, 0, 1, 0 ], position: FakeCaretPosition.Before })
        })
      );

      it('TINY-8169: should find a caret position after the noneditable element if coordinate is bottom, right next to the noneditable', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1</td><td><div contenteditable="false" style="margin: 10px; width: 40px; height: 40px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 1 ],
          dx: 55, dy: 55,
          expected: Optional.some({ path: [ 0, 0, 0, 1, 0 ], position: FakeCaretPosition.After })
        })
      );

      it('TINY-8169: should not produce a fake caret location if the point is on text above a noneditable in table cell', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1<div contenteditable="false" style="margin: 10px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 0 ],
          dx: 5, dy: 5,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should not produce a fake caret location if the point is on text after a noneditable in table cell', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td><div contenteditable="false" style="margin: 10px; height: 40px; background: green">1</div>2</td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 0 ],
          dx: 5, dy: 55,
          expected: Optional.none()
        })
      );

      it('TINY-8169: should find a caret position before the noneditable if the point is on the margin between the noneditable and text', () =>
        testClosestFakeCaret({
          html: '<table style="width: 100px"><tbody><tr><td>1<div contenteditable="false" style="margin: 10px; background: green">2</div></td></tr></tbody></table>',
          targetPath: [ 0, 0, 0, 0, 1 ],
          dx: 5, dy: -5,
          expected: Optional.some({ path: [ 0, 0, 0, 0, 1 ], position: FakeCaretPosition.Before })
        })
      );
    });
  });
});
