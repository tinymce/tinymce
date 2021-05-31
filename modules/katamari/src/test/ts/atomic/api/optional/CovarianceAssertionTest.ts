import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';

interface Animal {
  name: string;
}

interface Cat extends Animal {
  length: number;
}

// Sorry for the maths, but really there's a large body of literature working
// to describe exactly the problem that we're interested in here - and it all
// comes from maths. There's no advantage in not leaning on that existing work.
//
// In particular, we're looking here:
// https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
//
// We need to make sure that Optional<T> is, and remains, covariant with
// respect to T.
describe('atomic.katamari.api.optional.CovarianceAssertionTest', () => {
  it('is covariant', () => {
    const cat: Cat = { name: 'Loki', length: 5 };
    const optCat: Optional<Cat> = Optional.some(cat);
    const optAnimal: Optional<Animal> = optCat;

    // This assertion is just so that we can avoid the "unused variables" warnings
    // This test is more about making sure that the above code compiles
    assert.isTrue(Optionals.equals<Animal>(optCat, optAnimal));
  });
});
