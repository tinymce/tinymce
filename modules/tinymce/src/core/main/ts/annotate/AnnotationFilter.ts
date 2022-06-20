import { Arr, Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import { AnnotationsRegistry, AnnotatorSettings } from './AnnotationsRegistry';
import * as Markings from './Markings';

const setup = (editor: Editor, registry: AnnotationsRegistry): void => {
  const dataAnnotation = Markings.dataAnnotation();
  const identifyParserNode = (node: AstNode): Optional<AnnotatorSettings> =>
    Optional.from(node.attr(dataAnnotation)).bind(registry.lookup);

  const removeDirectAnnotation = (node: AstNode) => {
    node.attr(Markings.dataAnnotationId(), null);
    node.attr(Markings.dataAnnotation(), null);
    node.attr(Markings.dataAnnotationActive(), null);

    const customAttrNames = Optional.from(node.attr(Markings.dataAnnotationAttributes())).map((names) => names.split(',')).getOr([]);
    const customClasses = Optional.from(node.attr(Markings.dataAnnotationClasses())).map((names) => names.split(',')).getOr([]);
    Arr.each(customAttrNames, (name) => node.attr(name, null));

    const classList = node.attr('class')?.split(' ') ?? [];
    const newClassList = Arr.difference(classList, [ Markings.annotation() ].concat(customClasses));
    node.attr('class', newClassList.length > 0 ? newClassList.join(' ') : null);

    node.attr(Markings.dataAnnotationClasses(), null);
    node.attr(Markings.dataAnnotationAttributes(), null);
  };

  editor.serializer.addTempAttr(Markings.dataAnnotationActive());

  editor.serializer.addAttributeFilter(dataAnnotation, (nodes) => {
    for (const node of nodes) {
      identifyParserNode(node).each((settings) => {
        if (settings.persistent === false) {
          if (node.name === 'span') {
            node.unwrap();
          } else {
            removeDirectAnnotation(node);
          }
        }
      });
    }
  });
};

export {
  setup
};
