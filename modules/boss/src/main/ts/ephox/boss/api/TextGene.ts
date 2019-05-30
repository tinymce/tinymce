import { Gene } from './Gene';

export const TextGene = function (id: string, text: string) {
  return Gene(id, 'TEXT_GENE', [], {}, {}, text);
};