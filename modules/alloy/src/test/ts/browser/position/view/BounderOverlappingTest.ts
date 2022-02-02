import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement, SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import { Bubble, BubbleInstance } from 'ephox/alloy/positioning/layout/Bubble';
import * as LayoutInset from 'ephox/alloy/positioning/layout/LayoutInset';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  readonly layout: string;
  readonly x: number;
  readonly y: number;
  readonly candidateY?: number;
}

describe('BounderOverlappingTest', () => {
  const check = (expected: TestDecisionSpec, preference: AnchorLayout[], anchor: AnchorBox, panel: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
    const placee = SugarElement.fromTag('div');
    const actual = Bounder.attempts(placee, preference, anchor, panel, bubbles, bounds);
    assert.equal(actual.layout, expected.layout, 'layout');
    assert.equal(actual.rect.x, expected.x, 'X');
    assert.equal(actual.rect.y, expected.y, 'Y');
    if (expected.candidateY !== undefined) {
      assert.equal(actual.testY, expected.candidateY, 'Candidate Y');
    }
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  const bubble = (): Bubble => {
    const northeast = (): BubbleInstance => ({
      offset: SugarPosition(1, -1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const northwest = (): BubbleInstance => ({
      offset: SugarPosition(-1, -1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const southeast = (): BubbleInstance => ({
      offset: SugarPosition(1, 2),
      classesOn: [ ],
      classesOff: [ ]
    });

    const southwest = (): BubbleInstance => ({
      offset: SugarPosition(-1, 2),
      classesOn: [ ],
      classesOff: [ ]
    });

    const south = (): BubbleInstance => ({
      offset: SugarPosition(-1, -1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const north = (): BubbleInstance => ({
      offset: SugarPosition(-1, -1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const east = (): BubbleInstance => ({
      offset: SugarPosition(1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const west = (): BubbleInstance => ({
      offset: SugarPosition(1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const notImplemented = Fun.die('Not implemented');

    return {
      northwest: notImplemented,
      northeast: notImplemented,
      southwest: notImplemented,
      southeast: notImplemented,
      south: notImplemented,
      north: notImplemented,
      east: notImplemented,
      west: notImplemented,
      insetSouthwest: southwest,
      insetSoutheast: southeast,
      insetSouth: south,
      insetNorthwest: northwest,
      insetNortheast: northeast,
      insetNorth: north,
      insetWest: west,
      insetEast: east
    };
  };

  const four = [ LayoutInset.southeast, LayoutInset.southwest, LayoutInset.northeast, LayoutInset.northwest ];
  const two = [ LayoutInset.east, LayoutInset.west ];

  const panelBox = bounds(0, 0, 15, 10);
  const bigPanel = bounds(0, 0, 100, 100);
  const view = bounds(50, 50, 350, 220);
  const bubb = bubble();

  it('an empty input array is invalid and just returns anchor coordinates', () => {
    check({
      layout: 'none',
      x: 0,
      y: 0
    }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), bubble(), bounds(0, 0, 1000, 1000));

    check({
      layout: 'none',
      x: 100,
      y: 0
    }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), bubble(), bounds(0, 0, 1000, 1000));
  });

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  it('southeast', () => {
    const anchor = bounds(340, 45, 80, 80);
    check({
      layout: 'layout-inset-southeast',
      x: anchor.x + 1,                            // 341
      y: anchor.bottom - panelBox.height + 2      // 117
    }, four, anchor, panelBox, bubb, view);
  });

  it('southwest', () => {
    const anchor = bounds(40, 45, 50, 50);
    check({
      layout: 'layout-inset-southwest',
      x: anchor.right - panelBox.width - 1,       // 74
      y: anchor.bottom - panelBox.height + 2      // 87
    }, four, anchor, panelBox, bubb, view);
  });

  it('northeast', () => {
    const anchor = bounds(340, 235, 80, 80);
    check({
      layout: 'layout-inset-northeast',
      x: anchor.x + 1,                            // 341
      y: anchor.y - 1                             // 234
    }, four, anchor, panelBox, bubb, view);
  });

  it('northwest', () => {
    const anchor = bounds(40, 235, 50, 50);
    check({
      layout: 'layout-inset-northwest',
      x: anchor.right - panelBox.width - 1,       // 74
      y: anchor.y - 1                             // 234
    }, four, anchor, panelBox, bubb, view);
  });

  it('all fit -> southeast because of order of preference', () => {
    const anchor = bounds(270, 100, 100, 100);
    check({
      layout: 'layout-inset-southeast',
      x: anchor.x + 1,                            // 271
      y: anchor.bottom - panelBox.height + 2      // 192
    }, four, anchor, panelBox, bubb, view);
  });

  it('none -> best fit is southeast', () => {
    const anchor = bounds(60, 40, view.width, view.height + 15);
    check({
      layout: 'layout-inset-southeast',
      x: anchor.x + 1,                            // 61
      y: view.bottom - bigPanel.height,           // 170 - Constrained within viewport
      candidateY: anchor.bottom - bigPanel.height + 2, // 177
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none -> best fit is southwest', () => {
    const anchor = bounds(40, 40, view.width + 15, view.height);
    check({
      layout: 'layout-inset-southwest',
      x: view.right - bigPanel.width - 1,         // 299 - Constrained within viewport
      y: anchor.bottom - bigPanel.height + 2,     // 177
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none -> best fit is northeast', () => {
    const anchor = bounds(45, 55, view.width + 15, view.height);
    check({
      layout: 'layout-inset-northeast',
      x: view.x + 1,                              // 51 - Constrained within viewport
      y: anchor.y - 1,                            // 54
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none -> best fit is northwest', () => {
    const anchor = bounds(40, 45, view.width, view.height + 15);
    check({
      layout: 'layout-inset-northwest',
      x: anchor.right - bigPanel.width - 1,       // 289
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.y - 1,                   // 44
    }, four, anchor, bigPanel, bubb, view);
  });

  it('southeast (1px short on x and y)', () => {
    // Note: The additional -2 here is to account for the southeast bubble y offsets
    const anchor = bounds(view.y + 1, view.bottom - 20 - 2 - 1, 20, 20);
    check({
      layout: 'layout-inset-southeast',
      x: anchor.x + 1,                            // 51
      y: anchor.bottom - panelBox.height + 2,     // 259
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast (exactly for x and y)', () => {
    // Note: The additional -2 here is to account for the southeast bubble y offsets
    const anchor = bounds(view.y, view.bottom - 20 - 2, 20, 20);
    check({
      layout: 'layout-inset-southeast',
      x: anchor.x + 1,                            // 50
      y: anchor.bottom - panelBox.height + 2,     // 260
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> southwest (1px too far on x)', () => {
    // Note: The additional -2 here is to account for the southeast bubble y offsets
    const anchor = bounds(view.y - 1, view.bottom - 30 - 2, 30, 30);
    check({
      layout: 'layout-inset-southwest',
      x: anchor.right - panelBox.width - 1,       // 63
      y: anchor.bottom - panelBox.height + 2,     // 260
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northeast (1px too far on y)', () => {
    // Note: The additional -2 here is to account for the southeast bubble y offsets
    const anchor = bounds(view.y, view.bottom - 30 - 2 + 1, 30, 30);
    check({
      layout: 'layout-inset-northeast',
      x: anchor.x + 1,                            // 50
      y: anchor.y - 1                             // 238
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northwest (1px too far on x and y)', () => {
    // Note: The additional -2 here is to account for the southeast bubble y offsets
    const anchor = bounds(view.y - 1, view.bottom - 30 - 2 + 1, 30, 30);
    check({
      layout: 'layout-inset-northwest',
      x: anchor.right - panelBox.width - 1,       // 63
      y: anchor.y - 1                             // 238
    }, four, anchor, panelBox, bubb, view);
  });

  it('east', () => {
    const anchor = bounds(55, 150, 100, 100);
    check({
      layout: 'layout-inset-east',
      x: anchor.right - panelBox.width + 1,                         // 141
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2) + 1 // 196
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom left -> best fit is east (limited to bottom bounds)', () => {
    const anchor = bounds(55, 240, 100, 100);
    check({
      layout: 'layout-inset-east',
      x: anchor.right - panelBox.width + 1,       // 141
      y: view.bottom - panelBox.height            // 260 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is east (limited to top bounds)', () => {
    const anchor = bounds(55, 0, 100, 100);
    check({
      layout: 'layout-inset-east',
      x: anchor.right - panelBox.width + 1,       // 141
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('west', () => {
    const anchor = bounds(320, 150, 100, 100);
    check({
      layout: 'layout-inset-west',
      x: anchor.x + 1,                                              // 321
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2) + 1 // 196
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom right -> best fit is west (limited to bottom bounds)', () => {
    const anchor = bounds(320, 240, 100, 100);
    check({
      layout: 'layout-inset-west',
      x: anchor.x + 1,                            // 321
      y: view.bottom - panelBox.height            // 260 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top right -> best fit is west (limited to top bounds)', () => {
    const anchor = bounds(320, 0, 100, 100);
    check({
      layout: 'layout-inset-west',
      x: anchor.x + 1,                            // 321
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });
});
