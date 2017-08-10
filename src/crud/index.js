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

export Choropleth from './Choropleth.js';
export Color from './Color.js';
export Contract from './Contract.js';
export Dimension from './Dimension.js';
export DimensionSet from './DimensionSet.js';
export Faq from './Faq.js';
export Feature from './Feature.js';
export Font from './Font.js';
export FontFamily from './FontFamily.js';
export Highlight from './Highlight.js';
export InsetMap from './InsetMap.js';
export Job from './Job.js';
export JobResult from './JobResult.js';
export JobRevision from './JobRevision.js';
export JobShare from './JobShare.js';
export JobType from './JobType.js';
export Language from './Language.js';
export Layer from './Layer.js';
export Mapstyle from './Mapstyle.js';
export MapstyleSet from './MapstyleSet.js';
export Notification from './Notification.js';
export Organisation from './Organisation.js';
export Permission from './Permission.js';
export PlaceName from './PlaceName.js';
export Svg from './Svg.js';
export SvgSet from './SvgSet.js';
export SvgSetType from './SvgSetType.js';
export User from './User.js';

import CrudBase from './base/CrudBase';
import CrudSetBase from './base/CrudSetBase';
import ResourceBase from './base/ResourceBase';

export const base = {
  CrudBase, CrudSetBase, ResourceBase,
};
