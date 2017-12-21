import Styles from '../layout/Styles';
import { Fun } from '@ephox/katamari';

var south = Styles.resolve('caret-top-align');
var north = Styles.resolve('caret-bottom-align');
var west = Styles.resolve('caret-right-align');
var east = Styles.resolve('caret-left-align');
var middle = Styles.resolve('caret-middle-align');

export default <any> {
  east: Fun.constant(east),
  south: Fun.constant(south),
  west: Fun.constant(west),
  north: Fun.constant(north),
  middle: Fun.constant(middle),
  all: Fun.constant([ south, north, east, west, middle ])
};