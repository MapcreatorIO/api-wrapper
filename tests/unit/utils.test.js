/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2018, MapCreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import Trait from '../../src/traits/Trait';
import {fnv32b, hashObject} from '../../src/utils/hash';
import {isNode} from '../../src/utils/node';
import {getTypeName, isParentOf, mix} from '../../src/utils/reflection';
import {encodeQueryString} from '../../src/utils/requests';
import Singleton from '../../src/utils/Singleton';
import StaticClass from '../../src/utils/StaticClass';
import Uuid from '../../src/utils/uuid';

test('fnv32b hashes properly', () => {
  expect(fnv32b('MapCreator')).toEqual('f6a48d4e');
});

test('objects are correctly hashed', () => {
  const obj1 = {c: 8, b: [{z: 6, y: 5, x: 4}, 7], a: 3};
  const obj2 = {a: 3, c: 8, b: [{z: 6, y: 5, x: 4}, 7]};

  expect(hashObject(obj1)).toEqual(hashObject(obj2));
});

test('nodejs is correctly detected', () => {
  expect(isNode()).toBeTruthy();
});

test('isParentOf correctly detects inheritance', () => {
  class A {
  }

  class B extends A {
  }

  class C extends B {
  }

  expect(isParentOf(A, C)).toBeTruthy();
  expect(isParentOf(A, B)).toBeTruthy();
  expect(isParentOf(B, C)).toBeTruthy();
  expect(isParentOf(C, C)).toBeTruthy();
  expect(isParentOf(B, A)).toBeFalsy();
  expect(isParentOf(C, A)).toBeFalsy();
  expect(isParentOf(C, B)).toBeFalsy();
});

test('getTypeName correctly returns the name', () => {
  class FooBar {
  }

  expect(getTypeName(FooBar)).toEqual('FooBar');
  expect(getTypeName(new FooBar())).toEqual('FooBar');
});

test('encodeQueryString works correctly', () => {
  const data = {
    foo: 'bar',
    beer: '🍻',
    obj: {hello: 'world!'},
    arr: [1, 2, 3, 4],
  };

  const query = 'arr[0]=1&arr[1]=2&arr[2]=3&arr[3]=4&beer=%F0%9F%8D%BB&foo=bar&obj[hello]=world!';

  expect(encodeQueryString(data)).toEqual(query);
});

test('singleton returns same instance', () => {
  class Foo extends Singleton {

  }

  expect(new Foo()).toEqual(new Foo());

  const foo = new Foo();

  foo.bar = Math.random();

  expect((new Foo()).bar).toEqual(foo.bar);
});


test('static class can\'t be Instantiated', () => {
  class Foo extends StaticClass {

  }

  expect(() => new Foo()).toThrow(Error);
});

test('uuid4 returns a new random uuid', () => {
  const iterations = 1000;
  const data = [];

  for (let i = 0; i < iterations; i++) {
    data.push(Uuid.uuid4());
  }

  const duplicates = data.reduce((out, id, i) => {
    if (data.findIndex(z => z === id) !== i) {
      out.push(id);
    }

    return out;
  }, []);

  expect(duplicates).toEqual([]);
});

test('uuid0 returns a null uuid', () => {
  expect(Uuid.nil()).toEqual('0000000-0000-0000-0000-000000000000');
});

test('Traits work correctly', () => {
  const uuid4 = Uuid.uuid4();

  class Foo extends Trait {
    foo() {
      return this.bar;
    }
  }

  class Bar extends Trait {
    initializer() {
      this._bar = uuid4;
    }

    get bar() {
      return this._bar;
    }
  }

  class Baz extends mix(Foo, Bar) {

  }

  const instance = new Baz();
  const cocktail = Object.getPrototypeOf(Baz);

  expect(instance.foo()).toEqual(uuid4);
  expect(cocktail.name).toEqual('Cocktail_5d296402');
});

test('Mixing can only be done with Traits', () => {
  class Foo {
  }

  class Bar {
  }

  class Baz extends Trait {
  }

  expect(() => mix(Foo, Bar)).toThrow(TypeError);
  expect(typeof mix(Foo, Baz)).toEqual('function');
});

test('getTypeName correctly gets the type name', () => {
  expect(getTypeName(Date)).toEqual('Date');
  expect(getTypeName(new Date())).toEqual('Date');
});
