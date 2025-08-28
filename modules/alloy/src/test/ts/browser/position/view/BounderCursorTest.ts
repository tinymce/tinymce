import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  readonly layout: string;
  readonly x: number;
  readonly y: number;
  readonly candidateY?: number;
}

describe('BounderCursorTest', () => {
  const check = (expected: TestDecisionSpec, preference: AnchorLayout[], anchor: AnchorBox, panel: AnchorElement, bubbles: Bubble.Bubble, bounds: Bounds) => {
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
  const four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];
  const two = [ Layout.east, Layout.west ];

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const widePanel = bounds(0, 0, 350, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = Bubble.fallback();

  it('an empty input array is invalid and just returns anchor coordinates', () => {
    check({
      layout: 'none',
      x: 0,
      y: 0
    }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), Bubble.nu(0, 0, {}), bounds(0, 0, 1000, 1000));

    check({
      layout: 'none',
      x: 100,
      y: 0
    }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), Bubble.nu(10, 0, {}), bounds(0, 0, 1000, 1000));
  });

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  it('southeast', () => {
    const anchor = bounds(100, 55, 2, 2);
    check({
      layout: 'layout-southeast',
      x: anchor.x,                                // 100
      y: anchor.bottom,                           // 57
    }, four, anchor, panelBox, bubb, view);
  });

  it('southwest', () => {
    const anchor = bounds(320, 55, 2, 2);
    check({
      layout: 'layout-southwest',
      x: anchor.right - panelBox.width,           // 222
      y: anchor.bottom,                           // 57
    }, four, anchor, panelBox, bubb, view);
  });

  it('northeast', () => {
    const anchor = bounds(140, 235, 2, 2);
    check({
      layout: 'layout-northeast',
      x: anchor.x,                                // 140
      y: anchor.y - panelBox.height               // 160
    }, four, anchor, panelBox, bubb, view);
  });

  it('northwest', () => {
    const anchor = bounds(320, 235, 2, 2);
    check({
      layout: 'layout-northwest',
      x: anchor.right - panelBox.width,           // 222
      y: anchor.y - panelBox.height,              // 160
    }, four, anchor, panelBox, bubb, view);
  });

  it('all fit -> southeast because of order of preference', () => {
    const anchor = bounds(270, 100, 2, 2);
    check({
      layout: 'layout-southeast',
      x: anchor.x,                                // 270
      y: anchor.bottom                            // 102
    }, four, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is southeast', () => {
    const anchor = bounds(55, 55, 2, 2);
    check({
      layout: 'layout-southeast',
      x: anchor.x,                                // 55
      y: anchor.bottom,                           // 57
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near top right -> best fit is southwest', () => {
    const anchor = bounds(350, 55, 2, 2);
    check({
      layout: 'layout-southwest',
      x: anchor.right - bigPanel.width,           // 277
      y: anchor.bottom,                           // 57
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom left -> best fit is northeast', () => {
    const anchor = bounds(55, 200, 2, 2);
    check({
      layout: 'layout-northeast',
      x: anchor.x,                                // 55
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.y - bigPanel.height,     // -300
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom right -> best fit is northwest', () => {
    const anchor = bounds(350, 200, 2, 2);
    check({
      layout: 'layout-northwest',
      x: anchor.right - bigPanel.width,           // 277
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.y - bigPanel.height,     // -300
    }, four, anchor, bigPanel, bubb, view);
  });

  it('TBIO-3366: prevents negative x', () => {
    // Southwest
    const anchorSW = bounds(300, 50, 2, 2);
    check({
      layout: 'layout-southwest',
      x: view.x,                                  // 50 - constrained within viewport
      y: anchorSW.bottom                          // 52
    }, four, anchorSW, widePanel, bubb, view);

    // northwest
    const anchorNW = bounds(300, 200, 2, 2);
    check({
      layout: 'layout-northwest',
      x: view.x,                                  // 50 - constrained within viewport
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchorNW.y - widePanel.height,  // -300
    }, four, anchorNW, widePanel, bubb, view);
  });

  it('southeast (1px short on x and y)', () => {
    const anchor = bounds(view.right - panelBox.width - 1, view.bottom - panelBox.height - 2 - 1, 2, 2);
    check({
      layout: 'layout-southeast',
      x: anchor.x,                                // 299
      y: anchor.bottom,                           // 194
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast (exactly for x and y)', () => {
    const anchor = bounds(view.right - panelBox.width, view.bottom - panelBox.height - 2, 2, 2);
    check({
      layout: 'layout-southeast',
      x: anchor.x,                                // 300
      y: anchor.bottom,                           // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> southwest (1px too far on x)', () => {
    const anchor = bounds(view.right - panelBox.width + 1, view.bottom - panelBox.height - 2, 2, 2);
    check({
      layout: 'layout-southwest',
      x: anchor.right - panelBox.width,           // 203
      y: anchor.bottom,                           // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northeast (1px too far on y)', () => {
    const anchor = bounds(view.right - panelBox.width, view.bottom - panelBox.height - 2 + 1, 2, 2);
    check({
      layout: 'layout-northeast',
      x: anchor.x,                                // 300
      y: anchor.y - panelBox.height,              // 119
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northwest (1px too far on x and y)', () => {
    const anchor = bounds(view.right - panelBox.width + 1, view.bottom - panelBox.height - 2 + 1, 2, 2);
    check({
      layout: 'layout-northwest',
      x: anchor.right - panelBox.width,           // 203
      y: anchor.y - panelBox.height,              // 119
    }, four, anchor, panelBox, bubb, view);
  });

  it('east', () => {
    const anchor = bounds(55, 150, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right,                                            // 65
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2),  // 117.5
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom left -> best fit is east (limited to bottom bounds)', () => {
    const anchor = bounds(55, 240, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right,                            // 65
      y: view.bottom - panelBox.height            // 195 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is east (limited to top bounds)', () => {
    const anchor = bounds(55, 80, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right,                            // 65
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('west', () => {
    const anchor = bounds(350, 150, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width,                               // 250
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2),  // 117.5
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom right -> best fit is west (limited to bottom bounds)', () => {
    const anchor = bounds(350, 240, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width,               // 250
      y: view.bottom - panelBox.height            // 195 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top right -> best fit is west (limited to top bounds)', () => {
    const anchor = bounds(350, 80, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width,               // 250
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });
});
