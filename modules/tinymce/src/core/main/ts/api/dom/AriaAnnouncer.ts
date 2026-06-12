import * as Announcer from '../../aria/Announcer';

/**
 * Page-wide aria-live announcer used to send messages to screen readers without shifting focus.
 *
 * Messages are appended as child divs to one of two persistent live regions,
 * polite or assertive (both aria-atomic="false", aria-relevant="additions"), so
 * each child is announced independently as it is added. Earlier messages remain
 * in the DOM and are not re-read. Each message is removed after a delay long
 * enough for screen readers to have picked up the mutation, keeping the regions
 * bounded over long sessions.
 *
 * The polite and assertive regions differ only in their aria-live politeness:
 * assertive announcements interrupt the screen reader's current speech, while
 * polite ones wait for it to finish.
 *
 * @class tinymce.dom.AriaAnnouncer
 */

interface AriaAnnouncer {
  readonly announce: (message: string, options?: { assertive?: boolean }) => void;
}

const announcer = Announcer.createAnnouncer();

/**
 * Announces a message to screen readers via an aria-live region, without shifting focus.
 *
 * @method announce
 * @param {String} message The message to announce to screen readers.
 * @param {Object} options Optional settings.
 * @param {Boolean} options.assertive If true, uses aria-live="assertive" instead of polite.
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

const AriaAnnouncer: AriaAnnouncer = {
  announce
};

export default AriaAnnouncer;
