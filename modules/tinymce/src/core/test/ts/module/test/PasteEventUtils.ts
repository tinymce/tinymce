import { Waiter } from '@ephox/agar';
import { DataTransferMode } from '@ephox/dragster';
import { Arr, Cell, Singleton, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as SingletonUtils from './SingletonUtils';

export interface ProcessEventExpectedData {
  readonly internal: boolean;
  readonly content: string;
}

type SingletonEvent<T> = Singleton.Value<EditorEvent<T>>;

const browser = PlatformDetection.detect().browser;

const pWaitFor = (message: string, waitFn: () => void): Promise<void> => Waiter.pTryUntil(message, waitFn, undefined, 100);

const pWaitForAndAssertProcessEvents = async (preProcessEvent: SingletonEvent<PastePreProcessEvent>, postProcessEvent: SingletonEvent<PastePostProcessEvent>, expectedData: ProcessEventExpectedData): Promise<void> => {
  const pWaitForProcessEvents = () =>
    pWaitFor('Did not fire process events', () => {
      SingletonUtils.assertSingletonValueIsSet(preProcessEvent, 'PastePreProcess event has fired');
      SingletonUtils.assertSingletonValueIsSet(postProcessEvent, 'PastePostProcess event has fired');
    });

  const assertLastPreProcessEvent = () =>
    preProcessEvent.on((e) => {
      assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(e.content, expectedData.content, 'Content property should be equal');
    });

  const assertLastPostProcessEvent = () =>
    postProcessEvent.on((e) => {
      assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(e.node.innerHTML, expectedData.content, 'Content property should be equal');
    });

  await pWaitForProcessEvents();
  assertLastPreProcessEvent();
  assertLastPostProcessEvent();
};

const pWaitForAndAssertInputEvents = async (beforeinputEvent: SingletonEvent<InputEvent>, inputEvent: SingletonEvent<InputEvent>, expectedBeforeinputDataTransferHtml?: string, isNative: boolean = false): Promise<void> => {
  const checkDataTransferHtml = !Type.isUndefined(expectedBeforeinputDataTransferHtml);
  const pWaitForInputEvents = (): Promise<void> =>
    pWaitFor('Did not fire input events', () => {
      SingletonUtils.assertSingletonValueIsSet(beforeinputEvent, 'beforeinput event has fired');
      SingletonUtils.assertSingletonValueIsSet(inputEvent, 'input event has fired');
    });

  const assertBeforeInputEvent = (): void =>
    beforeinputEvent.on((e) => {
      assert.equal(e.inputType, 'insertFromPaste', 'input event type should be "insertFromPaste"');
      assert.isNull(e.data, 'beforeinput event data should be null');
      const dataTransfer = e.dataTransfer;
      if (isNative) {
        assert.isNotNull(dataTransfer, 'beforeinput event dataTransfer should not be null');
      } else {
        assert.isTrue(!Type.isNull(dataTransfer) && DataTransferMode.isInReadOnlyMode(dataTransfer), 'beforeinput event dataTransfer should not be null and should be in read-only mode');
      }
      if (checkDataTransferHtml) {
        assert.equal(dataTransfer?.getData('text/html'), expectedBeforeinputDataTransferHtml, 'beforeinput event dataTransfer should contain expected html data');
      }
    });

  const assertInputEvent = (): void =>
    inputEvent.on((e) => {
      assert.equal(e.inputType, 'insertFromPaste', 'beforeinput event type should be "insertFromPaste"');
      assert.isNull(e.data, 'input event data should be null');
      const dataTransfer = e.dataTransfer;
      if (isNative && (browser.isFirefox() || browser.isSafari())) {
        assert.equal(dataTransfer?.getData('text/html'), expectedBeforeinputDataTransferHtml, 'input event dataTransfer should contain expected html data');
      } else {
        assert.isNull(dataTransfer, 'input event dataTransfer should be null');
      }
    });

  await pWaitForInputEvents();
  assertBeforeInputEvent();
  assertInputEvent();
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
  pWaitForAndAssertInputEvents,
  pWaitForAndAssertProcessEvents
};
