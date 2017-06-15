// Core
export {default as Maps4News} from './Maps4News';

// Flows
export {default as OAuth} from './oauth/OAuth';
export {default as ImplicitFlow} from './oauth/ImplicitFlow';
export {default as ImplicitFlowPopup} from './oauth/ImplicitFlowPopup';
export {default as PasswordFlow} from './oauth/PasswordFlow';
export {default as DummyFlow} from './oauth/DummyFlow';

// Exceptions
export {default as ApiError} from './exceptions/ApiError';
export {AbstractError, AbstractClassError, AbstractMethodError} from './exceptions/AbstractError';
export {default as ValidationError} from './exceptions/ValidationError';
export {default as StaticClassError} from './exceptions/StaticClassError';

// Resources
import * as _resources from './crud/index';

/**
 * Resource export. Set to private in jsdoc to make sure
 * it doesn't show up as a useless doc page in the docs.
 * @type {object<string, ResourceBase>} resources
 * @private
 */
export const resources = _resources;
