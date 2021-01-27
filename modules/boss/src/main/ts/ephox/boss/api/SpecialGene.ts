import { GeneTypes } from '../mutant/Properties';
import { Gene } from './Gene';

export const SpecialGene = (id: string, children: Gene[]): Gene =>
  Gene(id, GeneTypes.Special, children, {}, {});