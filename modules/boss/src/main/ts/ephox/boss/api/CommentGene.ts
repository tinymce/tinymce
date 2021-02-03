import { GeneTypes } from '../mutant/Properties';
import { Gene } from './Gene';

export const CommentGene = (id: string, text: string): Gene => {
  return Gene(id, GeneTypes.Comment, [], {}, {}, text);
};
