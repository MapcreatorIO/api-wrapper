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

export Choropleth from './Choropleth';
export Color from './Color';
export Contract from './Contract';
export Dimension from './Dimension';
export DimensionSet from './DimensionSet';
export Domain from './Domain';
export Faq from './Faq';
export Feature from './Feature';
export Font from './Font';
export FontFamily from './FontFamily';
export Highlight from './Highlight';
export InsetMap from './InsetMap';
export Job from './Job';
export JobMonitorRow from './JobMonitorRow';
export JobResult from './JobResult';
export JobRevision from './JobRevision';
export JobShare from './JobShare';
export JobType from './JobType';
export Language from './Language';
export Layer from './Layer';
export Mapstyle from './Mapstyle';
export MapstyleSet from './MapstyleSet';
export Notification from './Notification';
export Organisation from './Organisation';
export Permission from './Permission';
export PlaceName from './PlaceName';
export Role from './Role';
export Svg from './Svg';
export SvgSet from './SvgSet';
export Tag from './Tag';
export User from './User';

import CrudBase from './base/CrudBase';
import CrudSetBase from './base/CrudSetBase';
import ResourceBase from './base/ResourceBase';

/**
 * @private
 */
export const base = {
  CrudBase, CrudSetBase, ResourceBase,
};
