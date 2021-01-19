import { GeneTypes } from '../mutant/Properties';
import { Gene } from './Gene';

export const TextGene = (id: string, text: string): Gene => {
  return Gene(id, GeneTypes.Text, [], {}, {}, text);
};
