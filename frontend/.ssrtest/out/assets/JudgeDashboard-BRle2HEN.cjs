'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const index = require('./index-h4octwNp.cjs');
const index$1 = require('./index-BvX4B99v.cjs');
const fixtures$2 = require('./fixtures-BPyhxdhB.cjs');
require('./index-xm8RU7M2.cjs');

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=index.reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	var React = index.reactExports;

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var displayName = outerType.displayName;

	  if (displayName) {
	    return displayName;
	  }

	  var functionName = innerType.displayName || innerType.name || '';
	  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
	} // Keep in sync with react-reconciler/getComponentNameFromFiber


	function getContextName(type) {
	  return type.displayName || 'Context';
	} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


	function getComponentNameFromType(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case REACT_FRAGMENT_TYPE:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';

	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        var outerName = type.displayName || null;

	        if (outerName !== null) {
	          return outerName;
	        }

	        return getComponentNameFromType(type.type) || 'Memo';

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentNameFromType(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }

	      // eslint-disable-next-line no-fallthrough
	    }
	  }

	  return null;
	}

	var assign = Object.assign;

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: assign({}, props, {
	          value: prevLog
	        }),
	        info: assign({}, props, {
	          value: prevInfo
	        }),
	        warn: assign({}, props, {
	          value: prevWarn
	        }),
	        error: assign({}, props, {
	          value: prevError
	        }),
	        group: assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if ( !fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
	                // but we have a user-provided "displayName"
	                // splice it in to make the stack more readable.


	                if (fn.displayName && _frame.includes('<anonymous>')) {
	                  _frame = _frame.replace('<anonymous>', fn.displayName);
	                }

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            // eslint-disable-next-line react-internal/prod-error-codes
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

	function isArray(a) {
	  return isArrayImpl(a);
	}

	/*
	 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
	 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
	 *
	 * The functions in this module will throw an easier-to-understand,
	 * easier-to-debug exception with a clear errors message message explaining the
	 * problem. (Instead of a confusing exception thrown inside the implementation
	 * of the `value` object).
	 */
	// $FlowFixMe only called in DEV, so void return is not possible.
	function typeName(value) {
	  {
	    // toStringTag is needed for namespaced types like Temporal.Instant
	    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
	    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
	    return type;
	  }
	} // $FlowFixMe only called in DEV, so void return is not possible.


	function willCoercionThrow(value) {
	  {
	    try {
	      testStringCoercion(value);
	      return false;
	    } catch (e) {
	      return true;
	    }
	  }
	}

	function testStringCoercion(value) {
	  // If you ended up here by following an exception call stack, here's what's
	  // happened: you supplied an object or symbol value to React (as a prop, key,
	  // DOM attribute, CSS property, string ref, etc.) and when React tried to
	  // coerce it to a string using `'' + value`, an exception was thrown.
	  //
	  // The most common types that will cause this exception are `Symbol` instances
	  // and Temporal objects like `Temporal.Instant`. But any object that has a
	  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
	  // exception. (Library authors do this to prevent users from using built-in
	  // numeric operators like `+` or comparison operators like `>=` because custom
	  // methods are needed to perform accurate arithmetic or comparison.)
	  //
	  // To fix the problem, coerce this object or symbol value to a string before
	  // passing it to React. The most reliable way is usually `String(value)`.
	  //
	  // To find which value is throwing, check the browser or debugger console.
	  // Before this exception was thrown, there should be `console.error` output
	  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
	  // problem and how that type was used: key, atrribute, input value prop, etc.
	  // In most cases, this console output also shows the component and its
	  // ancestor components where the exception happened.
	  //
	  // eslint-disable-next-line react-internal/safe-string-coercion
	  return '' + value;
	}
	function checkKeyStringCoercion(value) {
	  {
	    if (willCoercionThrow(value)) {
	      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

	      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self) ;
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      {
	        checkKeyStringCoercion(maybeKey);
	      }

	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      {
	        checkKeyStringCoercion(config.key);
	      }

	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */


	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentNameFromType(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentNameFromType(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum();

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    if (type === REACT_FRAGMENT_TYPE) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_development.jsx = jsx;
	reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

// Stand-in for src/api/deliverables.js

let F$1 = null;
const fixtures$1 = async () => (F$1 ||= await fixtures$2.loadFixtures());

const getCompetitionSubmissions = async () => (await fixtures$1()).submissions;
const downloadFile = async () => {};
const downloadTeamZip = async () => {};

// Stand-in for src/api/judges.js, backed by the live API.

let F = null;
const fixtures = async () => (F ||= await fixtures$2.loadFixtures());

// Surface the real failure instead of the component's generic message.
const guarded = async (name, fn) => {
  try {
    const v = await fn();
    console.log(`  [mock] ${name} -> ${Array.isArray(v) ? `array[${v.length}]` : typeof v}`);
    return v
  } catch (err) {
    console.log(`  [mock] ${name} FAILED -> ${err && err.message}`);
    throw err
  }
};

const listMyAssignments = async () => (await guarded('/judges/my-assignments', () => fixtures().then(f => f.assignments)));
const getCriteria = async () => (await guarded('/judges/evaluations/criteria', () => fixtures().then(f => f.criteria)));
const getSubmittedTeams = async () => (await guarded('/judges/submitted-teams', () => fixtures().then(f => f.submittedTeams)));
const getJudgeAllSubmissions = async () => (await guarded('/judges/submissions', () => fixtures().then(f => f.submissions)));
const listMyEvaluations = async () => (await guarded('/judges/evaluations', () => fixtures().then(f => f.evaluations)));
const getCompetitionScores = async () => [];
const createMyEvaluation = async () => ({ id: 999 });
const addScore = async () => ({});
const clearEvaluation = async () => ({});

const FILE_ICONS = {
  '.docx': '📄',
  '.pdf': '📄',
  '.pptx': '📊',
  '.zip': '📦',
  '.mp4': '🎥',
  '.png': '🖼️',
  '.jpg': '🖼️',
  '.jpeg': '🖼️',
};

function getFileIcon(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || '📎'
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const statusStyles = {
  OPEN: "bg-slate-100 text-slate-700 border border-slate-200",
  SUBMITTED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  READY: "bg-green-100 text-green-700 border border-green-200",
  LOCKED: "bg-amber-100 text-amber-700 border border-amber-200",
  FINALIZED: "bg-violet-100 text-violet-700 border border-violet-200",
  NEED_REVISION: "bg-rose-100 text-rose-700 border border-rose-200"
};
const scoreFilters = [
  { key: "all", label: "All" },
  { key: "todo", label: "Not finished" },
  { key: "done", label: "Completed" },
  { key: "mine", label: "Assigned to me" }
];
const sortOptions = [
  { key: "todo", label: "Unscored first" },
  { key: "name", label: "Team name (A-Z)" },
  { key: "files", label: "Most files" }
];
function Chevron({ expanded }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      viewBox: "0 0 20 20",
      fill: "currentColor",
      "aria-hidden": "true",
      className: `h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          fillRule: "evenodd",
          d: "M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z",
          clipRule: "evenodd"
        }
      )
    }
  );
}
const toggleButtonClass = "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100";
const TONE_PALETTE = [
  { dot: "bg-indigo-500", name: "text-indigo-700", count: "text-indigo-500", rule: "bg-indigo-200" },
  { dot: "bg-emerald-500", name: "text-emerald-700", count: "text-emerald-600", rule: "bg-emerald-200" },
  { dot: "bg-amber-500", name: "text-amber-700", count: "text-amber-600", rule: "bg-amber-200" },
  { dot: "bg-sky-500", name: "text-sky-700", count: "text-sky-600", rule: "bg-sky-200" },
  { dot: "bg-rose-500", name: "text-rose-700", count: "text-rose-600", rule: "bg-rose-200" },
  { dot: "bg-violet-500", name: "text-violet-700", count: "text-violet-600", rule: "bg-violet-200" }
];
function JudgeDashboard() {
  const navigate = index$1.useNavigate();
  const urlComp = new URLSearchParams(window.location.search).get("comp") || "all";
  const [compId] = index.reactExports.useState(urlComp);
  const isAll = compId === "all";
  const [assignments, setAssignments] = index.reactExports.useState([]);
  const [submissions, setSubmissions] = index.reactExports.useState([]);
  const [submittedTeams, setSubmittedTeams] = index.reactExports.useState([]);
  const [criteria, setCriteria] = index.reactExports.useState([]);
  const [evaluations, setEvaluations] = index.reactExports.useState([]);
  const [scores, setScores] = index.reactExports.useState([]);
  const [loading, setLoading] = index.reactExports.useState(true);
  const [error, setError] = index.reactExports.useState("");
  const [activeTab, setActiveTab] = index.reactExports.useState("files");
  const [searchTeam, setSearchTeam] = index.reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = index.reactExports.useState("all");
  const [fileCategory, setFileCategory] = index.reactExports.useState("all");
  const [scoreFilter, setScoreFilter] = index.reactExports.useState("all");
  const [sortBy, setSortBy] = index.reactExports.useState("todo");
  const [showEmptySubmissions, setShowEmptySubmissions] = index.reactExports.useState(false);
  const [scoreCategory, setScoreCategory] = index.reactExports.useState("all");
  const [localScores, setLocalScores] = index.reactExports.useState({});
  const [notes, setNotes] = index.reactExports.useState({});
  const [showNotes, setShowNotes] = index.reactExports.useState({});
  const [scoreErrors, setScoreErrors] = index.reactExports.useState({});
  const [scoreStatus, setScoreStatus] = index.reactExports.useState({});
  const [collapsed, setCollapsed] = index.reactExports.useState({});
  const [showGuide, setShowGuide] = index.reactExports.useState(false);
  const [showFiles, setShowFiles] = index.reactExports.useState({});
  const [pendingFocus, setPendingFocus] = index.reactExports.useState(null);
  const scoreInputs = index.reactExports.useRef({});
  index.reactExports.useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [assignData, critData, teamData] = await Promise.all([
        listMyAssignments(),
        getCriteria(),
        getSubmittedTeams(isAll ? null : parseInt(compId, 10))
      ]);
      let subData, evalData, scoreData;
      if (isAll) {
        subData = await getJudgeAllSubmissions();
        evalData = await listMyEvaluations();
        scoreData = [];
      } else {
        [subData, evalData, scoreData] = await Promise.all([
          getCompetitionSubmissions(compId),
          listMyEvaluations(compId),
          getCompetitionScores(compId)
        ]);
      }
      setAssignments(assignData);
      setSubmissions(subData);
      setSubmittedTeams(teamData);
      setCriteria(critData);
      setEvaluations(evalData);
      setScores(scoreData);
      const initScores = {};
      const initNotes = {};
      for (const ev of evalData) {
        for (const sc of ev.scores || []) {
          const key = sc.criterion_id ? `${ev.team_id}-${sc.criterion_id}` : `${ev.team_id}-${sc.criterion}`;
          initScores[key] = sc.score;
          if (sc.comment) initNotes[key] = sc.comment;
        }
      }
      setLocalScores(initScores);
      setNotes(initNotes);
      if (isAll && evalData.length > 0) {
        setScores(computeMyScores(evalData));
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  const computeMyScores = (evalData) => {
    const computedScores = {};
    for (const ev of evalData) {
      const tid = String(ev.team_id);
      if (!computedScores[tid]) {
        computedScores[tid] = { team_id: ev.team_id, total_score: 0, criteria_scores: {}, num_judges: 1, max_possible: 0 };
      }
      const cs = computedScores[tid];
      for (const sc of ev.scores || []) {
        if (sc.criterion) {
          if (!cs.criteria_scores[sc.criterion]) cs.criteria_scores[sc.criterion] = { score: 0 };
          cs.criteria_scores[sc.criterion].score = sc.score;
          cs.total_score += sc.score;
        }
      }
    }
    return Object.values(computedScores);
  };
  const refreshScoresQuietly = async () => {
    try {
      const evalData = isAll ? await listMyEvaluations() : await listMyEvaluations(compId);
      setEvaluations(evalData);
      if (isAll) {
        setScores(evalData.length > 0 ? computeMyScores(evalData) : []);
      } else {
        const scoreData = await getCompetitionScores(compId);
        setScores(scoreData);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to refresh scores");
    }
  };
  const getEvaluationForTeam = (teamId) => {
    return evaluations.find((e) => e.team_id === parseInt(teamId));
  };
  const getScoreForTeam = (teamId) => {
    return scores.find((s) => s.team_id === parseInt(teamId));
  };
  const filesForTeam = (teamId, category = null) => {
    const teamSubs = submissions.filter((s) => s.team_id === parseInt(teamId));
    const scoped = category ? teamSubs.filter((s) => s.deliverable_category === category) : teamSubs;
    return scoped.reduce((n, s) => n + (s.files?.length || 0), 0);
  };
  const teamNameFor = (teamId) => {
    const entry = Object.entries(teams).find(([id]) => String(id) === String(teamId));
    return entry ? entry[1].name : `Team ${teamId}`;
  };
  const downloadTeamArchive = async (teamId, category = null) => {
    const available = filesForTeam(teamId, category);
    if (available === 0) {
      setError(
        category ? `${teamNameFor(teamId)} has no files in "${category}". Pick another deliverable category or ask the team to upload files.` : `${teamNameFor(teamId)} has not uploaded any files yet, so there is nothing to download.`
      );
      return;
    }
    try {
      await downloadTeamZip(teamId, category);
    } catch (err) {
      const msg = String(err.message || "");
      if (msg.toLowerCase().includes("no files found")) {
        setError(
          category ? `${teamNameFor(teamId)} has no downloadable files in "${category}".` : `${teamNameFor(teamId)} has no downloadable files.`
        );
        return;
      }
      setError(msg || "Could not download team files");
    }
  };
  const handleScoreSubmit = async (teamId, criterionId, score, comment, localKey) => {
    if (localKey) setScoreStatus((prev) => ({ ...prev, [localKey]: "saving" }));
    try {
      let evaluation = getEvaluationForTeam(teamId);
      if (!evaluation) {
        const teamSubmission = submissions.find((s) => s.team_id === parseInt(teamId));
        const teamCompId = teamSubmission?.competition_id || (isAll ? parseInt(teamSubmission?.competition_id) || 1 : compId);
        const evalResult = await createMyEvaluation(teamId, teamCompId);
        evaluation = { id: evalResult.id, team_id: teamId, scores: [] };
        setEvaluations((prev) => [...prev, evaluation]);
      }
      await addScore(evaluation.id, criterionId, score, comment);
      setLocalScores((prev) => ({ ...prev, [`${teamId}-${criterionId}`]: score }));
      if (localKey) {
        setScoreStatus((prev) => ({ ...prev, [localKey]: "saved" }));
        setTimeout(() => setScoreStatus((prev) => ({ ...prev, [localKey]: "" })), 2500);
      }
      await refreshScoresQuietly();
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to submit score";
      if (localKey) {
        setScoreErrors((prev) => ({ ...prev, [localKey]: msg }));
        setScoreStatus((prev) => ({ ...prev, [localKey]: "" }));
        const saved = getEvaluationForTeam(teamId)?.scores?.find((s) => s.criterion_id === criterionId)?.score;
        setLocalScores((prev) => ({ ...prev, [`${teamId}-${criterionId}`]: saved !== void 0 ? saved : "" }));
      } else {
        setError(msg);
      }
      return false;
    }
  };
  const handleClearEvaluation = async (evaluation) => {
    if (!evaluation || !window.confirm("Clear this evaluation and all saved scores for this team?")) return;
    try {
      await clearEvaluation(evaluation.id);
      setLocalScores((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${evaluation.team_id}-`)) delete next[key];
        }
        return next;
      });
      setNotes({});
      await refreshScoresQuietly();
    } catch (err) {
      if (err.response?.status === 404) {
        await refreshScoresQuietly();
        return;
      }
      setError(err.response?.data?.detail || "Failed to clear evaluation");
    }
  };
  const applyScore = async (teamId, criterion, localKey) => {
    const raw = localScores[localKey];
    if (raw === "" || raw === void 0 || raw === null) return;
    const val = parseInt(String(raw), 10);
    if (Number.isNaN(val) || val < 1 || val > criterion.weight) return;
    const alreadySaved = savedScoreFor(teamId, criterion);
    const saved = await handleScoreSubmit(teamId, criterion.id, val, notes[localKey] || "", localKey);
    if (saved && alreadySaved !== val) advanceAfterTeamDone(localKey);
  };
  const commitScore = (teamId, criterion, localKey) => {
    const raw = String(localScores[localKey] ?? "").trim();
    if (raw === "") {
      setLocalScores((prev) => ({ ...prev, [localKey]: "" }));
      clearFieldError(localKey);
      return;
    }
    const val = parseInt(raw, 10);
    if (Number.isNaN(val) || val < 1 || val > criterion.weight) {
      const saved = savedScoreFor(teamId, criterion);
      setLocalScores((prev) => ({ ...prev, [localKey]: saved !== void 0 ? saved : "" }));
      setScoreErrors((prev) => ({ ...prev, [localKey]: `Enter 1-${criterion.weight}` }));
      return;
    }
    if (String(val) !== raw) setLocalScores((prev) => ({ ...prev, [localKey]: val }));
    clearFieldError(localKey);
    applyScore(teamId, criterion, localKey);
  };
  const focusScoreKey = (key) => {
    const el = scoreInputs.current[key];
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
    if (typeof el.select === "function") el.select();
    return true;
  };
  const teamIdOf = (key) => key.slice(0, key.indexOf("-"));
  const requestFocus = (key) => {
    const teamId = teamIdOf(key);
    setCollapsed((prev) => prev[teamId] ? { ...prev, [teamId]: false } : prev);
    const row = visibleScoreRows.find((t) => String(t.team_id) === teamId);
    if (row) {
      const catKey = `cat:${categoryOf(row)}`;
      setCollapsed((prev) => prev[catKey] ? { ...prev, [catKey]: false } : prev);
    }
    setPendingFocus(key);
  };
  const gotoScoreKey = (key) => {
    if (!key) return;
    if (!focusScoreKey(key)) requestFocus(key);
  };
  index.reactExports.useEffect(() => {
    if (!pendingFocus) return;
    if (focusScoreKey(pendingFocus)) setPendingFocus(null);
  }, [pendingFocus]);
  const stepScore = (localKey, delta) => {
    const idx = scoreOrder.indexOf(localKey);
    if (idx === -1) return;
    gotoScoreKey(scoreOrder[idx + delta]);
  };
  const stepTeam = (localKey, delta) => {
    const idx = scoreOrder.indexOf(localKey);
    if (idx === -1) return;
    gotoScoreKey(scoreOrder[idx + delta * Math.max(criteria.length, 1)]);
  };
  const savedScoreFor = (teamId, criterion) => getEvaluationForTeam(teamId)?.scores?.find((s) => s.criterion_id === criterion.id || s.criterion === criterion.name)?.score;
  const clearFieldError = (localKey) => setScoreErrors((prev) => {
    if (!(localKey in prev)) return prev;
    const next = { ...prev };
    delete next[localKey];
    return next;
  });
  const isScoreFilled = (value, weight) => {
    const raw = String(value ?? "").trim();
    if (raw === "") return false;
    const n = parseInt(raw, 10);
    return !Number.isNaN(n) && n >= 1 && n <= weight;
  };
  const teamIsFilled = (teamId) => {
    const prefix = `${teamId}-`;
    const keys = scoreOrder.filter((k) => k.startsWith(prefix));
    if (keys.length === 0) return false;
    return keys.every((k) => {
      const critId = Number(k.slice(k.indexOf("-") + 1));
      const crit = criteria.find((c) => c.id === critId);
      return isScoreFilled(localScores[k], crit ? crit.weight : maxScore);
    });
  };
  const advanceAfterTeamDone = (localKey) => {
    const teamId = teamIdOf(localKey);
    if (!teamIsFilled(teamId)) return;
    const activeKey = document.activeElement?.getAttribute?.("data-score-key");
    if (activeKey && activeKey !== localKey) return;
    const idx = scoreOrder.indexOf(localKey);
    gotoScoreKey(scoreOrder[idx + 1]);
  };
  const renderCategoryHeader = (cat, catRows, catStat, tone) => {
    const catKey = `cat:${cat}`;
    const catCollapsed = Boolean(collapsed[catKey]);
    const submitted = catStat ? catStat.withFiles : 0;
    const done = catStat ? catStat.scored : catRows.filter((x) => x.isComplete).length;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `truncate text-sm font-bold uppercase tracking-wider ${tone.name}`, children: cat }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-medium tabular-nums ${tone.count}`, children: [
          done,
          "/",
          submitted,
          " scored",
          catStat ? ` · ${catStat.files} file${catStat.files === 1 ? "" : "s"}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-2", children: catRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setCollapsed((prev) => ({ ...prev, [catKey]: !catCollapsed })),
            className: toggleButtonClass,
            "aria-expanded": !catCollapsed,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chevron, { expanded: !catCollapsed }),
              catCollapsed ? `Show ${catRows.length} teams` : "Hide teams"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-2 h-0.5 w-full rounded-full ${tone.rule} opacity-60` })
    ] });
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-slate-600", children: "Loading dashboard..." });
  const teams = {};
  submissions.forEach((sub) => {
    if (!teams[sub.team_id]) {
      teams[sub.team_id] = {
        name: sub.team_name,
        productName: sub.product_name,
        submissions: []
      };
    }
    teams[sub.team_id].submissions.push(sub);
  });
  const teamList = Object.entries(teams);
  const filteredTeams = searchTeam ? teamList.filter(
    ([teamId, team]) => String(teamId) === String(searchTeam) || team.name.toLowerCase().includes(searchTeam.toLowerCase()) || (team.productName || "").toLowerCase().includes(searchTeam.toLowerCase())
  ) : teamList;
  const teamCategoryMap = {};
  const productByTeam = {};
  submittedTeams.forEach((t) => {
    teamCategoryMap[t.team_id] = t.competition_category;
    productByTeam[t.team_id] = t.product_name;
  });
  const categoryOfTeam = (teamId) => teamCategoryMap[teamId] || "Uncategorized";
  const teamsWithFiles = filteredTeams.filter(
    ([, team]) => team.submissions.some((sub) => (sub.files?.length || 0) > 0)
  );
  const fileGroups = [];
  teamsWithFiles.forEach(([teamId, team]) => {
    const cat = categoryOfTeam(teamId);
    let group = fileGroups.find((g) => g.name === cat);
    if (!group) {
      group = { name: cat, rows: [], files: 0 };
      fileGroups.push(group);
    }
    group.rows.push([teamId, team]);
    group.files += team.submissions.reduce((n, s) => n + (s.files?.length || 0), 0);
  });
  const fileGroupTones = {};
  fileGroups.forEach((g, i) => {
    fileGroupTones[g.name] = TONE_PALETTE[i % TONE_PALETTE.length];
  });
  const visibleFileGroups = fileCategory === "all" ? fileGroups : fileGroups.filter((g) => g.name === fileCategory);
  const fileTeamCount = teamsWithFiles.length;
  const fileCountTotal = teamsWithFiles.reduce(
    (n, [, team]) => n + team.submissions.reduce((m, sub) => m + (sub.files?.length || 0), 0),
    0
  );
  const deliverableStats = [...new Set(submissions.map((s) => s.deliverable_category).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b))).map((name) => ({
    name,
    files: submissions.filter((s) => s.deliverable_category === name).reduce((n, s) => n + (s.files?.length || 0), 0)
  }));
  const maxScore = criteria.reduce((sum, c) => sum + c.weight, 0);
  const decorateTeam = (t) => {
    const teamSubs = submissions.filter((s) => s.team_id === t.team_id);
    const evaluation = getEvaluationForTeam(t.team_id);
    const myScores = evaluation?.scores || [];
    return {
      ...t,
      isAssigned: Boolean(t.is_assigned) || teamSubs.length > 0,
      evaluation,
      myTotal: myScores.reduce((sum, s) => sum + (s.score || 0), 0),
      scoredCount: myScores.length,
      teamSubs,
      isComplete: criteria.length > 0 && myScores.length >= criteria.length
    };
  };
  const allRows = submittedTeams.map(decorateTeam);
  const realSubmitters = allRows.filter((t) => t.has_files);
  const pendingRows = allRows.filter((t) => !t.has_files);
  const sortingAllTeams = sortBy !== "todo";
  const baseRows = showEmptySubmissions || sortingAllTeams ? allRows : realSubmitters;
  const sortedRows = baseRows.slice().sort((a, b) => {
    if (sortBy === "name") return String(a.team_name || "").localeCompare(String(b.team_name || ""));
    if (sortBy === "files") return (b.file_count || 0) - (a.file_count || 0);
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
    return String(a.team_name || "").localeCompare(String(b.team_name || ""));
  });
  let visibleScoreRows = sortedRows;
  if (searchTeam) {
    visibleScoreRows = visibleScoreRows.filter(
      (t) => String(t.team_id) === String(searchTeam) || String(t.team_name || "").toLowerCase().includes(searchTeam.toLowerCase())
    );
  }
  if (scoreFilter === "mine") visibleScoreRows = visibleScoreRows.filter((t) => t.isAssigned);
  if (scoreFilter === "todo") visibleScoreRows = visibleScoreRows.filter((t) => t.isAssigned && !t.isComplete);
  if (scoreFilter === "done") visibleScoreRows = visibleScoreRows.filter((t) => t.isAssigned && t.isComplete);
  const categoryOf = (t) => t.competition_category || "Uncategorized";
  const categoriesInView = [...new Set(allRows.map(categoryOf))].sort();
  if (scoreCategory !== "all") {
    visibleScoreRows = visibleScoreRows.filter((t) => categoryOf(t) === scoreCategory);
  }
  const categoryStats = categoriesInView.map((cat) => {
    const rows = allRows.filter((t) => categoryOf(t) === cat);
    const submittedRows = rows.filter((t) => t.has_files);
    return {
      name: cat,
      teams: rows.length,
      withFiles: submittedRows.length,
      scored: submittedRows.filter((t) => t.isComplete).length,
      files: submittedRows.reduce((n, t) => n + (t.file_count || 0), 0)
    };
  });
  const categoryTones = {};
  categoriesInView.forEach((cat, i) => {
    categoryTones[cat] = TONE_PALETTE[i % TONE_PALETTE.length];
  });
  const scoreCategoryNames = scoreCategory === "all" ? categoriesInView : categoriesInView.filter((cat) => cat === scoreCategory);
  const scoreSections = scoreCategoryNames.map((name) => ({
    name,
    rows: visibleScoreRows.filter((t) => categoryOf(t) === name)
  })).sort((a, b) => {
    if (sortBy === "files") {
      const fa = a.rows.reduce((n, t) => n + (t.file_count || 0), 0);
      const fb = b.rows.reduce((n, t) => n + (t.file_count || 0), 0);
      if (fa !== fb) return fb - fa;
    }
    if (sortBy === "todo") {
      const ua = a.rows.some((t) => t.isAssigned && !t.isComplete) ? 0 : 1;
      const ub = b.rows.some((t) => t.isAssigned && !t.isComplete) ? 0 : 1;
      if (ua !== ub) return ua - ub;
    }
    return a.name.localeCompare(b.name);
  });
  const scoreRenderList = [];
  scoreSections.forEach((section) => {
    if (section.rows.length === 0) {
      scoreRenderList.push({ __emptyCategory: section.name });
    } else {
      section.rows.forEach((t) => scoreRenderList.push(t));
    }
  });
  const hasActiveFilter = Boolean(searchTeam) || scoreFilter !== "all" || scoreCategory !== "all";
  const scoreOrder = [];
  for (const t of scoreRenderList) {
    if (t.__emptyCategory || !t.isAssigned) continue;
    for (const c of criteria) scoreOrder.push(`${t.team_id}-${c.id}`);
  }
  const reviewRows = allRows.filter((t) => t.isAssigned && t.has_files);
  const reviewTotal = reviewRows.length;
  const reviewDone = reviewRows.filter((t) => t.isComplete).length;
  const reviewLeft = reviewTotal - reviewDone;
  const reviewFiles = reviewRows.reduce((sum, t) => sum + (t.file_count || 0), 0);
  const visibleSubmissions = (team) => categoryFilter === "all" ? team.submissions : team.submissions.filter((sub) => sub.deliverable_category === categoryFilter);
  const summaryCards = [
    { label: "Teams to review", value: reviewTotal, tone: "indigo" },
    { label: "Scored", value: reviewDone, tone: "sky" },
    { label: "Left to score", value: reviewLeft, tone: "emerald" },
    { label: "Files waiting", value: reviewFiles, tone: "amber" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Judge Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          index$1.Link,
          {
            to: isAll ? "/judge-dashboard?comp=1" : "/judge-dashboard?comp=all",
            className: "text-sm font-medium text-indigo-600 hover:text-indigo-700",
            children: isAll ? "Competition 1" : "All competitions"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveTab("files"),
            className: `rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "files" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
            children: "View Files"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveTab("scores"),
            className: `rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "scores" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
            children: "Score Teams"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate("/"),
            className: "rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300",
            children: "Back"
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => loadData(), className: "rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700", children: "Retry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setError(""), className: "rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium hover:bg-red-100", children: "Dismiss" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: summaryCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${card.tone === "indigo" ? "bg-indigo-100 text-indigo-700" : card.tone === "sky" ? "bg-sky-100 text-sky-700" : card.tone === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}
            `, children: card.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold text-slate-900", children: card.value })
    ] }, card.label)) }),
    activeTab === "files" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "file-search", className: "sr-only", children: "Search team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "file-search",
            type: "search",
            placeholder: "Search team",
            value: searchTeam,
            onChange: (e) => setSearchTeam(e.target.value),
            className: "w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "file-comp-category", className: "sr-only", children: "Competition category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "file-comp-category",
            value: fileCategory,
            onChange: (e) => setFileCategory(e.target.value),
            className: "max-w-52 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All categories" }),
              categoryStats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.name, children: [
                c.name,
                " (",
                c.withFiles,
                " submitted)"
              ] }, c.name))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "file-category", className: "sr-only", children: "Deliverable category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "file-category",
            value: categoryFilter,
            onChange: (e) => setCategoryFilter(e.target.value),
            className: "max-w-52 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All deliverable types" }),
              deliverableStats.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: d.name, children: [
                d.name,
                " (",
                d.files,
                ")"
              ] }, d.name))
            ]
          }
        ),
        (fileCategory !== "all" || categoryFilter !== "all" || searchTeam) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setFileCategory("all");
              setCategoryFilter("all");
              setSearchTeam("");
            },
            className: "rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50",
            children: "Reset"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-sm font-medium tabular-nums text-slate-600", children: [
          fileTeamCount,
          " team",
          fileTeamCount === 1 ? "" : "s",
          " · ",
          fileCountTotal,
          " file",
          fileCountTotal === 1 ? "" : "s"
        ] })
      ] }) }),
      teamsWithFiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-amber-900", children: "No files to show yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base text-amber-800", children: assignments.length === 0 ? "You have not been assigned any team yet, so there are no files to open. Ask an admin to assign you teams in Admin -> Judge Management, and they will appear here." : searchTeam ? `No assigned team matching "${searchTeam}" has uploaded a file.` : "No assigned team has uploaded a file yet. Teams that have not submitted are listed on the Score Teams tab." })
      ] }) : visibleFileGroups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-slate-700", children: "No submitted team in this category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Pick another category, or use the Score Teams tab to see every team that has not uploaded a file yet." })
      ] }) : visibleFileGroups.map((group) => {
        const tone = fileGroupTones[group.name] || TONE_PALETTE[0];
        const groupKey = `files:${group.name}`;
        const groupCollapsed = Boolean(collapsed[groupKey]);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(index.reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: `truncate text-sm font-bold uppercase tracking-wider ${tone.name}`, children: group.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-medium tabular-nums ${tone.count}`, children: [
                group.rows.length,
                " team",
                group.rows.length === 1 ? "" : "s",
                " · ",
                group.files,
                " file",
                group.files === 1 ? "" : "s"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setCollapsed((prev) => ({ ...prev, [groupKey]: !groupCollapsed })),
                  className: `${toggleButtonClass} ml-auto`,
                  "aria-expanded": !groupCollapsed,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chevron, { expanded: !groupCollapsed }),
                    groupCollapsed ? `Show ${group.rows.length} teams` : "Hide teams"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-2 h-0.5 w-full rounded-full ${tone.rule} opacity-60` })
          ] }),
          !groupCollapsed && group.rows.map(([teamId, team]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex flex-wrap items-baseline gap-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-500", children: "Team Name:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-slate-900", title: team.name, children: [
                    isAll && team.submissions[0]?.competition_name ? `${team.submissions[0].competition_name} · ` : "",
                    team.name
                  ] })
                ] }),
                (team.productName || productByTeam[teamId]) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 flex flex-wrap items-baseline gap-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-500", children: "Project Name:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-base font-semibold text-indigo-600",
                      title: team.productName || productByTeam[teamId],
                      children: team.productName || productByTeam[teamId]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [
                  "#",
                  teamId,
                  " · ",
                  filesForTeam(teamId),
                  " file(s) available to you"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 text-sm text-slate-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => downloadTeamArchive(teamId, categoryFilter === "all" ? null : categoryFilter),
                  className: "rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300",
                  disabled: filesForTeam(teamId, categoryFilter === "all" ? null : categoryFilter) === 0,
                  title: filesForTeam(teamId, categoryFilter === "all" ? null : categoryFilter) === 0 ? "This team has no files in the selected deliverable category" : `Download ${filesForTeam(teamId, categoryFilter === "all" ? null : categoryFilter)} file(s)`,
                  children: "Download visible files"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: filesForTeam(teamId) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-base text-amber-800", children: "This team has a submission record but has not uploaded any files yet, so there is nothing to download or score." }) : visibleSubmissions(team).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500", children: "No submissions in this category." }) : [...new Set(visibleSubmissions(team).map((sub) => sub.deliverable_category || "Uncategorized"))].map((category) => {
              const categorySubmissions = visibleSubmissions(team).filter((sub) => (sub.deliverable_category || "Uncategorized") === category);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-indigo-100 bg-indigo-50/40 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-800", children: category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => downloadTeamArchive(teamId, category === "Uncategorized" ? null : category),
                      className: "self-start rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
                      disabled: filesForTeam(teamId, category === "Uncategorized" ? null : category) === 0,
                      title: filesForTeam(teamId, category === "Uncategorized" ? null : category) === 0 ? "No files in this deliverable category for this team" : `Download ${filesForTeam(teamId, category === "Uncategorized" ? null : category)} file(s)`,
                      children: [
                        "Download category (",
                        categorySubmissions.reduce((total, sub) => total + (sub.files?.length || 0), 0),
                        ")"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: categorySubmissions.map((sub) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-800", children: sub.deliverable_name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[sub.status] || "bg-slate-100 text-slate-700"}`, children: sub.status })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500", children: [
                      "Updated: ",
                      new Date(sub.updated_at).toLocaleString()
                    ] })
                  ] }),
                  sub.files && sub.files.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sub.files.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl", children: getFileIcon(f.original_filename) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-slate-800", children: f.original_filename }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: formatFileSize(f.file_size) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => downloadFile(sub.submission_id, f.id, f.original_filename).catch((err) => setError(err.message)),
                        className: "rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700",
                        children: "Download"
                      }
                    )
                  ] }, f.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-400", children: "No files uploaded yet" })
                ] }, sub.submission_id)) })
              ] }, category);
            }) })
          ] }, teamId))
        ] }, group.name);
      })
    ] }),
    activeTab === "scores" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-24 overflow-hidden rounded-full bg-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-2 rounded-full bg-indigo-600 transition-all",
              style: { width: `${reviewTotal ? Math.round(reviewDone / reviewTotal * 100) : 0}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold tabular-nums text-slate-700", children: [
            reviewDone,
            "/",
            reviewTotal
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "score-filter", className: "sr-only", children: "Filter teams" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "score-filter",
            value: scoreFilter,
            onChange: (e) => setScoreFilter(e.target.value),
            className: "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none",
            children: scoreFilters.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.key, children: f.label }, f.key))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "team-search", className: "sr-only", children: "Search team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "team-search",
            type: "search",
            placeholder: "Search team",
            value: searchTeam,
            onChange: (e) => setSearchTeam(e.target.value),
            className: "w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "filter-category", className: "sr-only", children: "Filter by category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "filter-category",
            value: scoreCategory,
            onChange: (e) => setScoreCategory(e.target.value),
            className: "max-w-44 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All categories" }),
              categoryStats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.name, children: [
                c.name,
                " (",
                c.withFiles,
                " submitted)"
              ] }, c.name))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "sort-teams", className: "sr-only", children: "Sort teams" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "sort-teams",
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none",
            children: sortOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.key, children: o.label }, o.key))
          }
        ),
        pendingRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowEmptySubmissions((v) => !v),
            className: `rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${showEmptySubmissions ? "bg-slate-700 text-white" : "text-slate-500 hover:bg-slate-100"}`,
            children: [
              "No files (",
              pendingRows.length,
              ")"
            ]
          }
        ),
        hasActiveFilter && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchTeam("");
              setScoreFilter("all");
              setScoreCategory("all");
            },
            className: "rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50",
            children: "Reset"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto hidden text-xs text-slate-400 sm:inline", children: "Enter next · ←→ criteria · ↑↓ team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowGuide((v) => !v),
            className: "inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100",
            "aria-expanded": showGuide,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chevron, { expanded: showGuide }),
              showGuide ? "Hide help" : "How to score"
            ]
          }
        )
      ] }) }),
      showGuide && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal space-y-1 pl-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Type a whole number in each box. Letters, spaces and stray characters are cleaned up for you." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Enter" }),
          " saves the box and puts the cursor in the next one — Innovation to Feasibility, and the last criterion to the first box of the next team."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Shift+Enter" }),
          " goes back one box, and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Tab" }),
          " / ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Shift+Tab" }),
          " do the same."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "←" }),
          " and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "→" }),
          " move between the criteria of the same team."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "↑" }),
          " and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "↓" }),
          " jump to the same criterion on the team above or below."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Ctrl+↑" }),
          " / ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Ctrl+↓" }),
          " raise or lower the score in place, add ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-indigo-300 bg-white px-1", children: "Shift" }),
          " for steps of 5."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Out of range, the box returns to its last saved score and the range is shown under it." })
      ] }) }),
      baseRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-amber-900", children: "Nothing to score yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base text-amber-800", children: assignments.length === 0 ? "You have not been assigned any team yet, so there is nothing to score. Ask an admin to assign you teams in Admin -> Judge Management." : pendingRows.length > 0 ? `${pendingRows.length} team(s) created a submission but have not uploaded any file.` : "Teams appear here automatically as soon as they upload at least one file." })
      ] }) : hasActiveFilter && visibleScoreRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-slate-700", children: scoreCategory !== "all" ? `No submitted team in ${scoreCategory}` : "No team matches the current search or filter." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: scoreCategory !== "all" ? 'Pick another category, or choose "All categories" to see every team.' : 'Clear the search box or pick "All" to widen the view.' })
      ] }) : scoreRenderList.map((t, rowIndex) => {
        const cat = t.__emptyCategory || categoryOf(t);
        const catKey = `cat:${cat}`;
        const catCollapsed = Boolean(collapsed[catKey]);
        const showCatHeader = t.__emptyCategory ? true : rowIndex === 0 || categoryOf(scoreRenderList[rowIndex - 1] || {}) !== cat;
        const catRows = t.__emptyCategory ? [] : visibleScoreRows.filter((x) => categoryOf(x) === cat);
        const catStat = categoryStats.find((c) => c.name === cat);
        const tone = categoryTones[cat] || TONE_PALETTE[0];
        if (t.__emptyCategory) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(index.reactExports.Fragment, { children: [
            renderCategoryHeader(cat, [], catStat, tone),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-slate-700", children: "No submitted team in this category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: catStat && catStat.teams > catStat.withFiles ? `${catStat.teams - catStat.withFiles} team(s) here have not uploaded a file yet.` : "No team has uploaded a file in this category yet." }),
              catStat && catStat.teams > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setShowEmptySubmissions(true),
                  className: "mt-3 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50",
                  children: [
                    "Show ",
                    catStat.teams,
                    " team(s) without files"
                  ]
                }
              )
            ] })
          ] }, `empty-${cat}`);
        }
        const evaluation = t.evaluation;
        const avgScore = isAll ? null : getScoreForTeam(t.team_id);
        const pct = criteria.length > 0 ? Math.round(t.scoredCount / criteria.length * 100) : 0;
        const isCollapsed = Boolean(collapsed[t.team_id]);
        const fileCount = t.teamSubs.reduce((n, s) => n + (s.files?.length || 0), 0);
        const filesOpen = Boolean(showFiles[t.team_id]);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(index.reactExports.Fragment, { children: [
          showCatHeader && renderCategoryHeader(cat, catRows, catStat, tone),
          !catCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-5 pb-3 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-500", children: "Team Name:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-lg font-bold text-slate-900", title: t.team_name, children: t.team_name || `Team ${t.team_id}` }),
                  t.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700", children: "Done" }),
                  !t.has_files && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700", children: "No files" })
                ] }),
                t.product_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 flex flex-wrap items-baseline gap-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-500", children: "Project Name:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold text-indigo-600", title: t.product_name, children: t.product_name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-sm text-slate-500", children: [
                  "#",
                  t.team_id,
                  isAll && t.competition_name ? ` · ${t.competition_name}` : "",
                  " · ",
                  t.scoredCount,
                  "/",
                  criteria.length,
                  " scored",
                  avgScore ? ` · ${avgScore.num_judges} judge(s)` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-indigo-600 transition-all", style: { width: `${pct}%` } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-xl bg-indigo-50 px-3 py-1.5 text-base font-bold tabular-nums text-indigo-700", children: [
                  t.myTotal,
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-indigo-400", children: [
                    "/",
                    maxScore
                  ] })
                ] }),
                t.isAssigned && t.teamSubs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setShowFiles((prev) => ({ ...prev, [t.team_id]: !prev[t.team_id] })),
                    className: toggleButtonClass,
                    "aria-expanded": Boolean(showFiles[t.team_id]),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Chevron, { expanded: Boolean(showFiles[t.team_id]) }),
                      "View files (",
                      fileCount,
                      ")"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setCollapsed((prev) => ({ ...prev, [t.team_id]: !isCollapsed })),
                    className: toggleButtonClass,
                    "aria-expanded": !isCollapsed,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Chevron, { expanded: !isCollapsed }),
                      isCollapsed ? "Show score boxes" : "Hide score boxes"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-5", children: [
              !t.isAssigned && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600", children: "Not assigned to you, so scoring is disabled. Ask an admin to assign this team if you should review it." }),
              filesOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3", children: [
                t.teamSubs.filter((sub) => (sub.files?.length || 0) > 0).map((sub) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 last:mb-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: sub.deliverable_name }),
                  sub.files.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-slate-200/70 py-1.5 last:border-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "text-base", children: getFileIcon(f.original_filename) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-sm text-slate-700", title: f.original_filename, children: f.original_filename }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-slate-400", children: formatFileSize(f.file_size) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => downloadFile(sub.submission_id, f.id, f.original_filename).catch((err) => setError(err.message)),
                        className: "shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100",
                        children: "Download"
                      }
                    )
                  ] }, f.id))
                ] }, sub.submission_id)),
                fileCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between border-t border-slate-200 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500", children: [
                    fileCount,
                    " file(s) · nothing is downloaded until you ask"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => downloadTeamArchive(t.team_id, null),
                      className: "rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50",
                      children: "Download all as ZIP"
                    }
                  )
                ] })
              ] }),
              !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                evaluation && t.isAssigned && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex flex-wrap items-center justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleClearEvaluation(evaluation),
                    className: "rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50",
                    disabled: evaluation.status === "LOCKED" || evaluation.status === "FINALIZED",
                    title: evaluation.status === "LOCKED" || evaluation.status === "FINALIZED" ? "The head judge has locked this team, so scores cannot be cleared" : "Delete every score you gave for this team",
                    children: "Clear my scores"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: criteria.map((c) => {
                  const existing = evaluation?.scores?.find((s) => s.criterion === c.name || s.criterion_id === c.id)?.score;
                  const localKey = `${t.team_id}-${c.id}`;
                  const displayValue = localScores[localKey] !== void 0 ? localScores[localKey] : existing !== void 0 ? existing : "";
                  const fieldError = scoreErrors[localKey];
                  const fieldStatus = scoreStatus[localKey];
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `rounded-xl border bg-slate-50 p-3 transition ${fieldError ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "label",
                          {
                            htmlFor: `score-${localKey}`,
                            className: "mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-slate-700",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.name }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-xs font-medium text-slate-400", children: [
                                "/ ",
                                c.weight
                              ] })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            id: `score-${localKey}`,
                            ref: (el) => {
                              scoreInputs.current[localKey] = el;
                            },
                            type: "text",
                            inputMode: "numeric",
                            autoComplete: "off",
                            "data-score-key": localKey,
                            disabled: !t.isAssigned,
                            placeholder: "–",
                            value: displayValue,
                            onChange: (e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              setLocalScores((prev) => ({ ...prev, [localKey]: digits }));
                              const n = parseInt(digits, 10);
                              if (digits !== "" && (Number.isNaN(n) || n < 1 || n > c.weight)) {
                                setScoreErrors((prev) => ({ ...prev, [localKey]: `Enter 1-${c.weight}` }));
                              } else {
                                clearFieldError(localKey);
                              }
                            },
                            onFocus: (e) => {
                              if (e.target.value) e.target.select();
                            },
                            onBlur: () => commitScore(t.team_id, c, localKey),
                            onKeyDown: (e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                e.currentTarget.blur();
                                stepScore(localKey, e.shiftKey ? -1 : 1);
                                return;
                              }
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.currentTarget.blur();
                                stepScore(localKey, e.shiftKey ? -1 : 1);
                                return;
                              }
                              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                                e.preventDefault();
                                e.currentTarget.blur();
                                stepScore(localKey, e.key === "ArrowRight" ? 1 : -1);
                                return;
                              }
                              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                e.preventDefault();
                                const dir = e.key === "ArrowUp" ? 1 : -1;
                                if (e.ctrlKey || e.metaKey || e.altKey) {
                                  const current = parseInt(String(localScores[localKey] ?? ""), 10);
                                  const base = Number.isNaN(current) ? savedScoreFor(t.team_id, c) || 0 : current;
                                  const next = Math.min(c.weight, Math.max(1, base + dir * (e.shiftKey ? 5 : 1)));
                                  setLocalScores((prev) => ({ ...prev, [localKey]: next }));
                                  clearFieldError(localKey);
                                  return;
                                }
                                e.currentTarget.blur();
                                stepTeam(localKey, dir);
                              }
                            },
                            title: "Enter next · Shift+Enter back · ← → criteria · ↑ ↓ team · Ctrl+↑ ↓ adjust",
                            "aria-label": `${t.team_name || `Team ${t.team_id}`} - ${c.name} out of ${c.weight}`,
                            "aria-invalid": fieldError ? true : void 0,
                            "aria-describedby": fieldError ? `err-${localKey}` : void 0,
                            className: `w-full cursor-text rounded-lg border-2 bg-white px-3 py-2 text-center text-xl font-bold tabular-nums caret-indigo-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${fieldError ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-indigo-500"}`
                          }
                        ),
                        t.isAssigned && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => setShowNotes((prev) => ({ ...prev, [localKey]: !prev[localKey] })),
                            className: "mt-1.5 text-xs font-medium text-slate-500 hover:text-indigo-700",
                            children: showNotes[localKey] ? "− hide note" : "+ note"
                          }
                        ),
                        showNotes[localKey] && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "text",
                            placeholder: "Optional note",
                            value: notes[localKey] || "",
                            onChange: (e) => setNotes((prev) => ({ ...prev, [localKey]: e.target.value })),
                            onBlur: () => applyScore(t.team_id, c, localKey),
                            onKeyDown: (e) => {
                              if (e.key === "Enter" || e.key === "Tab") {
                                e.preventDefault();
                                e.currentTarget.blur();
                                stepScore(localKey, e.key === "Tab" && e.shiftKey ? -1 : 1);
                              }
                            },
                            className: "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 h-4 text-xs", children: fieldError ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { id: `err-${localKey}`, className: "font-medium text-red-600", children: fieldError }) : fieldStatus === "saving" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "saving..." }) : fieldStatus === "saved" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-emerald-600", children: "saved" }) : null })
                      ]
                    },
                    c.id
                  );
                }) })
              ] })
            ] })
          ] })
        ] }, `${t.competition_id}-${t.team_id}`);
      })
    ] })
  ] });
}

exports.default = JudgeDashboard;
