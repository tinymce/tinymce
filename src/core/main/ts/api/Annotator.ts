import { Arr, Obj, Option } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import * as AnnotationChanges from 'tinymce/core/annotate/AnnotationChanges';
import * as AnnotationFilter from 'tinymce/core/annotate/AnnotationFilter';
import { create } from 'tinymce/core/annotate/AnnotationsRegistry';
import { findAll, identify } from 'tinymce/core/annotate/Identification';
import { annotateWithBookmark, Decorator, DecoratorData } from 'tinymce/core/annotate/Wrapping';

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
  const registry = create();
  AnnotationFilter.setup(editor, registry);
  const changes = AnnotationChanges.setup(editor, registry);

  return {
    /**
     * Registers a specific annotator by name
     *
     * @method register
     * @param {String} name the name of the annotation
     * @param {Object} settings settings for the annotation (e.g. decorate)
     */
    register: (name: string, settings: AnnotatorSettings) => {
      registry.register(name, settings);
    },

    /**
     * Applies the annotation at the current selection using data
     * @param {String} name the name of the annotation to apply
     * @param {Object} data information to pass through to this particular
     * annotation
     */
    annotate: (name: string, data: { }) => {
      registry.lookup(name).each((settings) => {
        annotateWithBookmark(editor, name, settings, data);
      });
    },

    /**
     * Adds a listener that is notified when the annotation at the
     * current selection changes
     * @param {function} f: the callback function invoked with the
     * uid for the current annotation and the name of the current annotation
     * supplied, and the wrapping elements
     */
    annotationChanged: (f: (uid: string, name: string, element: any) => void): void => {
      changes.addListener(f);
    },

    /**
     * Removes any annotations from the current selection that match
     * the name
     * @param {String} name the name of the annotation to remove
     */
    remove: (name: string): void => {
      identify(editor, Option.some(name)).each(({ elements }) => {
        Arr.each(elements, Remove.unwrap);
      });
    },

    /**
     * Retrieve all the annotations for a given name
     * @param {String} name the name of the annotations to retrieve
     * @return {Object} an index of annotations from uid => DOM nodes
     */
    getAll: (name: string): Record<string, any> => {
      const directory = findAll(editor, name);
      return Obj.map(directory, (elems) => Arr.map(elems, (elem) => elem.dom()));
    }
  } as Annotator;
}