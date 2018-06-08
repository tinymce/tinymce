import { annotateWithBookmark } from 'tinymce/core/annotate/Wrapping';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell, Option, Throttler, Arr } from '@ephox/katamari';
import { Attr, Element, SelectorFind } from '@ephox/sugar';
import { identify } from 'tinymce/core/annotate/Identification';

export default function (editor: Editor) {

  const annotations = { };

  const lastAnnotation = Cell(Option.none());

  const changeCallbacks = Cell([ ]);

  const fireCallbacks = (name, uid) => {
    Arr.each(changeCallbacks.get(), (f) => f(name, uid));
  };

  const fireNoAnnotation = () => {

  };

  const fireAnnotation = (uid, name) => {
    // Firstly, check that it is a new annotation.
    lastAnnotation.get().filter();
  };

  editor.on('remove', () => {
    onNodeChange.cancel();
  });

  editor.on('nodeChange', () => {
    const node: Node = editor.selection.getNode();
    SelectorFind.closest(node, '.mce-annotation');
  });

  const onNodeChange = Throttler.last(() => {
    identify(editor).fold(
      () =>
      ({ uid, name }) => {

    });
    const node: Element = editor.selection.getNode();
    SelectorFind.closest(
      Element.fromDom(node),
      '.mce-annotation'
    ).each((marker) => {
      Attr.has;

    });

    const optAnnotation = bridge.identify(editor);
    const isDisabled = optAnnotation.fold(
      () => {
        return editor.selection.isCollapsed();
      },
      Fun.constant(false)
    );

    const control = ctrl.control;
    control.active(optAnnotation.isSome());
    control.disabled(isDisabled);

    bridge.refreshView(optAnnotation);
  }, 50);

  return {
    /**
     * Registers a specific annotator by name
     *
     * @method register
     * @param {Object/String} name ""
     * @param {Object/Array} format ""
     */
    register: (name, settings) => {
      annotations[name] = settings;
    },

    apply: (name, data) => {
      // Doesn't work for non collapsed selections.
      if (! editor.selection.isCollapsed()) {
        if (annotations.hasOwnProperty(name)) {
          const annotator = annotations[name];
          annotateWithBookmark(editor, annotator, data);
        }
      }
    },

    annotationChanged: (f: (uid, name) => void): void => {
      editor.on('nodeChanged', (.) => {

      });
    },

    annotationMoved: (): void => { },

    remove: (name) => {
      // Remove the annotation at the cursor.
    }
  };
}