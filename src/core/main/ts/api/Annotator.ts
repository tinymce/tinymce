import { Arr, Cell, Option, Throttler } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { findMarkers, identify } from 'tinymce/core/annotate/Identification';
import { annotateWithBookmark } from 'tinymce/core/annotate/Wrapping';

export default function (editor) {

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
      () => fireNoAnnotation(),
      ({ uid, name }) => {
        if (isDifferent({ uid, name })) {
          lastAnnotation.set(Option.some({ uid, name }));
          fireCallbacks(uid, name);
        }
      }
    );
  }, 200);

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
      annotations[name] = settings;
    },

    apply: (name: string, data: { }) => {
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
    }
  };
}