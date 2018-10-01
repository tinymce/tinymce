import { Element } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';

const findNearest = (editor, getStyles, nodeChangeEvent) => {
  const parents: Element[] = nodeChangeEvent.parents;

  const styles = getStyles();

  return Options.findMap(parents, (parent) => {
    return Arr.find(styles, (fmt) => {
      return editor.formatter.matchNode(parent, fmt.format);
    });
  }).orThunk(() => {
    if (editor.formatter.match('p')) { return Option.some({title: 'Paragraph', format: 'p' }); }
    return Option.none();
  });
};

export {
  findNearest
};