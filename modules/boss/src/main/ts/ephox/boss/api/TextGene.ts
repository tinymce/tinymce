import { Gene } from './Gene';

export const TextGene = function (id: string, text: string): Gene {
  return Gene(id, 'TEXT_GENE', [], {}, {}, text);
};
