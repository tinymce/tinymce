import { Id, Optional } from '@ephox/katamari';

export interface DragImageData {
  readonly image: Element;
  readonly x: number;
  readonly y: number;
}

const imageId = Id.generate('image');

const getDragImage = (transfer: DataTransfer): Optional<DragImageData> => {
  const dt: Record<string, any> = transfer;
  return Optional.from(dt[imageId]);
};

const setDragImage = (transfer: DataTransfer, imageData: DragImageData): void => {
  const dt: Record<string, any> = transfer;
  dt[imageId] = imageData;
};

export {
  getDragImage,
  setDragImage
};
