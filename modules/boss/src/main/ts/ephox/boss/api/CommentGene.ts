import { Gene } from './Gene';

export const CommentGene = function (id: string, text: string) {
  return Gene(id, 'COMMENT_GENE', [], {}, {}, text);
};
