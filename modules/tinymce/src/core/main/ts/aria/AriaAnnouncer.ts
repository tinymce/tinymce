import { Id } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

export interface AriaAnnouncer {
  readonly announce: (message: string, options?: { assertive?: boolean }) => void;
  readonly release: () => void;
}

const announcerContainerId = Id.generate('tiny-aria-announcer');
let counter = 0;

const offscreenStyles = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};

const getOrCreateContainer = (): SugarElement<HTMLElement> => {
  return SelectorFind.descendant<HTMLElement>(SugarBody.body(), `#${announcerContainerId}`).getOrThunk(() => {
    const container = SugarElement.fromTag('div');
    Attribute.set(container, 'id', announcerContainerId);
    Css.setAll(container, offscreenStyles);
    Insert.append(SugarBody.body(), container);
    return container;
  });
};

const createToken = (message: string, assertive: boolean): SugarElement<HTMLSpanElement> => {
  const span = SugarElement.fromTag('span');

  if (assertive) {
    Attribute.setAll(span, {
      'aria-live': 'assertive',
      'aria-atomic': 'true',
      'role': 'alert'
    });
  } else {
    Attribute.setAll(span, {
      'role': 'presentation',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'aria-label': message
    });
  }

  Insert.append(span, SugarElement.fromText(message));
  return span;
};

const setup = (): AriaAnnouncer => {
  const container = getOrCreateContainer();
  counter++;

  const announce = (message: string, options?: { assertive?: boolean }): void => {
    const token = createToken(message, options?.assertive === true);
    Insert.append(container, token);

    setTimeout(() => {
      Attribute.remove(token, 'aria-live');
      Remove.remove(token);
    }, 1000);
  };

  const release = (): void => {
    counter--;
    if (counter === 0) {
      Remove.remove(container);
    }
  };

  return { announce, release };
};

export { announcerContainerId, setup };
