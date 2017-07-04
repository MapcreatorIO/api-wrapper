// Core
export Maps4News from './Maps4News';

// Flows
export OAuth from './oauth/OAuth';
export ImplicitFlow from './oauth/ImplicitFlow';
export ImplicitFlowPopup from './oauth/ImplicitFlowPopup';
export PasswordFlow from './oauth/PasswordFlow';
export DummyFlow from './oauth/DummyFlow';

// Exceptions
export ApiError from './exceptions/ApiError';
export * from './exceptions/AbstractError';
export ValidationError from './exceptions/ValidationError';
export StaticClassError from './exceptions/StaticClassError';

// Resources
export * as resources from './crud';

/**
 * Package version
 * @private
 */
export const version = VERSION;
