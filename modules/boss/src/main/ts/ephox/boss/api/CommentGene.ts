import { Gene } from './Gene';

export const CommentGene = function (id: string, text: string): Gene {
  return Gene(id, 'COMMENT_GENE', [], {}, {}, text);
};
