/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
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

import StateContainer from '../../../src/oauth/StateContainer';

beforeAll(() => {
  StateContainer.clean();

  expect(StateContainer.list()).toEqual({});
});

// We can just test everything in here
test('StateContainer validates tokens', () => {
  const token = StateContainer.generate();

  expect(StateContainer.validate(token, false)).toEqual(true); // Token shouldn't be purged
  expect(StateContainer.validate(token)).toEqual(true); // Token should be purged
  expect(StateContainer.validate(token)).toEqual(false); // Token should not be found anymore
});

test('StateContainer should list all keys', () => {
  const tokens = [];

  for (let i = 0; i < 100; i++) {
    tokens.push(StateContainer.generate());
  }

  // This array should contain all unmatched tokens
  const out = Object
    .keys(StateContainer.list())
    .filter(x => !tokens.includes(x));

  expect(out).toEqual([]);
});
