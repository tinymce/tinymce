import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Resizing } from 'ephox/alloy/api/behaviour/Resizing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('browser.alloy.behaviour.ResizingTest', () => {
  const hook = GuiSetup.bddSetup(() => GuiFactory.build({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Resizing.config({})
    ])
  }));

  afterEach(() => {
    const comp = hook.component();
    Resizing.stop(comp);
  });

  context('TINYMCE-14527: Resizing behaviour', () => {
    it('TINYMCE-14527: should resize by the drag delta on both axes (width and height)', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);
      const result = Resizing.moveBy(comp, SugarPosition(10, 20));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 310, height: 420 }, 'new size is calculated correctly');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 310, height: 420 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should accumulate the delta across multiple drags', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);

      let result = Resizing.moveBy(comp, SugarPosition(10, 5));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 310, height: 405 }, 'first drag');

      result = Resizing.moveBy(comp, SugarPosition(20, 5));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 330, height: 410 }, 'second drag accumulates');

      result = Resizing.moveBy(comp, SugarPosition(15, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 345, height: 410 }, 'third drag accumulates');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 345, height: 410 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should reset the accumulated delta when start is called again', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);

      let result = Resizing.moveBy(comp, SugarPosition(50, 50));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 350, height: 450 }, 'drag before reset');

      Resizing.start(comp, 300, 400);
      result = Resizing.moveBy(comp, SugarPosition(10, 10));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 310, height: 410 }, 'drag after reset uses the new baseline');
    });

    it('TINYMCE-14527: should capture moveBy again after start is called following a stop', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);
      let result = Resizing.moveBy(comp, SugarPosition(10, 20));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 310, height: 420 }, 'first drag is captured');

      Resizing.stop(comp);
      result = Resizing.moveBy(comp, SugarPosition(50, 50));
      assert.isTrue(result.isNone(), 'drag while stopped is ignored');

      Resizing.start(comp, 300, 400);
      result = Resizing.moveBy(comp, SugarPosition(15, 25));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 315, height: 425 }, 'drag after restart uses a fresh baseline');
    });
  });

  context('TINYMCE-14527: Width constraints', () => {
    it('TINYMCE-14527: should not resize past the max width', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(400, 0));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 600, height: 400 }, 'width is clamped at the max');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 600, height: 400 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should not resize past the min width', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(-300, 0));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 200, height: 400 }, 'width is clamped at the min');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 200, height: 400 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should not resize past 0 if the min is not defined', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { maxWidth: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(-1000, 0));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 0, height: 400 }, 'width is clamped at 0');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 0, height: 400 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should keep accumulating past the bounds so an over-drag must be made up before the width changes again', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });

      let result = Resizing.moveBy(comp, SugarPosition(400, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 600, height: 400 }, 'over-dragging past the max clamps the width');

      result = Resizing.moveBy(comp, SugarPosition(-100, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 600, height: 400 }, 'making up part of the over-drag stays clamped at the max');

      result = Resizing.moveBy(comp, SugarPosition(-100, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 500, height: 400 }, 'once the over-drag is made up the width tracks the delta again');

      result = Resizing.moveBy(comp, SugarPosition(-400, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 200, height: 400 }, 'over-dragging past the min clamps the width');

      result = Resizing.moveBy(comp, SugarPosition(100, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 200, height: 400 }, 'making up part of the over-drag stays clamped at the min');

      result = Resizing.moveBy(comp, SugarPosition(100, 0));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 400 }, 'once the over-drag is made up the width tracks the delta again');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 300, height: 400 }, 'stop value equals to latest moveBy');
    });
  });

  context('TINYMCE-14527: Rounding', () => {
    it('TINYMCE-14527: should round a fractional delta to an integer output on both axes', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);
      const result = Resizing.moveBy(comp, SugarPosition(10.4, 20.6));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 310, height: 421 }, 'fractional delta is rounded');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 310, height: 421 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should not accumulate rounding error (drift) across repeated fractional drags', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400);

      let result = Resizing.moveBy(comp, SugarPosition(0.6, 0.6));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 301, height: 401 }, 'drag 1');

      result = Resizing.moveBy(comp, SugarPosition(0.6, 0.6));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 301, height: 401 }, 'drag 2 (no drift)');

      result = Resizing.moveBy(comp, SugarPosition(0.6, 0.6));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 302, height: 402 }, 'drag 3 (no drift)');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 302, height: 402 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should keep a fractional max authoritative when the rounded value would exceed it', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 300, { minWidth: 200, maxWidth: 440.5, minHeight: 200, maxHeight: 440.5 });
      const result = Resizing.moveBy(comp, SugarPosition(200, 200));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 440.5, height: 440.5 }, 'never exceeds a fractional max');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 440.5, height: 440.5 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should keep a fractional min authoritative when the rounded value would drop below it', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 300, { minWidth: 200.25, maxWidth: 600, minHeight: 200.25, maxHeight: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(-200, -200));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 200.25, height: 200.25 }, 'never drops below a fractional min');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 200.25, height: 200.25 }, 'stop value equals to latest moveBy');
    });
  });

  context('TINYMCE-14527: Height constraints', () => {
    it('TINYMCE-14527: should not resize past the max height', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(0, 400));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 600 }, 'height is clamped at the max');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 300, height: 600 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should not resize past the min height', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(0, -300));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 300 }, 'height is clamped at the min');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 300, height: 300 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should not resize past 0 if the min is not defined', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { maxHeight: 600 });
      const result = Resizing.moveBy(comp, SugarPosition(0, -1000));

      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 0 }, 'height is clamped at 0');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 300, height: 0 }, 'stop value equals to latest moveBy');
    });

    it('TINYMCE-14527: should keep accumulating past the bounds so an over-drag must be made up before the height changes again', () => {
      const comp = hook.component();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });

      let result = Resizing.moveBy(comp, SugarPosition(0, 300));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 600 }, 'over-dragging past the max clamps the height');

      result = Resizing.moveBy(comp, SugarPosition(0, -100));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 600 }, 'making up part of the over-drag stays clamped at the max');

      result = Resizing.moveBy(comp, SugarPosition(0, -100));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 500 }, 'once the over-drag is made up the height tracks the delta again');

      result = Resizing.moveBy(comp, SugarPosition(0, -300));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 300 }, 'over-dragging past the min clamps the height');

      result = Resizing.moveBy(comp, SugarPosition(0, 100));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 300 }, 'making up part of the over-drag stays clamped at the min');

      result = Resizing.moveBy(comp, SugarPosition(0, 100));
      assert.deepEqual(result.getOrDie('Resize is not in progress'), { width: 300, height: 400 }, 'once the over-drag is made up the height tracks the delta again');

      const stopResult = Resizing.stop(comp);
      assert.deepEqual(stopResult.getOrDie('Resize is not in progress'), { width: 300, height: 400 }, 'stop value equals to latest moveBy');
    });
  });
});
