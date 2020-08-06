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

import ky from 'ky-universal';

import { Enum } from './enums';
import DummyFlow from './oauth/DummyFlow';
import OAuth from './oauth/OAuth';
import OAuthToken from './oauth/OAuthToken';
import GeoResourceProxy from './proxy/GeoResourceProxy';
import ResourceProxy from './proxy/ResourceProxy';
import SimpleResourceProxy from './proxy/SimpleResourceProxy';
import {
  Choropleth,
  Color,
  Contract,
  Dimension,
  DimensionSet,
  Faq,
  Feature,
  Font,
  FontFamily,
  Highlight,
  InsetMap,
  Job,
  JobShare,
  JobType,
  Language,
  Layer,
  Mapstyle,
  MapstyleSet,
  Notification,
  Organisation,
  Permission,
  Role,
  Svg,
  SvgSet,
  Tag,
  TagType,
  User,
  VectorHighlight,
  VectorChoropleth,
} from './resources';
import ResourceBase from './resources/base/ResourceBase';
import Injectable from './traits/Injectable';
import { fnv32b } from './utils/hash';
import Logger from './utils/Logger';
import { isParentOf, mix } from './utils/reflection';
import { delay, makeCancelable, wrapKyCancelable } from './utils/helpers';
import ValidationError from './errors/ValidationError';
import ApiError from './errors/ApiError';
import { wrapKyPrefixUrl } from './utils/requests';

/**
 * Base API class
 *
 * @mixes Injectable
 */
export default class Maps4News extends mix(null, Injectable) {
  /**
   * @param {OAuth|string} auth - Authentication flow
   * @param {string} host - Remote API host
   */
  constructor (auth = new DummyFlow(), host = process.env.HOST) {
    super();

    if (typeof auth === 'string') {
      const token = auth;

      auth = new DummyFlow();

      auth.token = new OAuthToken(token, 'Bearer', new Date('2100-01-01T01:00:00'), ['*']);
    }

    this.auth = auth;
    this.host = host;
    this.autoLogout = true;

    this._logger = new Logger(process.env.LOG_LEVEL);
  }

  /**
   * Get api version
   * @returns {string} - Api version
   * @constant
   */
  get version () {
    return 'v1';
  }

  /**
   * Get authentication provider instance
   * @returns {OAuth} - OAuth instance
   */
  get auth () {
    return this._auth;
  }

  /**
   * Get logger instance
   * @returns {Logger} - Logger instance
   */
  get logger () {
    return this._logger;
  }

  /**
   * Set authentication provider instance
   * @param {OAuth} value -- OAuth instance
   */
  set auth (value) {
    if (!isParentOf(OAuth, value)) {
      throw new TypeError('auth must be an instance of OAuth');
    }

    this._auth = value;
  }

  /**
   * Test if the client is authenticated with the api and has a valid token
   * @returns {boolean} - If the client is authenticated with the api
   */
  get authenticated () {
    return this.auth.authenticated;
  }

  /**
   * The current host
   * @returns {string} - The current host
   */
  get host () {
    return this._host;
  }

  /**
   * The remote host
   * @param {string} value - A valid url
   */
  set host (value) {
    value = value.replace(/\/+$/, '');
    this._host = value;
    this.auth.host = value;
  }

  /**
   * Saves the session token so that it can be recovered at a later time. The wrapper can
   * find the token most of the time if the name parameter is left blank.
   * @param {string?} name - name of the token
   */
  saveToken (name) {
    this.auth.token.save(name);
  }

  /**
   * Authenticate with the api using the authentication method provided.
   * @returns {Promise<Maps4News>} - current instance
   * @throws {OAuthError}
   * @throws {ApiError}
   */
  async authenticate () {
    await this.auth.authenticate();

    return this;
  }

