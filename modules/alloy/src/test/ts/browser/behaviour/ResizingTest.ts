import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { SugarPosition } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Resizing } from 'ephox/alloy/api/behaviour/Resizing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

interface ResizeCall {
  readonly width: number;
  readonly height: number;
}

describe('browser.alloy.behaviour.ResizingTest', () => {
  const hook = GuiSetup.bddSetup<ResizeCall>((store) => GuiFactory.build({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Resizing.config({
        resize: (_comp, width, height) => store.add({ width, height })
      })
    ])
  }));

  afterEach(() => {
    const comp = hook.component();
    hook.store().clear();
    Resizing.stop(comp);
  });

  context('TINYMCE-14527: Resizing behaviour', () => {
    it('TINYMCE-14527: should resize by the drag delta on both axes (width and height)', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400);
      Resizing.moveBy(comp, SugarPosition(10, 20));

      store.assertEq('resize fires once with the drag delta', [{ width: 310, height: 420 }]);
    });

    it('TINYMCE-14527: should accumulate the delta across multiple drags', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400);

      Resizing.moveBy(comp, SugarPosition(10, 5));
      store.assertEq('first drag', [{ width: 310, height: 405 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(20, 5));
      store.assertEq('second drag accumulates', [{ width: 330, height: 410 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(15, 0));
      store.assertEq('third drag accumulates', [{ width: 345, height: 410 }]);
    });

    it('TINYMCE-14527: should reset the accumulated delta when start is called again', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400);

      Resizing.moveBy(comp, SugarPosition(50, 50));
      store.assertEq('drag before reset', [{ width: 350, height: 450 }]);
      store.clear();

      Resizing.start(comp, 300, 400);
      Resizing.moveBy(comp, SugarPosition(10, 10));
      store.assertEq('drag after reset uses the new baseline', [{ width: 310, height: 410 }]);
    });

    it('TINYMCE-14527: should capture moveBy again after start is called following a stop', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400);
      Resizing.moveBy(comp, SugarPosition(10, 20));
      store.assertEq('first drag is captured', [{ width: 310, height: 420 }]);
      store.clear();

      Resizing.stop(comp);
      Resizing.moveBy(comp, SugarPosition(50, 50));
      store.assertEq('drag while stopped is ignored', []);
      store.clear();

      Resizing.start(comp, 300, 400);
      Resizing.moveBy(comp, SugarPosition(15, 25));
      store.assertEq('drag after restart uses a fresh baseline', [{ width: 315, height: 425 }]);
    });
  });

  context('TINYMCE-14527: Width constraints', () => {
    it('TINYMCE-14527: should not resize past the max width', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });
      Resizing.moveBy(comp, SugarPosition(400, 0));

      store.assertEq('width is clamped at the max', [{ width: 600, height: 400 }]);
    });

    it('TINYMCE-14527: should not resize past the min width', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });
      Resizing.moveBy(comp, SugarPosition(-300, 0));

      store.assertEq('width is clamped at the min', [{ width: 200, height: 400 }]);
    });

    it('TINYMCE-14527: should not resize past 0 if the min is not defined', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { maxWidth: 600 });
      Resizing.moveBy(comp, SugarPosition(-1000, 0));

      store.assertEq('width is clamped at 0', [{ width: 0, height: 400 }]);
    });

    it('TINYMCE-14527: should keep accumulating past the bounds so an over-drag must be made up before the width changes again', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minWidth: 200, maxWidth: 600 });

      Resizing.moveBy(comp, SugarPosition(400, 0));
      store.assertEq('over-dragging past the max clamps the width', [{ width: 600, height: 400 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(-100, 0));
      store.assertEq('making up part of the over-drag stays clamped at the max', [{ width: 600, height: 400 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(-100, 0));
      store.assertEq('once the over-drag is made up the width tracks the delta again', [{ width: 500, height: 400 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(-400, 0));
      store.assertEq('over-dragging past the min clamps the width', [{ width: 200, height: 400 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(100, 0));
      store.assertEq('making up part of the over-drag stays clamped at the min', [{ width: 200, height: 400 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(100, 0));
      store.assertEq('once the over-drag is made up the width tracks the delta again', [{ width: 300, height: 400 }]);
    });
  });

  context('TINYMCE-14527: Height constraints', () => {
    it('TINYMCE-14527: should not resize past the max height', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });
      Resizing.moveBy(comp, SugarPosition(0, 400));

      store.assertEq('height is clamped at the max', [{ width: 300, height: 600 }]);
    });

    it('TINYMCE-14527: should not resize past the min height', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });
      Resizing.moveBy(comp, SugarPosition(0, -300));

      store.assertEq('height is clamped at the min', [{ width: 300, height: 300 }]);
    });

    it('TINYMCE-14527: should not resize past 0 if the min is not defined', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { maxHeight: 600 });
      Resizing.moveBy(comp, SugarPosition(0, -1000));

      store.assertEq('height is clamped at 0', [{ width: 300, height: 0 }]);
    });

    it('TINYMCE-14527: should keep accumulating past the bounds so an over-drag must be made up before the height changes again', () => {
      const comp = hook.component();
      const store = hook.store();

      Resizing.start(comp, 300, 400, { minHeight: 300, maxHeight: 600 });

      Resizing.moveBy(comp, SugarPosition(0, 300));
      store.assertEq('over-dragging past the max clamps the height', [{ width: 300, height: 600 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(0, -100));
      store.assertEq('making up part of the over-drag stays clamped at the max', [{ width: 300, height: 600 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(0, -100));
      store.assertEq('once the over-drag is made up the height tracks the delta again', [{ width: 300, height: 500 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(0, -300));
      store.assertEq('over-dragging past the min clamps the height', [{ width: 300, height: 300 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(0, 100));
      store.assertEq('making up part of the over-drag stays clamped at the min', [{ width: 300, height: 300 }]);
      store.clear();

      Resizing.moveBy(comp, SugarPosition(0, 100));
      store.assertEq('once the over-drag is made up the height tracks the delta again', [{ width: 300, height: 400 }]);
    });
  });
});
