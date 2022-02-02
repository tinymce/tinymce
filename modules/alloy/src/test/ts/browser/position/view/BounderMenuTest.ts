import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as LinkedLayout from 'ephox/alloy/positioning/layout/LinkedLayout';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  readonly layout: string;
  readonly x: number;
  readonly y: number;
  readonly candidateY?: number;
}

describe('BounderMenuTest', () => {
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

  // LinkedLayout is for submenus (vertically aligned to opposite side of menu)
  const four = [ LinkedLayout.southeast, LinkedLayout.southwest, LinkedLayout.northeast, LinkedLayout.northwest ];

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = Bubble.fallback();

  it('an empty input array is invalid and just returns anchor coordinates', () => {
    check({
      layout: 'none',
      x: 0,
      y: 0
    }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), Bubble.fallback(), bounds(0, 0, 1000, 1000));

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
      layout: 'link-layout-southeast',
      x: anchor.right,                            // 102
      y: anchor.y,                                // 55
    }, four, anchor, panelBox, bubb, view);
  });

  it('southwest', () => {
    const anchor = bounds(320, 55, 2, 2);
    check({
      layout: 'link-layout-southwest',
      x: anchor.x - panelBox.width,               // 220
      y: anchor.y,                                // 55
    }, four, anchor, panelBox, bubb, view);
  });

  it('northeast', () => {
    const anchor = bounds(140, 235, 2, 2);
    check({
      layout: 'link-layout-northeast',
      x: anchor.right,                            // 142
      y: anchor.bottom - panelBox.height,         // 162
    }, four, anchor, panelBox, bubb, view);
  });

  it('northwest', () => {
    const anchor = bounds(320, 235, 2, 2);
    check({
      layout: 'link-layout-northwest',
      x: anchor.x - panelBox.width,               // 220
      y: anchor.bottom - panelBox.height,         // 162
    }, four, anchor, panelBox, bubb, view);
  });

  it('all fit -> southeast because of order of preference', () => {
    const anchor = bounds(270, 100, 2, 2);
    check({
      layout: 'link-layout-southeast',
      x: anchor.right,                            // 272
      y: anchor.y,                                // 100
    }, four, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is southeast', () => {
    const anchor = bounds(55, 55, 2, 2);
    check({
      layout: 'link-layout-southeast',
      x: anchor.right,                            // 57
      y: anchor.y,                                // 55
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near top right -> best fit is southwest', () => {
    const anchor = bounds(350, 55, 2, 2);
    check({
      layout: 'link-layout-southwest',
      x: anchor.x - bigPanel.width,               // 275
      y: anchor.y,                                // 55
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom left -> best fit is northeast', () => {
    const anchor = bounds(55, 200, 2, 2);
    check({
      layout: 'link-layout-northeast',
      x: anchor.right,                            // 57
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.bottom - bigPanel.height // -298
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom right -> best fit is northwest', () => {
    const anchor = bounds(350, 200, 2, 2);
    check({
      layout: 'link-layout-northwest',
      x: anchor.x - bigPanel.width,               // 275
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.bottom - bigPanel.height // -298
    }, four, anchor, bigPanel, bubb, view);
  });

  it('southeast (1px short on x and y)', () => {
    const anchor = bounds(view.right - panelBox.width - 2 - 1, view.bottom - panelBox.height - 1, 2, 2);
    check({
      layout: 'link-layout-southeast',
      x: anchor.right,                            // 299
      y: anchor.y,                                // 194
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast (exactly for x and y)', () => {
    const anchor = bounds(view.right - panelBox.width - 2, view.bottom - panelBox.height, 2, 2);
    check({
      layout: 'link-layout-southeast',
      x: anchor.right,                            // 300
      y: anchor.y,                                // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> southwest (1px too far on x)', () => {
    const anchor = bounds(view.right - panelBox.width - 2 + 1, view.bottom - panelBox.height, 2, 2);
    check({
      layout: 'link-layout-southwest',
      x: anchor.x - panelBox.width,               // 199
      y: anchor.y,                                // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northeast (1px too far on y)', () => {
    const anchor = bounds(view.right - panelBox.width - 2, view.bottom - panelBox.height + 1, 2, 2);
    check({
      layout: 'link-layout-northeast',
      x: anchor.right,                            // 300
      y: anchor.bottom - panelBox.height          // 123
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northwest (1px too far on x and y)', () => {
    const anchor = bounds(view.right - panelBox.width - 2 + 1, view.bottom - panelBox.height + 1, 2, 2);
    check({
      layout: 'link-layout-northwest',
      x: anchor.x - panelBox.width,               // 199
      y: anchor.bottom - panelBox.height          // 123
    }, four, anchor, panelBox, bubb, view);
  });
});