  get ky () {
    if (this._ky) {
      return this._ky;
    }

    const hooks = {
      afterResponse: [
        // 429 response
        async (request, _options, response) => {
          if (response.status !== 429) {
            return response;
          }

          const resetDelay = (response.headers.get('x-ratelimit-reset') * 1000) || 500;

          await delay(resetDelay);

          return this._ky(request);
        },
        // transform errors
        async (request, options, response) => {
          if (response.status < 400 || response.status >= 600) {
            return response;
          }

          const data = await response.json();
          const params = { data, request, options, response };

          if (data.error['validation_errors']) {
            throw new ValidationError(params);
          }

          throw new ApiError(params);
        },
      ],
    };

    this._ky = ky.create({
      timeout: 30000, // 30 seconds
      // throwHttpErrors: false, // This is done through a custom hook
      // redirect: 'error',
      retry: 0,
      headers: {
        'Accept': 'application/json',
        'X-No-CDN-Redirect': 'true',
        'Authorization': this.auth.token.toString(),
      },
      hooks,
    });

    this._ky = wrapKyCancelable(this._ky);
    this._ky = wrapKyPrefixUrl(this._ky, `${this.host}/${this.version}`);

    const requestMethods = [
      'get', 'post', 'put',
      'patch', 'head', 'delete',
    ];

    for (const method of requestMethods) {
      this._ky[method] = (input, options) => this._ky(input, { ...options, method });
    }

    return this._ky;
  }

  /**
   * Static proxy generation
   * @param {string|function} Target - Constructor or url
   * @param {function?} Constructor - Constructor for a resource that the results should be cast to
   * @returns {ResourceProxy} - A proxy for accessing the resource
   * @example
   * api.static('/custom/resource/path/{id}/').get(123);
   *
   * @example
   * class FooBar extends ResourceBase {
   *    static get resourceName() {
   *      return 'custom';
   *    }
   * }
   *
   * api.static(FooBar)
   *   .get(1)
   *   .then(console.log);
   *
   * api.static('/foo-bar-custom', FooBar).lister();
   */
  static (Target, Constructor = ResourceBase) {
    if (typeof Target === 'string') {
      const path = Target;
      const name = Constructor.name || 'AnonymousResource';

      Target = class AnonymousResource extends Constructor {
        static get resourceName () {
          return Object.getPrototypeOf(this).resourceName || 'anonymous';
        }

        static get resourcePath () {
          return path;
        }
      };

      Object.defineProperty(Target, 'name', {
        value: `${name}_${fnv32b(path)}`,
      });
    }

    if (isParentOf(ResourceBase, Target)) {
      return new ResourceProxy(this, Target);
    }

    throw new TypeError('Expected Target to be of type string and Constructor to be a ResourceBase constructor');
  }

  /**
   * Choropleth accessor
   * @see {@link Choropleth}
   * @returns {GeoResourceProxy} - A proxy for accessing the resource
   */
  get choropleths () {
    return new GeoResourceProxy(this, Choropleth);
  }

  /**
   * VectorChoropleth accessor
   * @see {@link VectorChoropleth}
   * @returns {GeoResourceProxy} - A proxy for accessing the resource
   */
  get vectorChoropleths () {
    return new GeoResourceProxy(this, VectorChoropleth);
  }

  /**
   * Color accessor
   * @see {@link Color}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get colors () {
    return this.static(Color);
  }

  /**
   * Tag accessor
   * @see {@link Tag}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get tags () {
    return this.static(Tag);
  }

  /**
   * Tag accessor
   * @see {@link Tag}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get tagTypes () {
    return this.static(TagType);
  }

  /**
   * Contract accessor
   * @see {@link Contract}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get contracts () {
    return this.static(Contract);
  }

  /**
   * Dimension accessor
   * @see {@link Dimension}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get dimensions () {
    return this.static(Dimension);
  }

  /**
   * Dimension set accessor
   * @see {@link DimensionSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets () {
    return this.static(DimensionSet);
  }

  /**
   * Faq accessor
   * @see {@link Faq}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get faqs () {
    return this.static(Faq);
  }

  /**
   * Feature accessor
   * @see {@link Feature}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get features () {
    return this.static(Feature);
  }

  /**
   * Featured jobs accessor
   * @see {@link Job}
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get featuredMaps () {
    return new SimpleResourceProxy(this, Job, '/jobs/featured');
  }

  /**
   * Font accessor
   * @see {@link Font}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get fonts () {
    return this.static(Font);
  }

  /**
   * FontFamily accessor
   * @see {@link FontFamily}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies () {
    return this.static(FontFamily);
  }

  /**
   * Highlight accessor
   * @see {@link Highlight}
   * @returns {GeoResourceProxy} - A proxy for accessing the resource
   */
  get highlights () {
    return new GeoResourceProxy(this, Highlight);
  }

