import BasicPage from './BasicPage';
import { CommentGene } from './CommentGene';
import DomUniverse from './DomUniverse';
import { Gene } from './Gene';
import { TestUniverse } from './TestUniverse';
import { TextGene } from './TextGene';
import { Universe } from './Universe';

/* eslint-disable import/order */
// NON API USAGE
// used by phoenix
import * as Logger from '../mutant/Logger';
// used by soldier tests
import * as Locator from '../mutant/Locator';
/* eslint-enable import/order */

export {
  BasicPage,
  CommentGene,
  DomUniverse,
  Gene,
  TestUniverse,
  TextGene,
  Logger,
  Locator,
  Universe
};
