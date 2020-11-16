import { CardContainer, CardContainerSpec } from './CardContainer';
import { CardImage, CardImageSpec } from './CardImage';
import { CardText, CardTextSpec } from './CardText';

export type CardItemSpec =
  CardContainerSpec |
  CardImageSpec |
  CardTextSpec;

export type CardItem =
  CardContainer |
  CardImage |
  CardText;