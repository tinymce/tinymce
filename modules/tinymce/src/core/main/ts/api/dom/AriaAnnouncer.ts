import { Id } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

/**
 * Page-wide aria-live announcer used to send messages to screen readers without shifting focus.
 *
 *   Polite messages: appended as child divs to a single persistent live region
 *   (aria-atomic="false", aria-relevant="additions") so each child is announced
 *   independently as it is added. Earlier messages remain in the DOM and are
 *   not re-read. Each message is removed after a delay long enough for screen
 *   readers to have picked up the mutation, keeping the region bounded over long sessions.
 *
 *   Assertive messages: announced through a region that is created fresh per
 *   message and removed entirely before the next assertive announce, so each
 *   one interrupts the previous rather than queueing behind it.
 *
 * @class tinymce.dom.AriaAnnouncer
 */

export interface AriaAnnouncerApi {
  readonly announce: (message: string, options?: { assertive?: boolean }) => void;
}

const announcerContainerId = Id.generate('tiny-aria-announcer');
const politeMessageTtlMs = 60000;

const offscreenStyles = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};

const createPoliteRegion = (): SugarElement<HTMLDivElement> => {
  const region: SugarElement<HTMLDivElement> = SugarElement.fromTag('div');
  Attribute.setAll(region, {
    'aria-live': 'polite',
    'aria-atomic': 'false',
    'aria-relevant': 'additions'
  });
  return region;
};

const createAssertiveRegion = (): SugarElement<HTMLDivElement> => {
  const region: SugarElement<HTMLDivElement> = SugarElement.fromTag('div');
  Attribute.setAll(region, {
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    'role': 'alert'
  });
  return region;
};

interface AnnouncerState {
  readonly container: SugarElement<HTMLElement>;
  readonly polite: SugarElement<HTMLDivElement>;
  assertive: SugarElement<HTMLDivElement> | null;
}

const createAnnouncer = () => {
  let state: AnnouncerState | null = null;

  const ensureMounted = (): AnnouncerState => {
    if (state === null || !state.container.dom.isConnected || !state.polite.dom.isConnected) {
      if (state !== null && state.container.dom.isConnected) {
        Remove.remove(state.container);
      }
      const container: SugarElement<HTMLElement> = SugarElement.fromTag('div');
      Attribute.set(container, 'id', announcerContainerId);
      Css.setAll(container, offscreenStyles);

      const polite = createPoliteRegion();
      Insert.append(container, polite);
      Insert.append(SugarBody.body(), container);

      state = { container, polite, assertive: null };
    }
    return state;
  };

  const polite = (message: string): void => {
    const s = ensureMounted();
    const messageDiv: SugarElement<HTMLDivElement> = SugarElement.fromTag('div');
    Insert.append(messageDiv, SugarElement.fromText(message));
    Insert.append(s.polite, messageDiv);
    setTimeout(() => {
      if (messageDiv.dom.isConnected) {
        Remove.remove(messageDiv);
      }
    }, politeMessageTtlMs);
  };

  const assertive = (message: string): void => {
    const s = ensureMounted();
    if (s.assertive !== null) {
      Remove.remove(s.assertive);
    }
    const region = createAssertiveRegion();
    Insert.append(region, SugarElement.fromText(message));
    Insert.append(s.container, region);
    s.assertive = region;
  };

  return { polite, assertive };
};

const announcer = createAnnouncer();

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
  if (options?.assertive === true) {
    announcer.assertive(message);
  } else {
    announcer.polite(message);
  }
};

const AriaAnnouncer: AriaAnnouncerApi = { announce };

export { announcerContainerId, politeMessageTtlMs };
export default AriaAnnouncer;
