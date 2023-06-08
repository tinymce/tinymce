import { Arr, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';

import * as Identifiers from './Identifiers';

interface AccordionChildren {
  summaryNode: AstNode | undefined;
  wrapperNode: AstNode | undefined;
  otherNodes: AstNode[];
}

const getClassList = (node: AstNode): string[] =>
  node.attr('class')?.split(' ') ?? [];

const addClasses = (node: AstNode, classes: string[]): void => {
  const classListSet = new Set([ ...getClassList(node), ...classes ]);
  const newClassList = Array.from(classListSet);

  if (newClassList.length > 0) {
    node.attr('class', newClassList.join(' '));
  }
};

const removeClasses = (node: AstNode, classes: Set<string>): void => {
  const newClassList = Arr.filter(getClassList(node), (clazz) => !classes.has(clazz));
  node.attr('class', newClassList.length > 0 ? newClassList.join(' ') : null);
};

const isAccordionDetailsNode = (node: AstNode): boolean =>
  node.name === Identifiers.accordionTag && Arr.contains(getClassList(node), Identifiers.accordionDetailsClass);

const isAccordionBodyWrapperNode = (node: AstNode): boolean =>
  node.name === Identifiers.accordionBodyWrapperTag && Arr.contains(getClassList(node), Identifiers.accordionBodyWrapperClass);

const createAccordionBodyWrapperNode = (): AstNode => {
  const wrapperNode = new AstNode('div', 1);
  addClasses(wrapperNode, [ Identifiers.accordionBodyWrapperClass ]);
  return wrapperNode;
};

const getAccordionChildren = (accordionNode: AstNode): AccordionChildren => {
  const children = accordionNode.children();
  let summaryNode: AstNode | undefined;
  let wrapperNode: AstNode | undefined;
  const otherNodes: AstNode[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // Only want to get the first summary element
    if (child.name === 'summary' && Type.isNullable(summaryNode)) {
      summaryNode = child;
      // TODO: Need to safely handle if there are more than one wrapper node
    } else if (isAccordionBodyWrapperNode(child) && Type.isNullable(wrapperNode)) {
      wrapperNode = child;
    } else {
      otherNodes.push(child);
    }
  }

  return {
    summaryNode,
    wrapperNode,
    otherNodes
  };
};

// TODO: Look at allowing headers inside a summary
const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    const { serializer, parser } = editor;

    // Purpose:
    // - add mce-accordion-summary class to summary node
    // - wrap details body in div and add mce-accordion-body class (TINY-9959 assists with Chrome selection issue)
    parser.addNodeFilter(Identifiers.accordionTag, (nodes) => {
      // Using a traditional for loop here as we may have to iterate over many nodes and it is the most performant way of doing so
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isAccordionDetailsNode(node)) {
          const accordionNode = node;
          const { summaryNode, wrapperNode, otherNodes } = getAccordionChildren(accordionNode);

          if (Type.isNonNullable(summaryNode)) {
            addClasses(summaryNode, [ Identifiers.accordionSummaryClass ]);
          }

          const wrapperDivNode = Type.isNonNullable(wrapperNode) ? wrapperNode : createAccordionBodyWrapperNode();
          if (otherNodes.length > 0) {
            // const wrapperDivNode = new AstNode('div', 1);
            for (let j = 0; j < otherNodes.length; j++) {
              const otherNode = otherNodes[j];
              wrapperDivNode.append(otherNode);
            }
            accordionNode.append(wrapperDivNode);
          }
        }
      }
    });

    // Purpose:
    // - remove div wrapping details content
    // - remove mce-accordion-summary class on the summary node
    serializer.addNodeFilter(Identifiers.accordionTag, (nodes) => {
      const summaryClassRemoveSet = new Set([ Identifiers.accordionSummaryClass ]);
      // Using a traditional for loop here as we may have to iterate over many nodes and it is the most performant way of doing so
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isAccordionDetailsNode(node)) {
          const accordionNode = node;
          const { summaryNode, wrapperNode } = getAccordionChildren(accordionNode);

          if (Type.isNonNullable(summaryNode)) {
            removeClasses(summaryNode, summaryClassRemoveSet);
          }

          if (Type.isNonNullable(wrapperNode)) {
            wrapperNode.unwrap();
          }
        }
      }
    });
  });
};

export {
  setup
};
