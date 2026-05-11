import { afterEach, Assert, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Singleton } from '@ephox/katamari';
import { Css, DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as Pointer from 'ephox/agar/api/Pointer';
import { TestStore } from 'ephox/agar/api/TestStore';

describe('browser.agar.PointerTest', () => {
  const body = SugarBody.body();
  let container: SugarElement<HTMLElement>;
  let input: SugarElement<HTMLInputElement>;
  const inputLatestEvent = Singleton.value<PointerEvent>();
  const store = TestStore<string>();
  let handlers: { unbind: () => void }[];

  beforeEach(() => {
    container = SugarElement.fromTag('div');
    input = SugarElement.fromTag('input');
    Css.setAll(input, {
      position: 'fixed',
      top: '0',
      left: '0'
    });
    Insert.append(container, input);
    Insert.append(body, container);

    store.clear();
    handlers = Arr.bind([ 'pointerdown', 'pointerup', 'pointermove' ], (evt) => [
      DomEvent.bind(container, evt, () => {
        store.add('container.' + evt);
      }),
      DomEvent.bind(input, evt, (event) => {
        store.add('input.' + evt);
        inputLatestEvent.set(event.raw as PointerEvent);
      })
    ]);
  });

  afterEach(() => {
    Arr.each(handlers, (h) => h.unbind());
    inputLatestEvent.clear();
    Remove.remove(container);
  });

  it('pointerDown fires pointerdown on element', () => {
    Pointer.pointerDown(input);
    store.assertEq('pointerdown should bubble', [ 'input.pointerdown', 'container.pointerdown' ]);
  });

  it('pointerUp fires pointerup on element', () => {
    Pointer.pointerUp(input);
    store.assertEq('pointerup should bubble', [ 'input.pointerup', 'container.pointerup' ]);
  });

  it('pointerMove fires pointermove on element', () => {
    Pointer.pointerMove(input);
    store.assertEq('pointermove should bubble', [ 'input.pointermove', 'container.pointermove' ]);
  });

  it('pointerDown passes settings to the event', () => {
    Pointer.pointerDown(input, { button: 2, shiftKey: true });

    Assert.eq('event should be captured', true, inputLatestEvent.isSet());
    const event = inputLatestEvent.get().getOrDie();

    Assert.eq('pointer down should be latest event', 'pointerdown', event.type);
    Assert.eq('button should be 2', 2, event.button);
    Assert.eq('shiftKey should be true', true, event.shiftKey);
  });

  it('pointerUp passes settings to the event', () => {
    Pointer.pointerUp(input, { button: 2, shiftKey: true });

    Assert.eq('event should be captured', true, inputLatestEvent.isSet());
    const event = inputLatestEvent.get().getOrDie();

    Assert.eq('pointer up should be latest event', 'pointerup', event.type);
    Assert.eq('button should be 2', 2, event.button);
    Assert.eq('shiftKey should be true', true, event.shiftKey);
  });

  it('pointerMove passes settings to the event', () => {
    Pointer.pointerMove(input, { button: 2, shiftKey: true });

    Assert.eq('event should be captured', true, inputLatestEvent.isSet());
    const event = inputLatestEvent.get().getOrDie();

    Assert.eq('pointer move should be latest event', 'pointermove', event.type);
    Assert.eq('button should be 2', 2, event.button);
    Assert.eq('shiftKey should be true', true, event.shiftKey);
  });

  it('pointerMove passes dx/dy offsets to coordinates', () => {
    Pointer.pointerMove(input, { dx: 10, dy: 20 });

    Assert.eq('event should be captured', true, inputLatestEvent.isSet());
    const event = inputLatestEvent.get().getOrDie();

    Assert.eq('pointer move should be latest event', 'pointermove', event.type);

    Assert.eq('clientX should be set', 10, event.clientX);
    Assert.eq('clientY should be set', 20, event.clientY);
    Assert.eq('screenX should be set', 10, event.screenX);
    Assert.eq('screenY should be set', 20, event.screenY);
  });

  it('pointerMoveBy fires pointermove with dx/dy offsets', () => {
    Pointer.pointerMoveBy(input, 10, 20);

    Assert.eq('event should be captured', true, inputLatestEvent.isSet());
    const event = inputLatestEvent.get().getOrDie();

    Assert.eq('pointer move should be latest event', 'pointermove', event.type);

    Assert.eq('clientX should be set', 10, event.clientX);
    Assert.eq('clientY should be set', 20, event.clientY);
    Assert.eq('screenX should be set', 10, event.screenX);
    Assert.eq('screenY should be set', 20, event.screenY);
  });

  context('pWithMockPointerCapture', () => {
    it('pWithMockPointerCapture substitutes setPointerCapture and releasePointerCapture', async () => {
      const events: string[] = [];

      await Pointer.pWithMockPointerCapture(input, {
        setPointerCapture: (id) => events.push(`setPointerCapture(${id})`),
        releasePointerCapture: (id) => events.push(`releasePointerCapture(${id})`)
      }, async () => {
        input.dom.setPointerCapture(1);
        input.dom.releasePointerCapture(1);
      });

      Assert.eq('setPointerCapture and releasePointerCapture should be replaced', [ 'setPointerCapture(1)', 'releasePointerCapture(1)' ], events);
    });

    it('pWithMockPointerCapture restores originals after callback', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalSet = input.dom.setPointerCapture;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalRelease = input.dom.releasePointerCapture;

      await Pointer.pWithMockPointerCapture(input, {}, () => {
        Assert.eq('setPointerCapture should be replaced', true, input.dom.setPointerCapture !== originalSet);
        Assert.eq('releasePointerCapture should be replaced', true, input.dom.releasePointerCapture !== originalRelease);
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      Assert.eq('setPointerCapture should be restored', originalSet, input.dom.setPointerCapture);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Assert.eq('releasePointerCapture should be restored', originalRelease, input.dom.releasePointerCapture);
    });

    it('pWithMockPointerCapture restores originals even if callback throws', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalSet = input.dom.setPointerCapture;
      let threwException = false;

      try {
        await Pointer.pWithMockPointerCapture(input, {}, () => {
          throw new Error('test error');
        });
      } catch {
        threwException = true;
      }

      Assert.eq('callback should have thrown', true, threwException);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Assert.eq('setPointerCapture should be restored after error', originalSet, input.dom.setPointerCapture);
    });

    it('pWithMockPointerCapture defaults to noop when stubs not provided', async () => {
      await Pointer.pWithMockPointerCapture(input, {}, () => {
        input.dom.setPointerCapture(1);
        input.dom.releasePointerCapture(1);
      });
    });

    it('pWithMockPointerCapture returns the callback result', async () => {
      const result = await Pointer.pWithMockPointerCapture(input, {}, () => 40 + 2);
      Assert.eq('should return callback result', 42, result);
    });
  });
});
