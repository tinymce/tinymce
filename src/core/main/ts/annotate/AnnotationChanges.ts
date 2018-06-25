import { AnnotationsRegistry } from 'tinymce/core/annotate/AnnotationsRegistry';
import { Editor } from 'tinymce/core/api/Editor';
import { Throttler, Option, Arr, Cell } from '@ephox/katamari';
import { identify } from './Identification';

export interface AnnotationChanges {
  addListener: (f: (uid: string, name: string, element: any) => void) => void;
}

const setup = (editor: Editor, registry: AnnotationsRegistry): AnnotationChanges => {

  const lastAnnotation = Cell(Option.none());

  const changeCallbacks = Cell([ ]);

  const fireCallbacks = (name: string, uid: string, elements: any[]): void => {
    Arr.each(changeCallbacks.get(), (f) => f(name, uid, Arr.map(elements, (elem) => elem.dom())));
  };

  const fireNoAnnotation = (): void => {
    // Surely there is a better API choice than this.
    fireCallbacks(null, null, [ ]);
  };

  const isDifferent = ({ uid, name }): boolean => {
    return lastAnnotation.get().forall(({ uid: lastUid, name: lastName }) => {
      return uid !== lastUid || name !== lastName;
    });
  };

  const onNodeChange = Throttler.last(() => {
    identify(editor, Option.none()).fold(
      () => {
        if (lastAnnotation.get().isSome()) {
          fireNoAnnotation();
          lastAnnotation.set(Option.none());
        }
      },
      ({ uid, name, elements }) => {
        if (isDifferent({ uid, name })) {
          lastAnnotation.set(Option.some({ uid, name }));
          fireCallbacks(uid, name, elements);
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

  const addListener = (f: (uid: string, name: string, element: any) => void): void => {
    changeCallbacks.set(
      changeCallbacks.get().concat([ f ])
    );
  };

  return {
    addListener
  };
};

export {
  setup
};
