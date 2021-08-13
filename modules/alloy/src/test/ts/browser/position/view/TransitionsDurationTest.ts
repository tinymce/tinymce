import { describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { getTransitionDuration } from 'ephox/alloy/positioning/view/Transitions';

describe('browser.alloy.position.view.TransitionsDurationTest', () => {
  it('TINY-7740: should return 0 without any transition', () => {
    const elem = SugarElement.fromTag('div');
    assert.equal(getTransitionDuration(elem), 0);
  });

  it('TINY-7740: should return 0 with an "initial" transition duration', () => {
    const elem = SugarElement.fromTag('div');
    Css.set(elem, 'transition-duration', 'initial');
    assert.equal(getTransitionDuration(elem), 0);
  });

  it('TINY-7740: should add both the delay and duration', () => {
    const elem = SugarElement.fromTag('div');
    // Seconds
    Css.set(elem, 'transition', 'all 0.1s ease 0.25s');
    assert.equal(getTransitionDuration(elem), 350, 'using seconds');
    // Milliseconds
    Css.set(elem, 'transition', 'all 150ms ease 200ms');
    assert.equal(getTransitionDuration(elem), 350, 'using milliseconds');
    // Mixed
    Css.set(elem, 'transition', 'all .3s ease 150ms');
    assert.equal(getTransitionDuration(elem), 450, 'using mixed times');
  });

  it('TINY-7740: should find the largest with multiple different transitions', () => {
    const elem = SugarElement.fromTag('div');
    Css.set(elem, 'transition', 'all 0.1s, right 150ms, left 60ms ease 40ms');
    assert.equal(getTransitionDuration(elem), 150, 'using seconds');
  });
});
