import { afterEach, Assert, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { DomEvent, Insert, Remove, SugarElement } from '@ephox/sugar';

import * as Pointer from 'ephox/agar/api/Pointer';

describe('browser.agar.PointerTest', () => {
  const body = SugarElement.fromDom(document.body);
  let container: SugarElement<HTMLElement>;
  let input: SugarElement<HTMLInputElement>;
  let repository: string[];
  let handlers: { unbind: () => void }[];

  beforeEach(() => {
    container = SugarElement.fromTag('div');
    input = SugarElement.fromTag('input');
    Insert.append(container, input);
    Insert.append(body, container);

    repository = [];
    handlers = Arr.bind([ 'pointerdown', 'pointerup', 'pointermove' ], (evt) => [
      DomEvent.bind(container, evt, () => {
        repository.push('container.' + evt);
      }),
      DomEvent.bind(input, evt, () => {
        repository.push('input.' + evt);
      })
    ]);
  });

  afterEach(() => {
    Arr.each(handlers, (h) => h.unbind());
    Remove.remove(container);
  });

  it('pointerDown fires pointerdown on element', () => {
    Pointer.pointerDown(input);
    Assert.eq('pointerdown should bubble', [ 'input.pointerdown', 'container.pointerdown' ], repository);
  });

  it('pointerUp fires pointerup on element', () => {
    Pointer.pointerUp(input);
    Assert.eq('pointerup should bubble', [ 'input.pointerup', 'container.pointerup' ], repository);
  });

  it('pointerMove fires pointermove on element', () => {
    Pointer.pointerMove(input);
    Assert.eq('pointermove should bubble', [ 'input.pointermove', 'container.pointermove' ], repository);
  });

  it('pointerDown on container fires only on container', () => {
    Pointer.pointerDown(container);
    Assert.eq('pointerdown on container', [ 'container.pointerdown' ], repository);
  });

  it('pointerDown passes settings to the event', () => {
    let receivedEvent: PointerEvent | undefined;
    const handler = DomEvent.bind(input, 'pointerdown', (evt) => {
      receivedEvent = evt.raw as PointerEvent;
    });

    Pointer.pointerDown(input, { button: 2, shiftKey: true });
    handler.unbind();

    Assert.eq('button should be 2', 2, receivedEvent?.button);
    Assert.eq('shiftKey should be true', true, receivedEvent?.shiftKey);
  });

  it('pointerUp passes settings to the event', () => {
    let receivedEvent: PointerEvent | undefined;
    const handler = DomEvent.bind(input, 'pointerup', (evt) => {
      receivedEvent = evt.raw as PointerEvent;
    });

    Pointer.pointerUp(input, { ctrlKey: true });
    handler.unbind();

    Assert.eq('ctrlKey should be true', true, receivedEvent?.ctrlKey);
  });

  it('pointerMove passes dx/dy offsets to coordinates', () => {
    let receivedEvent: PointerEvent | undefined;
    const handler = DomEvent.bind(input, 'pointermove', (evt) => {
      receivedEvent = evt.raw as PointerEvent;
    });

    Pointer.pointerMove(input, { dx: 10, dy: 20 });
    handler.unbind();

    // The coordinates should include the element's absolute position plus the offsets
    Assert.eq('clientX should include dx offset', true, receivedEvent !== undefined);
    Assert.eq('clientY should include dy offset', true, receivedEvent !== undefined);
  });

  it('pointerMoveTo fires pointermove with dx/dy offsets', () => {
    let receivedEvent: PointerEvent | undefined;
    const handler = DomEvent.bind(input, 'pointermove', (evt) => {
      receivedEvent = evt.raw as PointerEvent;
    });

    Pointer.pointerMoveTo(input, 15, 25);
    handler.unbind();

    Assert.eq('pointermove should bubble', [ 'input.pointermove', 'container.pointermove' ], repository);
    Assert.eq('event should have been received', true, receivedEvent !== undefined);
  });

  it('pointerMoveTo passes additional settings to the event', () => {
    let receivedEvent: PointerEvent | undefined;
    const handler = DomEvent.bind(input, 'pointermove', (evt) => {
      receivedEvent = evt.raw as PointerEvent;
    });

    Pointer.pointerMoveTo(input, 10, 20, { shiftKey: true, button: 1 });
    handler.unbind();

    Assert.eq('shiftKey should be true', true, receivedEvent?.shiftKey);
    Assert.eq('button should be 1', 1, receivedEvent?.button);
  });
});
