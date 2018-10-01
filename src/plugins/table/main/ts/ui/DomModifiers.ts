import { Node } from '@ephox/dom-globals';

// The get node is required here because it can be transformed
// when switching between tags (e.g. th and td)
const normal = (dom, node: Node) => {
  const setAttrib = (attr: string, value: string) => {
    dom.setAttrib(node, attr, value);
  };

  const setStyle = (prop: string, value: string) => {
    dom.setStyle(node, prop, value);
  };

  return {
    setAttrib,
    setStyle
  };
};

const ifTruthy = (dom, node: Node) => {
  const setAttrib = (attr: string, value: string) => {
    if (value) {
      dom.setAttrib(node, attr, value);
    }
  };

  const setStyle = (prop: string, value: string) => {
    if (value) {
      dom.setStyle(node, prop, value);
    }
  };

  return {
    setAttrib,
    setStyle
  };
};

export default {
  normal,
  ifTruthy
};