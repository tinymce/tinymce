import { Struct } from '@ephox/katamari';

export interface Focus<E> {
  left(): any; // TODO narrow types
  element(): E;
  right(): any;
}
type FocusConstructor = <E>(left: any, element: E, right: any) => Focus<E>;

export const Focus = <FocusConstructor>Struct.immutable('left', 'element', 'right');