import { Arr, Cell, Option, Throttler } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { findMarkers, identify, updateActive } from 'tinymce/core/annotate/Identification';
import { annotateWithBookmark } from 'tinymce/core/annotate/Wrapping';

export interface Annotator {
  register: (name: string, settings: { }) => void;
  annotate: (name: string, data: { }) => void;
  annotationChanged: (f: (uid: string, name: string) => void) => void;
  remove: (name: string) => void;
  setToActive: (uid: string, name: string) => void;
}

export default function (editor): Annotator {

  const annotations = { };

  const lastAnnotation = Cell(Option.none());

  const changeCallbacks = Cell([ ]);

  const fireCallbacks = (name: string, uid: string): void => {
    Arr.each(changeCallbacks.get(), (f) => f(name, uid));
  };

  const fireNoAnnotation = (): void => {
    // Surely there is a better API choice than this.
    fireCallbacks(null, null);
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
        updateActive(editor, name, Option.none());
      },
      ({ uid, name }) => {
        if (isDifferent({ uid, name })) {
          lastAnnotation.set(Option.some({ uid, name }));
          updateActive(editor, name, Option.some(uid));
          fireCallbacks(uid, name);
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
      // Doesn't work for non collapsed selections.
      if (! editor.selection.isCollapsed()) {
        if (annotations.hasOwnProperty(name)) {
          const annotator = annotations[name];
          annotateWithBookmark(editor, annotator, data);
        }
      }
    },

    /**
     * Adds a listener that is notified when the annotation at the
     * current selection changes
     * @param {function} f: the callback function invoked with the
     * uid for the current annotation and the name of the current annotation
     * supplied
     */
    annotationChanged: (f: (uid: string, name: string) => void): void => {
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
    },

    /*
     * Sets the current annotation to an annotation of type name and
     * with a uid of uid
     * @param {String} uid the uid for the annotation
     * @param {String} name the name of the anotation
     */
    setToActive: (uid, name) => {
      updateActive(editor, name, Option.some(uid));
    },

    /*
     * Clears the current annotation for annotation of type name
     * @param {String} the name of the annotation to clear any
     * active highlights
     */
    clearActive: (name) => {
      // Not sure if the name here needs to be considered. Probably does.
      updateActive(editor, name, Option.none());
    }
  } as Annotator;
}