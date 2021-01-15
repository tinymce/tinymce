import { Gene } from './Gene';

export const SpecialGene = (id: string, children: Gene[]): Gene =>
  Gene(id, 'SPECIAL_GENE', children, {}, {});