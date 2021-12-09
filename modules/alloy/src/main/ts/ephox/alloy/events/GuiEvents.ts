import { Arr, Singleton } from '@ephox/katamari';
import { DomEvent, EventArgs, SelectorExists, SugarElement, SugarNode } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import * as SystemEvents from '../api/events/SystemEvents';
import * as TapEvent from './TapEvent';

const isDangerous = (event: EventArgs<KeyboardEvent>): boolean => {
  // Will trigger the Back button in the browser
  const keyEv = event.raw;
  return keyEv.which === Keys.BACKSPACE[0] && !Arr.contains([ 'input', 'textarea' ], SugarNode.name(event.target)) && !SelectorExists.closest(event.target, '[contenteditable="true"]');
};

export interface GuiEventSettings {
  readonly triggerEvent: (eventName: string, event: EventArgs) => boolean;
  readonly stopBackspace?: boolean;
}

const setup = (container: SugarElement, rawSettings: GuiEventSettings): { unbind: () => void } => {
  const settings: Required<GuiEventSettings> = {
    stopBackspace: true,
    ...rawSettings
  };

  const pointerEvents = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'gesturestart',
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
      'transitioncancel',
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
    (type) => DomEvent.bind(container, type, (event) => {
      tapEvent.fireIfReady(event, type).each((tapStopped) => {
        if (tapStopped) {
          event.kill();
        }
      });

      const stopped = settings.triggerEvent(type, event);
      if (stopped) {
        event.kill();
      }
    })
  );
  const pasteTimeout = Singleton.value<number>();
  const onPaste = DomEvent.bind(container, 'paste', (event) => {
    tapEvent.fireIfReady(event, 'paste').each((tapStopped) => {
      if (tapStopped) {
        event.kill();
      }
    });

    const stopped = settings.triggerEvent('paste', event);
    if (stopped) {
      event.kill();
    }
    pasteTimeout.set(setTimeout(() => {
      settings.triggerEvent(SystemEvents.postPaste(), event);
    }, 0));
  });

  const onKeydown = DomEvent.bind(container, 'keydown', (event) => {
    // Prevent default of backspace when not in input fields.
    const stopped = settings.triggerEvent('keydown', event);
    if (stopped) {
      event.kill();
    } else if (settings.stopBackspace && isDangerous(event)) {
      event.prevent();
    }
  });

  const onFocusIn = DomEvent.bind(container, 'focusin', (event) => {
    const stopped = settings.triggerEvent('focusin', event);
    if (stopped) {
      event.kill();
    }
  });

  const focusoutTimeout = Singleton.value<number>();
  const onFocusOut = DomEvent.bind(container, 'focusout', (event) => {
    const stopped = settings.triggerEvent('focusout', event);
    if (stopped) {
      event.kill();
    }

    // INVESTIGATE: Come up with a better way of doing this. Related target can be used, but not on FF.
    // It allows the active element to change before firing the blur that we will listen to
    // for things like closing popups
    focusoutTimeout.set(setTimeout(() => {
      settings.triggerEvent(SystemEvents.postBlur(), event);
    }, 0));
  });

  const unbind = (): void => {
    Arr.each(simpleEvents, (e) => {
      e.unbind();
    });
    onKeydown.unbind();
    onFocusIn.unbind();
    onFocusOut.unbind();
    onPaste.unbind();
    pasteTimeout.on(clearTimeout);
    focusoutTimeout.on(clearTimeout);
  };

  return {
    unbind
  };
};

export {
  setup
};
