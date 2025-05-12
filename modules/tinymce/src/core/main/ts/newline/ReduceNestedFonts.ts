import { Attribute, Compare, Css, Remove, SugarElement, Traverse, SugarNode } from '@ephox/sugar';

const reduceFontStyleNesting = (block: Element, node: Element): void => {
  const blockSugar = SugarElement.fromDom(block);
  const nodeSugar = SugarElement.fromDom(node);
  flattenFontSize(blockSugar, nodeSugar);
  mergeSameTypeElements(blockSugar, nodeSugar);
};

const flattenFontSize = (block: SugarElement, node: SugarElement, fontSize: string | null = null): void => {
  if (Compare.eq(block, node)) {
    return;
  }

  if (fontSize !== null) {
    Css.remove(node, 'font-size');
    Attribute.remove(node, 'data-mce-style');
  } else {
    fontSize = Css.getRaw(node, 'font-size').getOr(null);
  }

  Traverse.parentElement(node).each((parent) => flattenFontSize(block, parent, fontSize));
};

const mergeSameTypeElements = (block: SugarElement, node: SugarElement): void => {
  if (Compare.eq(block, node)) {
    return;
  }

  Traverse.parentElement(node).each((parent) => {
    if (Compare.eq(parent, block)) {
      return;
    }

    Traverse.parentElement(parent).each((grandparent) => {
      if (Attribute.hasNone(parent) && SugarNode.name(parent) === SugarNode.name(node)) {
        Remove.unwrap(parent);
        mergeSameTypeElements(block, grandparent);
        return;
      }
      mergeSameTypeElements(block, parent);
    });
  });
};

export {
  reduceFontStyleNesting
};
