import AstNode from '../api/html/Node';

const isHeading = (node: AstNode): boolean => [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ].includes(node.name);

const isSummary = (node: AstNode): boolean => node.name === 'summary';

export {
  isHeading,
  isSummary
};
