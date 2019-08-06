import { FieldSchema, ValueSchema, Processor } from '@ephox/boulder';
import { setTimeout, KeyboardEvent, clearTimeout } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, Element, Node, SelectorExists } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import { SugarEvent, SugarListener } from '../alien/TypeDefinitions';
import * as SystemEvents from '../api/events/SystemEvents';
import { EventFormat } from './SimulatedEvent';
import * as TapEvent from './TapEvent';

const isDangerous = (event: SugarEvent): boolean => {
  // Will trigger the Back button in the browser
  const keyEv = event.raw() as KeyboardEvent;
  return keyEv.which === Keys.BACKSPACE()[0] && !Arr.contains([ 'input', 'textarea' ], Node.name(event.target())) && !SelectorExists.closest(event.target(), '[contenteditable="true"]');
};

const isFirefox: boolean = PlatformDetection.detect().browser.isFirefox();

export interface GuiEventSettings {
  triggerEvent: (eventName: string, event: EventFormat) => boolean;
  stopBackspace?: boolean;
}

const settingsSchema: Processor = ValueSchema.objOfOnly([
  // triggerEvent(eventName, event)
  FieldSchema.strictFunction('triggerEvent'),
  FieldSchema.defaulted('stopBackspace', true)
]);

const bindFocus = (container: Element, handler: (evt: SugarEvent) => void): SugarListener => {
  if (isFirefox) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    return DomEvent.capture(container, 'focus', handler);
  } else {
    return DomEvent.bind(container, 'focusin', handler);
  }
};

const bindBlur = (container: Element, handler: (evt: SugarEvent) => void): SugarListener => {
  if (isFirefox) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    return DomEvent.capture(container, 'blur', handler);
  } else {
    return DomEvent.bind(container, 'focusout', handler);
  }
};

const setup = (container: Element, rawSettings: { }): { unbind: () => void } => {
  const settings: GuiEventSettings = ValueSchema.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);

  const pointerEvents = PlatformDetection.detect().deviceType.isTouch() ? [
    'touchstart',
    'touchmove',
    'touchend',
    'gesturestart'
  ] : [
    'mousedown',
    'mouseup',
    'mouseover',
    'mousemove',
    'mouseout',
    'click'
  ];

  const tapEvent = TapEvent.monitor(settings);

  // These events are just passed through ... no additional processing
  const simpleEvents = Arr.map(
    pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      // Test the drag events
      'drag',
      'dragstart',
      'dragend',
      'dragenter',
      'dragleave',
      'dragover',
      'drop',
      'keyup'
    ]),
    (type) => {
      return DomEvent.bind(container, type, (event: SugarEvent) => {
        tapEvent.fireIfReady(event, type).each((tapStopped) => {
          if (tapStopped) { event.kill(); }
        });

        const stopped = settings.triggerEvent(type, event);
        if (stopped) { event.kill(); }
      });
    }
  );
  const pasteTimeout = Cell(Option.none<number>());
  const onPaste = DomEvent.bind(container, 'paste', (event: SugarEvent) => {
    tapEvent.fireIfReady(event, 'paste').each((tapStopped) => {
      if (tapStopped) { event.kill(); }
    });

    const stopped = settings.triggerEvent('paste', event);
    if (stopped) { event.kill(); }
    pasteTimeout.set(Option.some(setTimeout(() => {
      settings.triggerEvent(SystemEvents.postPaste(), event);
    }, 0)));
  });

  const onKeydown = DomEvent.bind(container, 'keydown', (event) => {
    // Prevent default of backspace when not in input fields.
    const stopped = settings.triggerEvent('keydown', event);
    if (stopped) {
      event.kill();
    } else if (settings.stopBackspace === true && isDangerous(event)) {
      event.prevent();
    }
  }) as SugarListener;

  const onFocusIn = bindFocus(container, (event: SugarEvent) => {
    const stopped = settings.triggerEvent('focusin', event);
    if (stopped) { event.kill(); }
  });

  const focusoutTimeout = Cell(Option.none<number>());
  const onFocusOut = bindBlur(container, (event: SugarEvent) => {
    const stopped = settings.triggerEvent('focusout', event);
    if (stopped) { event.kill(); }

    // INVESTIGATE: Come up with a better way of doing this. Related target can be used, but not on FF.
    // It allows the active element to change before firing the blur that we will listen to
    // for things like closing popups
    focusoutTimeout.set(Option.some(setTimeout(() => {
      settings.triggerEvent(SystemEvents.postBlur(), event);
    }, 0)));
  });

  const unbind = (): void => {
    Arr.each(simpleEvents, (e) => {
      e.unbind();
    });
    onKeydown.unbind();
    onFocusIn.unbind();
    onFocusOut.unbind();
    onPaste.unbind();
    pasteTimeout.get().each(clearTimeout);
    focusoutTimeout.get().each(clearTimeout);
  };

  return {
    unbind
  };
};

export {
  setup
};
