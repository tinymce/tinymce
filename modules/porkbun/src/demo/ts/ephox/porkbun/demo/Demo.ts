import * as Outlaw from 'ephox/porkbun/demo/Outlaw';
import * as Saloon from 'ephox/porkbun/demo/Saloon';
import * as Sheriff from 'ephox/porkbun/demo/Sheriff';

declare const $: any;

const saloon = Saloon.create();

const sheriff = Sheriff.create();

sheriff.watch(saloon);

const fred = Outlaw.create('Fred');
const barney = Outlaw.create('Barney');

fred.addAction('Shoot Barney', function () {
  fred.shoot(barney);
});

barney.addAction('Shoot Fred', function () {
  barney.shoot(fred);
});

fred.enter(saloon);
barney.enter(saloon);

$('body').append(sheriff.getElement());
$('body').append(saloon.getElement());