  /**
   * VectorHighlight accessor
   * @see {@link VectorHighlight}
   * @returns {GeoResourceProxy} - A proxy for accessing the resource
   */
  get vectorHighlights () {
    return new GeoResourceProxy(this, VectorHighlight);
  }

  /**
   * InsetMap accessor
   * @see {@link InsetMap}
   * @returns {GeoResourceProxy} - A proxy for accessing the resource
   */
  get insetMaps () {
    return new GeoResourceProxy(this, InsetMap);
  }

  /**
   * Job accessor
   * @see {@link Job}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobs () {
    return this.static(Job);
  }

  /**
   * JobShare accessor
   * @see {@link JobShare}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobShares () {
    return this.static(JobShare);
  }

  /**
   * JobType accessor
   * @see {@link JobType}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes () {
    return this.static(JobType);
  }

  /**
   * Language accessor
   * @see {@link Language}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get languages () {
    return this.static(Language);
  }

  /**
   * Layer accessor
   * @see {@link Layer}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get layers () {
    return this.static(Layer);
  }

  /**
   * Mapstyle accessor
   * @see {@link Mapstyle}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get mapstyles () {
    return this.static(Mapstyle);
  }

  /**
   * MapstyleSet accessor
   * @see {@link MapstyleSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets () {
    return this.static(MapstyleSet);
  }

  /**
   * Notification accessor
   * @see {@link Notification}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get notifications () {
    return this.static(Notification);
  }

  /**
   * Organisation accessor
   * @see {@link Organisation}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get organisations () {
    return this.static(Organisation);
  }

  /**
   * Permission accessor
   * @see {@link Permission}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get permissions () {
    return this.static(Permission);
  }

  /**
   * Role accessor
   * @see {@link Role}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get roles () {
    return this.static(Role);
  }

  /**
   * Svg accessor
   * @see {@link Svg}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get svgs () {
    return this.static(Svg);
  }

  /**
   * SvgSet accessor
   * @see {@link SvgSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get svgSets () {
    return this.static(SvgSet);
  }

  /**
   * User accessor
   * @see {@link User}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get users () {
    return this.static(User);
  }

  /**
   * Get SVG set types
   * @see {@link SvgSet}
   * @returns {Promise<Enum>} - Contains all the possible SVG set types
   * @throws {ApiError}
   * @async
   */
  getSvgSetTypes () {
    return makeCancelable(async signal => {
      const { data } = await this.ky.get('svgs/sets/types', { signal }).json();

      return new Enum(data, true);
    });
  }

  /**
   * Get font styles
   * @see {@link Font}
   * @returns {Promise<Enum>} - Contains all the possible font styles
   * @throws {ApiError}
   * @async
   */
  getFontStyles () {
    return makeCancelable(async signal => {
      const { data } = await this.ky.get('fonts/styles', { signal }).json();

      return new Enum(data, true);
    });
  }

  /**
   * Forget the current session
   * This will clean up any stored OAuth states stored using {@link StateContainer} and any OAuth tokens stored
   * @async
   */
  logout () {
    return this.auth.logout();
  }

  /**
   * Get if the api should automatically call logout when it counters an AuthenticationException
   * @returns {boolean} - Auto logout
   * @see {@link logout}
   */
  get autoLogout () {
    return this._autoLogout;
  }

  /**
   * Set if the api should automatically call logout when it counters an AuthenticationException
   * @param {boolean} value - Auto logout
   * @see {@link logout}
   */
  set autoLogout (value) {
    this._autoLogout = Boolean(value);
  }
}
