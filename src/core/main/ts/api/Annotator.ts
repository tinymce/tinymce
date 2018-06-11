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
        updateActive(editor, Option.none());
      },
      ({ uid, name }) => {
        if (isDifferent({ uid, name })) {
          lastAnnotation.set(Option.some({ uid, name }));
          updateActive(editor, Option.some({ uid, name }));
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
     * @param {Object/String} name ""
     * @param {Object/Array} format ""
     */
    register: (name: string, settings: { }) => {
      annotations[name] = {
        name,
        settings
      };
    },

    annotate: (name: string, data: { }) => {
      // Doesn't work for non collapsed selections.
      if (! editor.selection.isCollapsed()) {
        if (annotations.hasOwnProperty(name)) {
          const annotator = annotations[name];
          annotateWithBookmark(editor, annotator, data);
        }
      }
    },

    annotationChanged: (f: (uid: string, name: string) => void): void => {
      changeCallbacks.set(
        changeCallbacks.get().concat([ f ])
      );
    },

    remove: (name: string): void => {
      identify(editor, Option.some(name)).each(({ uid }) => {
        const markers = findMarkers(editor, uid);
        Arr.each(markers, Remove.unwrap);
      });
    },

    setToActive: (uid, name) => {
      updateActive(editor, Option.some({ uid, name }));
    }
  } as Annotator;
}