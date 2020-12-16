import { Gene } from './Gene';

export const TextGene = (id: string, text: string): Gene => {
  return Gene(id, 'TEXT_GENE', [], {}, {}, text);
};
