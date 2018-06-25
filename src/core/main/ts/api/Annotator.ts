import { Arr, Cell, Option, Throttler, Obj } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { findMarkers, identify, findAll } from 'tinymce/core/annotate/Identification';
import { annotateWithBookmark, Decorator, DecoratorData } from 'tinymce/core/annotate/Wrapping';
import * as Markings from 'tinymce/core/annotate/Markings';

export interface Annotator {
  register: (name: string, settings: AnnotatorSettings) => void;
  annotate: (name: string, data: DecoratorData) => void;
  annotationChanged: (f: (uid: string, name: string, node: any) => void) => void;
  remove: (name: string) => void;
  // TODO: Use stronger types for Nodes when available.
  getAll: (name: string) => Record<string, any>;
}

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export default function (editor): Annotator {

  const annotations = { };

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

  const identifyParserNode = (span): Option<{ name: string, settings: AnnotatorSettings }> => {
    return Option.from(span.attributes.map[Markings.dataAnnotation()]).bind((n) => {
      return Option.from(annotations[n]);
    });
  };

  editor.on('init', () => {
    editor.serializer.addNodeFilter('span', (spans) => {
      Arr.each(spans, (span) => {
        identifyParserNode(span).each((info) => {
          const { settings } = info;
          if (settings.persistent === false) { span.unwrap(); }
        });
      });
    });
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
    },

    /**
     * Retrieve all the annotations for a given name
     * @param {String} name the name of the annotations to retrieve
     * @return {Object} an index of annotations from uid => DOM node
     */
    getAll: (name: string): Record<string, any> => {
      const directory = findAll(editor, name);
      return Obj.map(directory, (elems) => Arr.map(elems, (elem) => elem.dom()));
    }
  } as Annotator;
}