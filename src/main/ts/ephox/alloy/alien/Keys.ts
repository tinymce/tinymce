import { Fun } from '@ephox/katamari';

export default {
  BACKSPACE: (): number[] => [8],
  TAB : (): number[] => [9],
  ENTER : (): number[] => [13],
  SHIFT : (): number[] => [16],
  CTRL : (): number[] => [17],
  ALT : (): number[] => [18],
  CAPSLOCK : (): number[] => [20],
  ESCAPE : (): number[] => [27],
  SPACE: (): number[] => [32],
  PAGEUP: (): number[] => [33],
  PAGEDOWN: (): number[] => [34],
  END: (): number[] => [35],
  HOME: (): number[] => [36],
  LEFT: (): number[] => [37],
  UP: (): number[] => [38],
  RIGHT: (): number[] => [39],
  DOWN: (): number[] => [40],
  INSERT: (): number[] => [45],
  DEL: (): number[] => [46],
  META: (): number[] => [91, 93, 224],
  F10: (): number[] => [121]
};