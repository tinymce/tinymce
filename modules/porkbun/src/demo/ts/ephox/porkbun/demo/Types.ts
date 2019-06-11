import { Bindable } from 'ephox/porkbun/Event';

export interface ShootEvent {
  target: () => any;
}

export interface DieEvent {
}

export interface Outlaw {
  getElement: () => any;
  addAction: (text: string, action: () => void) => void;
  events: {
    shoot: Bindable<ShootEvent>;
    die: Bindable<DieEvent>;
  };
  enter: (saloon: Saloon) => void;
  leave: () => void;
  shoot: (target: Outlaw) => void;
  die: () => void;
  chase: () => void;
}

export interface Saloon {
  getElement: () => any;
  events: {
    shooting: Bindable<ShootingEvent>;
  };
  enter: (patron: Outlaw) => void;
  leave: (patron: Outlaw) => void;
}

export interface ShootingEvent {
  shooter: () => Outlaw;
  target: () => Outlaw;
}

export interface Sherif {
  getElement: () => any;
  watch: (establishment: Saloon) => void;
}