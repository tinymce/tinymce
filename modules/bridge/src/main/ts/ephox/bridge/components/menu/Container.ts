import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { ContainerItem } from '../../api/Menu';
import { titleSchema } from './Title';
import { ContainerItemSpec } from './CardMenuItem';
import { descriptionSchema } from './Description';
import { imageSchema } from './Image';

export interface ContainerSpec {
  type: 'container';
  direction?: 'vertical' | 'horizontal';
  items: ContainerItemSpec[];
}

export interface Container {
  type: 'container';
  direction: 'vertical' | 'horizontal';
  items: ContainerItem[];
}

export const itemSchema = ValueSchema.valueThunkOf(
  () => ValueSchema.chooseProcessor('type', {
    image: imageSchema,
    description: descriptionSchema,
    title: titleSchema,
    container: containerSchema
  })
);

export const containerSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedString('direction', 'horizontal'),
  FieldSchema.strictArrayOf('items', itemSchema)
]);

export const createContainer = (spec: ContainerSpec): Result<Container, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Container>('container', containerSchema, spec);
