import { Arr, Obj, Strings } from '@ephox/katamari';

import DOMUtils from '../dom/DOMUtils';

const nonInheritableStyles: Set<string> = new Set();
(() => {
  // TODO: TINY-7326 Figure out what else should go in the nonInheritableStyles list
  const nonInheritableStylesArr = [
    'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
    'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'border', 'border-width', 'border-style', 'border-color',
    'background', 'background-attachment', 'background-clip', 'background-color',
    'background-image', 'background-origin', 'background-position', 'background-repeat', 'background-size',
    'float', 'position', 'left', 'right', 'top', 'bottom',
    'z-index', 'display', 'transform',
    'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
    'overflow', 'overflow-x', 'overflow-y', 'text-overflow', 'vertical-align',
    'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function'
  ];
  Arr.each(nonInheritableStylesArr, (style) => {
    nonInheritableStyles.add(style);
  });
})();

// TODO: TINY-7326 Figure out what else should be added to the shorthandStyleProps list
// Does not include non-inherited shorthand style properties
const shorthandStyleProps = [ 'font', 'text-decoration', 'text-emphasis' ];

const getStyleProps = (dom: DOMUtils, node: Element) =>
  Obj.keys(dom.parseStyle(dom.getAttrib(node, 'style')));

const isNonInheritableStyle = (style: string) => nonInheritableStyles.has(style);

const hasInheritableStyles = (dom: DOMUtils, node: Element): boolean =>
  Arr.forall(getStyleProps(dom, node), (style) => !isNonInheritableStyle(style));

const getLonghandStyleProps = (styles: string[]): string[] =>
  Arr.filter(styles, (style) => Arr.exists(shorthandStyleProps, (prop) => Strings.startsWith(style, prop)));

const hasStyleConflict = (dom: DOMUtils, node: Element, parentNode: Element): boolean => {
  const nodeStyleProps = getStyleProps(dom, node);
  const parentNodeStyleProps = getStyleProps(dom, parentNode);

  const valueMismatch = (prop: string) => {
    const nodeValue = dom.getStyle(node, prop) ?? '';
    const parentValue = dom.getStyle(parentNode, prop) ?? '';
    return Strings.isNotEmpty(nodeValue) && Strings.isNotEmpty(parentValue) && nodeValue !== parentValue;
  };

  return Arr.exists(nodeStyleProps, (nodeStyleProp) => {
    const propExists = (props: string[]) => Arr.exists(props, (prop) => prop === nodeStyleProp);
    // If parent has a longhand property e.g. margin-left but the child (node) style is margin, need to get the margin-left value of node to be able to do a proper comparison
    // This is because getting the style using the key of 'margin' on a 'margin-left' parent would give a string of space separated values or empty string depending on the browser
    if (!propExists(parentNodeStyleProps) && propExists(shorthandStyleProps)) {
      const longhandProps = getLonghandStyleProps(parentNodeStyleProps);
      return Arr.exists(longhandProps, valueMismatch);
    } else {
      return valueMismatch(nodeStyleProp);
    }
  });
};

export {
  hasInheritableStyles,
  hasStyleConflict
};
