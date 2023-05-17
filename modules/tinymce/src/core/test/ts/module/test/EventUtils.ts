import { Waiter } from '@ephox/agar';
import { Arr, Cell, Singleton } from '@ephox/katamari';
import { assert } from 'chai';

import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as SingletonUtils from './SingletonUtils';

export interface ProcessEventExpectedData {
  readonly internal: boolean;
  readonly content: string;
}

type SingletonEvent<T> = Singleton.Value<EditorEvent<T>>;

const pWaitFor = (message: string, waitFn: () => void): Promise<void> => Waiter.pTryUntil(message, waitFn, undefined, 100);

const pWaitForInputEvent = (event: SingletonEvent<InputEvent>): Promise<void> =>
  pWaitFor('Did not fire input event', () => SingletonUtils.assertSingletonValueIsSet(event, 'Input event has fired'));

const assertLastPreProcessEvent = (event: SingletonEvent<PastePreProcessEvent>, expectedData: ProcessEventExpectedData) =>
  event.on((e) => {
    assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
    assert.equal(e.content, expectedData.content, 'Content property should be equal');
  });

const assertLastPostProcessEvent = (event: SingletonEvent<PastePostProcessEvent>, expectedData: ProcessEventExpectedData) =>
  event.on((e) => {
    assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
    assert.equal(e.node.innerHTML, expectedData.content, 'Content property should be equal');
  });

const pWaitForProcessEvents = (preProcessEvent: SingletonEvent<PastePreProcessEvent>, postProcessEvent: SingletonEvent<PastePostProcessEvent>) =>
  pWaitFor('Did not fire process events', () => {
    SingletonUtils.assertSingletonValueIsSet(preProcessEvent, 'PastePreProcess event has fired');
    SingletonUtils.assertSingletonValueIsSet(postProcessEvent, 'PastePostProcess event has fired');
  });

const pWaitForAndAssertProcessEvents = async (preProcessEvent: SingletonEvent<PastePreProcessEvent>, postProcessEvent: SingletonEvent<PastePostProcessEvent>, expectedData: ProcessEventExpectedData): Promise<void> => {
  await pWaitForProcessEvents(preProcessEvent, postProcessEvent);
  assertLastPreProcessEvent(preProcessEvent, expectedData);
  assertLastPostProcessEvent(postProcessEvent, expectedData);
};

const pWaitForAndAssertInputEvent = async (event: SingletonEvent<InputEvent>): Promise<void> => {
  await pWaitForInputEvent(event);
  event.on((e) => {
    assert.equal(e.inputType, 'insertFromPaste', 'Input event type should be "insertFromPaste"');
    assert.isNull(e.data, 'Input event data should be null');
  });
};

const pWaitForAndAssertEventsDoNotFire = async (events: SingletonEvent<any>[]): Promise<void> => {
  const thrown = Cell<boolean>(false);
  try {
    await Waiter.pTryUntilPredicate('Did not fire any paste event',
      () => Arr.exists(events, (e) => e.isSet()));
  } catch {
    thrown.set(true);
  }
  assert.isTrue(thrown.get(), 'Should have no events after waiting');
};

export {
  pWaitForAndAssertEventsDoNotFire,
  pWaitForAndAssertInputEvent,
  pWaitForAndAssertProcessEvents
};
