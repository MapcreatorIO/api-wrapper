/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
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

import test from 'ava';
import {startWebserver, stopWebserver} from '../util';
import Uuid from '../../../src/utils/uuid';
import {fetch} from '../../../src/utils/requests';

const Maps4News = require('../../../src/Maps4News').default;

let port = 0;
let api = new Maps4News(undefined, 'http://localhost');

test.before('start webserver', () => {
  port = startWebserver('tests/scripts/crud/public');
  api.host = 'http://localhost:' + port;
});

test('crud can create resources', t => {
  const CrudBase = require('../../../src/crud/base/CrudBase').default;

  class DummyResource extends CrudBase {
    get resourceName() {
      if (!this.constructor._resourceName) {
        this.constructor._resourceName = Uuid.uuid4().split('-')[0];
      }

      return this.constructor._resourceName;
    }
  }

  t.plan(7);
  t.log(`Using resource "${(new DummyResource(api)).resourceName}"`);

  let resource = api.static(DummyResource).new({
    name: Uuid.uuid4(),
    description: Uuid.uuid4().repeat(3),
  });

  return resource.save()
    .then(r => {
      resource = r;

      t.log(JSON.stringify(resource.toObject()));
      t.is(typeof resource.id, 'number');
      t.is(resource.createdAt.constructor.name, 'Date');
      t.is(resource.id, 0); // Should be the 1st resource

      return api.static(DummyResource).get(resource.id);
    })
    .then(r => {
      t.is(r.id, resource.id);
      t.is(r.name, resource.name);
      t.is(r.description, resource.description);

      t.is(r.createdAt.constructor.name, 'Date');
      t.is(r.updatedAt, null);
    });
});

test.after.always('shutdown webserver', () => {
  stopWebserver(port);
});
