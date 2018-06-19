import { Arr, Cell, Option, Throttler } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { findMarkers, identify } from 'tinymce/core/annotate/Identification';
import { annotateWithBookmark } from 'tinymce/core/annotate/Wrapping';

export interface Annotator {
  register: (name: string, settings: { }) => void;
  annotate: (name: string, data: { }) => void;
  annotationChanged: (f: (uid: string, name: string, node: any) => void) => void;
  remove: (name: string) => void;
}

export default function (editor): Annotator {

  const annotations = { };

  const lastAnnotation = Cell(Option.none());

  const changeCallbacks = Cell([ ]);

  const fireCallbacks = (name: string, uid: string, element: any): void => {
    Arr.each(changeCallbacks.get(), (f) => f(name, uid, element !== null ? element.dom() : null));
  };

  const fireNoAnnotation = (): void => {
    // Surely there is a better API choice than this.
    fireCallbacks(null, null, null);
  };

  const isDifferent = ({ uid, name }): boolean => {
    return lastAnnotation.get().forall(({ lastUid, lastName }) => {
      return uid !== lastName || name !== lastName;
    });
  };

  const onNodeChange = Throttler.last(() => {
    identify(editor, Option.none()).fold(
      () => {
        fireNoAnnotation();
      },
      ({ uid, name, element }) => {
        if (isDifferent({ uid, name })) {
          lastAnnotation.set(Option.some({ uid, name }));
          fireCallbacks(uid, name, element);
        }
      }
    );
  }, 30);

  editor.on('remove', () => {
    onNodeChange.cancel();
  });

  editor.on('nodeChange', () => {
    onNodeChange.throttle();
  });

  return {
    /**
     * Registers a specific annotator by name
     *
     * @method register
     * @param {String} name the name of the annotation
     * @param {Object} settings settings for the annotation (e.g. decorate)
     */
    register: (name: string, settings: { }) => {
      annotations[name] = {
        name,
        settings
      };
    },

    /**
     * Applies the annotation at the current selection using data
     * @param {String} name the name of the annotation to apply
     * @param {Object} data information to pass through to this particular
     * annotation
     */
    annotate: (name: string, data: { }) => {
      if (annotations.hasOwnProperty(name)) {
        const annotator = annotations[name];
        annotateWithBookmark(editor, annotator, data);
      }
    },

    /**
     * Adds a listener that is notified when the annotation at the
     * current selection changes
     * @param {function} f: the callback function invoked with the
     * uid for the current annotation and the name of the current annotation
     * supplied, and the wrapping element
     */
    annotationChanged: (f: (uid: string, name: string, element: any) => void): void => {
      changeCallbacks.set(
        changeCallbacks.get().concat([ f ])
      );
    },

    /**
     * Removes any annotations from the current selection that match
     * the name
     * @param {String} name the name of the annotation to remove
     */
    remove: (name: string): void => {
      identify(editor, Option.some(name)).each(({ uid }) => {
        const markers = findMarkers(editor, uid);
        Arr.each(markers, Remove.unwrap);
      });
    }
  } as Annotator;
}