import { Arr, Optionals } from '@ephox/katamari';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Options from '../api/Options';

const preventSummaryToggle = (editor: Editor): void => {
  editor.on('click', (e) => {
    if (editor.dom.getParent(e.target, 'details')) {
      e.preventDefault();
    }
  });
};

const isHeading = (node: AstNode) => [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ].includes(node.name);

// If the `summary` element contains multiple heading elements,
// merge their contents into the first heading element.
const handleSummaryHeadings = (details: AstNode) =>
  Arr.findMap(details.children(), (node: AstNode) => Optionals.someIf(node.name === 'summary', node))
    .each((summary) => {
      if (summary.firstChild && isHeading(summary.firstChild) && summary.children().length > 1) {
        const h = summary.firstChild;
        for (let node = h.next; node;) {
          const next = node.next;
          h.append(node);
          node = next;
        }
      }
    });

const filterDetails = (editor: Editor): void => {
  editor.parser.addNodeFilter('details', (elms) => {
    const initialStateOption = Options.getDetailsInitialState(editor);
    Arr.each(elms, (details) => {
      if (initialStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (initialStateOption === 'collapsed') {
        details.attr('open', null);
      }
      handleSummaryHeadings(details);
    });
  });

  editor.serializer.addNodeFilter('details', (elms) => {
    const serializedStateOption = Options.getDetailsSerializedState(editor);
    Arr.each(elms, (details) => {
      if (serializedStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (serializedStateOption === 'collapsed') {
        details.attr('open', null);
      }
    });
  });
};

export const setup = (editor: Editor): void => {
  preventSummaryToggle(editor);
  filterDetails(editor);
};
