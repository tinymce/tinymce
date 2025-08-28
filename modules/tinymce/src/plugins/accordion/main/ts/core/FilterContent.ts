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

const padInputNode = (node: AstNode): void => {
  // Add br to node to ensure the cursor can be placed inside the node
  // Mark as bogus so that it is converted to an nbsp on serialization
  const br = new AstNode('br', 1);
  br.attr('data-mce-bogus', '1');
  node.empty();
  node.append(br);
};

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

          const hasSummaryNode = Type.isNonNullable(summaryNode);
          const newSummaryNode = hasSummaryNode ? summaryNode : new AstNode('summary', 1);
          // If there is nothing in the summary, pad it with a br
          // so the cursor can be put inside the accordion summary
          if (Type.isNullable(newSummaryNode.firstChild)) {
            padInputNode(newSummaryNode);
          }
          addClasses(newSummaryNode, [ Identifiers.accordionSummaryClass ]);
          if (!hasSummaryNode) {
            if (Type.isNonNullable(accordionNode.firstChild)) {
              accordionNode.insert(newSummaryNode, accordionNode.firstChild, true);
            } else {
              accordionNode.append(newSummaryNode);
            }
          }

          const hasWrapperNode = Type.isNonNullable(wrapperNode);
          const newWrapperNode = hasWrapperNode ? wrapperNode : new AstNode(Identifiers.accordionBodyWrapperTag, 1);
          newWrapperNode.attr('data-mce-bogus', '1');
          addClasses(newWrapperNode, [ Identifiers.accordionBodyWrapperClass ]);
          if (otherNodes.length > 0) {
            for (let j = 0; j < otherNodes.length; j++) {
              const otherNode = otherNodes[j];
              newWrapperNode.append(otherNode);
            }
          }
          // If there is nothing in the wrapper, append a placeholder p tag
          // so the cursor can be put inside the accordion body
          if (Type.isNullable(newWrapperNode.firstChild)) {
            const pNode = new AstNode('p', 1);
            padInputNode(pNode);
            newWrapperNode.append(pNode);
          }
          if (!hasWrapperNode) {
            accordionNode.append(newWrapperNode);
          }
        }
      }
    });

    // Purpose:
    // - remove div wrapping details content as it is only required during editor (see TINY-9959 for details)
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
