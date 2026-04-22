import { Id } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

/**
 * Page-wide aria-live announcer used to send messages to screen readers without
 * shifting focus. The aria-live container is created lazily on the first
 * announcement and removed once no tokens remain in flight.
 *
 * @class tinymce.dom.AriaAnnouncer
 */

export interface AriaAnnouncerApi {
  readonly announce: (message: string, options?: { assertive?: boolean }) => void;
}

const announcerContainerId = Id.generate('tiny-aria-announcer');
let activeTokens = 0;

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

/**
 * Announces a message to screen readers via an aria-live region, without shifting focus.
 *
 * @method announce
 * @param {String} message The message to announce to screen readers.
 * @param {Object} options Optional settings.
 * @param {Boolean} options.assertive If true, uses aria-live="assertive" (role="alert") instead of polite.
 * @example
 * tinymce.dom.AriaAnnouncer.announce('Bold on');
 * tinymce.dom.AriaAnnouncer.announce('Error occurred', { assertive: true });
 */
const announce = (message: string, options?: { assertive?: boolean }): void => {
  const container = getOrCreateContainer();
  const token = createToken(message, options?.assertive === true);
  Insert.append(container, token);
  activeTokens++;

  setTimeout(() => {
    Attribute.remove(token, 'aria-live');
    Remove.remove(token);
    activeTokens--;
    if (activeTokens === 0) {
      Remove.remove(container);
    }
  }, 1000);
};

const AriaAnnouncer: AriaAnnouncerApi = { announce };

export { announcerContainerId };
export default AriaAnnouncer;
