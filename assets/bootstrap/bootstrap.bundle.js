(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.bootstrap = factory()));
})(this, function () {
  "use strict";
  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = "transitionend";
  const toType = (obj) => {
    if (obj === null || obj === undefined) {
      return `${obj}`;
    }
    return {}.toString
      .call(obj)
      .match(/\s([a-z]+)/i)[1]
      .toLowerCase();
  };
  const getUID = (prefix) => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  const getSelector = (element) => {
    let selector = element.getAttribute("data-bs-target");

    if (!selector || selector === "#") {
      let hrefAttr = element.getAttribute("href");

      if (!hrefAttr || (!hrefAttr.includes("#") && !hrefAttr.startsWith("."))) {
        return null;
      }
      if (hrefAttr.includes("#") && !hrefAttr.startsWith("#")) {
        hrefAttr = `#${hrefAttr.split("#")[1]}`;
      }

      selector = hrefAttr && hrefAttr !== "#" ? hrefAttr.trim() : null;
    }
    return selector;
  };
  const getSelectorFromElement = (element) => {
    const selector = getSelector(element);

    if (selector) {
      return document.querySelector(selector) ? selector : null;
    }
    return null;
  };
  const getElementFromSelector = (element) => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };
  const getTransitionDurationFromElement = (element) => {
    if (!element) {
      return 0;
    }

    let { transitionDuration, transitionDelay } =
      window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }
    transitionDuration = transitionDuration.split(",")[0];
    transitionDelay = transitionDelay.split(",")[0];
    return (
      (Number.parseFloat(transitionDuration) +
        Number.parseFloat(transitionDelay)) *
      MILLISECONDS_MULTIPLIER
    );
  };
  const triggerTransitionEnd = (element) => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  const isElement$1 = (obj) => {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    if (typeof obj.jquery !== "undefined") {
      obj = obj[0];
    }

    return typeof obj.nodeType !== "undefined";
  };
  const getElement = (obj) => {
    if (isElement$1(obj)) {
      return obj.jquery ? obj[0] : obj;
    }

    if (typeof obj === "string" && obj.length > 0) {
      return document.querySelector(obj);
    }

    return null;
  };
  const typeCheckConfig = (componentName, config, configTypes) => {
    Object.keys(configTypes).forEach((property) => {
      const expectedTypes = configTypes[property];
      const value = config[property];
      const valueType = value && isElement$1(value) ? "element" : toType(value);

      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(
          `${componentName.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`
        );
      }
    });
  };
  const isVisible = (element) => {
    if (!isElement$1(element) || element.getClientRects().length === 0) {
      return false;
    }

    return (
      getComputedStyle(element).getPropertyValue("visibility") === "visible"
    );
  };
  const isDisabled = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains("disabled")) {
      return true;
    }

    if (typeof element.disabled !== "undefined") {
      return element.disabled;
    }

    return (
      element.hasAttribute("disabled") &&
      element.getAttribute("disabled") !== "false"
    );
  };
  const findShadowRoot = (element) => {
    if (!document.documentElement.attachShadow) {
      return null;
    }

    if (typeof element.getRootNode === "function") {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }

    if (element instanceof ShadowRoot) {
      return element;
    }

    if (!element.parentNode) {
      return null;
    }

    return findShadowRoot(element.parentNode);
  };
  const noop = () => {};

  const reflow = (element) => {
    element.offsetHeight;
  };
  const getjQuery = () => {
    const { jQuery } = window;

    if (jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
      return jQuery;
    }

    return null;
  };
  const DOMContentLoadedCallbacks = [];
  const onDOMContentLoaded = (callback) => {
    if (document.readyState === "loading") {
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener("DOMContentLoaded", () => {
          DOMContentLoadedCallbacks.forEach((callback) => callback());
        });
      }

      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  const isRTL = () => document.documentElement.dir === "rtl";
  const defineJQueryPlugin = (plugin) => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();

      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;

        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  const execute = (callback) => {
    if (typeof callback === "function") {
      callback();
    }
  };
  const executeAfterTransition = (
    callback,
    transitionElement,
    waitForTransition = true
  ) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration =
      getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({ target }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  const getNextActiveElement = (
    list,
    activeElement,
    shouldGetNext,
    isCycleAllowed
  ) => {
    let index = list.indexOf(activeElement);
    if (index === -1) {
      return list[!shouldGetNext && isCycleAllowed ? list.length - 1 : 0];
    }

    const listLength = list.length;
    index += shouldGetNext ? 1 : -1;

    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }

    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {};
  let uidEvent = 1;
  const customEvents = {
    mouseenter: "mouseover",
    mouseleave: "mouseout",
  };
  const customEventsRegex = /^(mouseenter|mouseleave)/i;
  const nativeEvents = new Set([
    "click",
    "dblclick",
    "mouseup",
    "mousedown",
    "contextmenu",
    "mousewheel",
    "DOMMouseScroll",
    "mouseover",
    "mouseout",
    "mousemove",
    "selectstart",
    "selectend",
    "keydown",
    "keypress",
    "keyup",
    "orientationchange",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointerleave",
    "pointercancel",
    "gesturestart",
    "gesturechange",
    "gestureend",
    "focus",
    "blur",
    "change",
    "reset",
    "select",
    "submit",
    "focusin",
    "focusout",
    "load",
    "unload",
    "beforeunload",
    "resize",
    "move",
    "DOMContentLoaded",
    "readystatechange",
    "error",
    "abort",
    "scroll",
  ]);
  function getUidEvent(element, uid) {
    return (uid && `${uid}::${uidEvent++}`) || element.uidEvent || uidEvent++;
  }
  function getEvent(element) {
    const uid = getUidEvent(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn) {
    return function handler(event) {
      event.delegateTarget = element;

      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }

      return fn.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);

      for (
        let { target } = event;
        target && target !== this;
        target = target.parentNode
      ) {
        for (let i = domElements.length; i--; ) {
          if (domElements[i] === target) {
            event.delegateTarget = target;

            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }

            return fn.apply(target, [event]);
          }
        }
      }

      return null;
    };
  }
  function findHandler(events, handler, delegationSelector = null) {
    const uidEventList = Object.keys(events);

    for (let i = 0, len = uidEventList.length; i < len; i++) {
      const event = events[uidEventList[i]];

      if (
        event.originalHandler === handler &&
        event.delegationSelector === delegationSelector
      ) {
        return event;
      }
    }

    return null;
  }
  function normalizeParams(originalTypeEvent, handler, delegationFn) {
    const delegation = typeof handler === "string";
    const originalHandler = delegation ? delegationFn : handler;
    let typeEvent = getTypeEvent(originalTypeEvent);
    const isNative = nativeEvents.has(typeEvent);

    if (!isNative) {
      typeEvent = originalTypeEvent;
    }

    return [delegation, originalHandler, typeEvent];
  }
  function addHandler(
    element,
    originalTypeEvent,
    handler,
    delegationFn,
    oneOff
  ) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }

    if (!handler) {
      handler = delegationFn;
      delegationFn = null;
    }

    if (customEventsRegex.test(originalTypeEvent)) {
      const wrapFn = (fn) => {
        return function (event) {
          if (
            !event.relatedTarget ||
            (event.relatedTarget !== event.delegateTarget &&
              !event.delegateTarget.contains(event.relatedTarget))
          ) {
            return fn.call(this, event);
          }
        };
      };

      if (delegationFn) {
        delegationFn = wrapFn(delegationFn);
      } else {
        handler = wrapFn(handler);
      }
    }

    const [delegation, originalHandler, typeEvent] = normalizeParams(
      originalTypeEvent,
      handler,
      delegationFn
    );
    const events = getEvent(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFn = findHandler(
      handlers,
      originalHandler,
      delegation ? handler : null
    );

    if (previousFn) {
      previousFn.oneOff = previousFn.oneOff && oneOff;
      return;
    }

    const uid = getUidEvent(
      originalHandler,
      originalTypeEvent.replace(namespaceRegex, "")
    );
    const fn = delegation
      ? bootstrapDelegationHandler(element, handler, delegationFn)
      : bootstrapHandler(element, handler);
    fn.delegationSelector = delegation ? handler : null;
    fn.originalHandler = originalHandler;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, delegation);
  }
  function removeHandler(
    element,
    events,
    typeEvent,
    handler,
    delegationSelector
  ) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);

    if (!fn) {
      return;
    }

    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    Object.keys(storeElementEvent).forEach((handlerKey) => {
      if (handlerKey.includes(namespace)) {
        const event = storeElementEvent[handlerKey];
        removeHandler(
          element,
          events,
          typeEvent,
          event.originalHandler,
          event.delegationSelector
        );
      }
    });
  }
  function getTypeEvent(event) {
    event = event.replace(stripNameRegex, "");
    return customEvents[event] || event;
  }
  const EventHandler = {
    on(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, false);
    },

    one(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, true);
    },

    off(element, originalTypeEvent, handler, delegationFn) {
      if (typeof originalTypeEvent !== "string" || !element) {
        return;
      }

      const [delegation, originalHandler, typeEvent] = normalizeParams(
        originalTypeEvent,
        handler,
        delegationFn
      );
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getEvent(element);
      const isNamespace = originalTypeEvent.startsWith(".");

      if (typeof originalHandler !== "undefined") {
        if (!events || !events[typeEvent]) {
          return;
        }

        removeHandler(
          element,
          events,
          typeEvent,
          originalHandler,
          delegation ? handler : null
        );
        return;
      }

      if (isNamespace) {
        Object.keys(events).forEach((elementEvent) => {
          removeNamespacedHandlers(
            element,
            events,
            elementEvent,
            originalTypeEvent.slice(1)
          );
        });
      }

      const storeElementEvent = events[typeEvent] || {};
      Object.keys(storeElementEvent).forEach((keyHandlers) => {
        const handlerKey = keyHandlers.replace(stripUidRegex, "");

        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(
            element,
            events,
            typeEvent,
            event.originalHandler,
            event.delegationSelector
          );
        }
      });
    },

    trigger(element, event, args) {
      if (typeof event !== "string" || !element) {
        return null;
      }

      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      const isNative = nativeEvents.has(typeEvent);
      let jQueryEvent;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      let evt = null;

      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }

      if (isNative) {
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(typeEvent, bubbles, true);
      } else {
        evt = new CustomEvent(event, {
          bubbles,
          cancelable: true,
        });
      }

      if (typeof args !== "undefined") {
        Object.keys(args).forEach((key) => {
          Object.defineProperty(evt, key, {
            get() {
              return args[key];
            },
          });
        });
      }

      if (defaultPrevented) {
        evt.preventDefault();
      }

      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }

      if (evt.defaultPrevented && typeof jQueryEvent !== "undefined") {
        jQueryEvent.preventDefault();
      }

      return evt;
    },
  };

  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element);

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        console.error(
          `Bootstrap doesn't allow more than one instance per element. Bound instance: ${
            Array.from(instanceMap.keys())[0]
          }.`
        );
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    },
  };

  const VERSION = "5.1.3";
  class BaseComponent {
    constructor(element) {
      element = getElement(element);

      if (!element) {
        return;
      }

      this._element = element;
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      Object.getOwnPropertyNames(this).forEach((propertyName) => {
        this[propertyName] = null;
      });
    }

    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }

    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
      return (
        this.getInstance(element) ||
        new this(element, typeof config === "object" ? config : null)
      );
    }

    static get VERSION() {
      return VERSION;
    }

    static get NAME() {
      throw new Error(
        'You have to implement the static method "NAME", for each component!'
      );
    }

    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }

    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
  }

  const enableDismissTrigger = (component, method = "hide") => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(
      document,
      clickEvent,
      `[data-bs-dismiss="${name}"]`,
      function (event) {
        if (["A", "AREA"].includes(this.tagName)) {
          event.preventDefault();
        }

        if (isDisabled(this)) {
          return;
        }

        const target = getElementFromSelector(this) || this.closest(`.${name}`);
        const instance = component.getOrCreateInstance(target);

        instance[method]();
      }
    );
  };

  const NAME$d = "alert";
  const DATA_KEY$c = "bs.alert";
  const EVENT_KEY$c = `.${DATA_KEY$c}`;
  const EVENT_CLOSE = `close${EVENT_KEY$c}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$c}`;
  const CLASS_NAME_FADE$5 = "fade";
  const CLASS_NAME_SHOW$8 = "show";
  class Alert extends BaseComponent {
    static get NAME() {
      return NAME$d;
    }

    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);

      if (closeEvent.defaultPrevented) {
        return;
      }

      this._element.classList.remove(CLASS_NAME_SHOW$8);

      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);

      this._queueCallback(
        () => this._destroyElement(),
        this._element,
        isAnimated
      );
    }

    _destroyElement() {
      this._element.remove();

      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);

        if (typeof config !== "string") {
          return;
        }

        if (
          data[config] === undefined ||
          config.startsWith("_") ||
          config === "constructor"
        ) {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }
  }
  enableDismissTrigger(Alert, "close");
  defineJQueryPlugin(Alert);

  const NAME$c = "button";
  const DATA_KEY$b = "bs.button";
  const EVENT_KEY$b = `.${DATA_KEY$b}`;
  const DATA_API_KEY$7 = ".data-api";
  const CLASS_NAME_ACTIVE$3 = "active";
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$b}${DATA_API_KEY$7}`;
  class Button extends BaseComponent {
    static get NAME() {
      return NAME$c;
    }

    toggle() {
      this._element.setAttribute(
        "aria-pressed",
        this._element.classList.toggle(CLASS_NAME_ACTIVE$3)
      );
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);

        if (config === "toggle") {
          data[config]();
        }
      });
    }
  }
  EventHandler.on(
    document,
    EVENT_CLICK_DATA_API$6,
    SELECTOR_DATA_TOGGLE$5,
    (event) => {
      event.preventDefault();
      const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
      const data = Button.getOrCreateInstance(button);
      data.toggle();
    }
  );
  defineJQueryPlugin(Button);

  function normalizeData(val) {
    if (val === "true") {
      return true;
    }

    if (val === "false") {
      return false;
    }

    if (val === Number(val).toString()) {
      return Number(val);
    }

    if (val === "" || val === "null") {
      return null;
    }

    return val;
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },

    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },

    getDataAttributes(element) {
      if (!element) {
        return {};
      }

      const attributes = {};
      Object.keys(element.dataset)
        .filter((key) => key.startsWith("bs"))
        .forEach((key) => {
          let pureKey = key.replace(/^bs/, "");
          pureKey =
            pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
          attributes[pureKey] = normalizeData(element.dataset[key]);
        });
      return attributes;
    },

    getDataAttribute(element, key) {
      return normalizeData(
        element.getAttribute(`data-bs-${normalizeDataKey(key)}`)
      );
    },

    offset(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
      };
    },

    position(element) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft,
      };
    },
  };

  const NODE_TEXT = 3;
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(
        ...Element.prototype.querySelectorAll.call(element, selector)
      );
    },

    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
      return []
        .concat(...element.children)
        .filter((child) => child.matches(selector));
    },

    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode;

      while (
        ancestor &&
        ancestor.nodeType === Node.ELEMENT_NODE &&
        ancestor.nodeType !== NODE_TEXT
      ) {
        if (ancestor.matches(selector)) {
          parents.push(ancestor);
        }

        ancestor = ancestor.parentNode;
      }

      return parents;
    },

    prev(element, selector) {
      let previous = element.previousElementSibling;

      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }

        previous = previous.previousElementSibling;
      }

      return [];
    },

    next(element, selector) {
      let next = element.nextElementSibling;

      while (next) {
        if (next.matches(selector)) {
          return [next];
        }

        next = next.nextElementSibling;
      }

      return [];
    },

    focusableChildren(element) {
      const focusables = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "details",
        "[tabindex]",
        '[contenteditable="true"]',
      ]
        .map((selector) => `${selector}:not([tabindex^="-"])`)
        .join(", ");
      return this.find(focusables, element).filter(
        (el) => !isDisabled(el) && isVisible(el)
      );
    },
  };

  const NAME$b = "carousel";
  const DATA_KEY$a = "bs.carousel";
  const EVENT_KEY$a = `.${DATA_KEY$a}`;
  const DATA_API_KEY$6 = ".data-api";
  const ARROW_LEFT_KEY = "ArrowLeft";
  const ARROW_RIGHT_KEY = "ArrowRight";
  const TOUCHEVENT_COMPAT_WAIT = 500;

  const SWIPE_THRESHOLD = 40;
  const Default$a = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: "hover",
    wrap: true,
    touch: true,
  };
  const DefaultType$a = {
    interval: "(number|boolean)",
    keyboard: "boolean",
    slide: "(boolean|string)",
    pause: "(string|boolean)",
    wrap: "boolean",
    touch: "boolean",
  };
  const ORDER_NEXT = "next";
  const ORDER_PREV = "prev";
  const DIRECTION_LEFT = "left";
  const DIRECTION_RIGHT = "right";
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY]: DIRECTION_LEFT,
  };
  const EVENT_SLIDE = `slide${EVENT_KEY$a}`;
  const EVENT_SLID = `slid${EVENT_KEY$a}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$a}`;
  const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY$a}`;
  const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY$a}`;
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$a}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$a}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$a}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$a}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$a}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$a}`;
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$a}${DATA_API_KEY$6}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
  const CLASS_NAME_CAROUSEL = "carousel";
  const CLASS_NAME_ACTIVE$2 = "active";
  const CLASS_NAME_SLIDE = "slide";
  const CLASS_NAME_END = "carousel-item-end";
  const CLASS_NAME_START = "carousel-item-start";
  const CLASS_NAME_NEXT = "carousel-item-next";
  const CLASS_NAME_PREV = "carousel-item-prev";
  const CLASS_NAME_POINTER_EVENT = "pointer-event";
  const SELECTOR_ACTIVE$1 = ".active";
  const SELECTOR_ACTIVE_ITEM = ".active.carousel-item";
  const SELECTOR_ITEM = ".carousel-item";
  const SELECTOR_ITEM_IMG = ".carousel-item img";
  const SELECTOR_NEXT_PREV = ".carousel-item-next, .carousel-item-prev";
  const SELECTOR_INDICATORS = ".carousel-indicators";
  const SELECTOR_INDICATOR = "[data-bs-target]";
  const SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const POINTER_TYPE_TOUCH = "touch";
  const POINTER_TYPE_PEN = "pen";
  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._indicatorsElement = SelectorEngine.findOne(
        SELECTOR_INDICATORS,
        this._element
      );
      this._touchSupported =
        "ontouchstart" in document.documentElement ||
        navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(window.PointerEvent);

      this._addEventListeners();
    }

    static get Default() {
      return Default$a;
    }

    static get NAME() {
      return NAME$b;
    }
    next() {
      this._slide(ORDER_NEXT);
    }

    nextWhenVisible() {
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }

    prev() {
      this._slide(ORDER_PREV);
    }

    pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (SelectorEngine.findOne(SELECTOR_NEXT_PREV, this._element)) {
        triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    }

    cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config && this._config.interval && !this._isPaused) {
        this._updateInterval();

        this._interval = setInterval(
          (document.visibilityState ? this.nextWhenVisible : this.next).bind(
            this
          ),
          this._config.interval
        );
      }
    }

    to(index) {
      this._activeElement = SelectorEngine.findOne(
        SELECTOR_ACTIVE_ITEM,
        this._element
      );

      const activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;

      this._slide(order, this._items[index]);
    }

    _getConfig(config) {
      config = {
        ...Default$a,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === "object" ? config : {}),
      };
      typeCheckConfig(NAME$b, config, DefaultType$a);
      return config;
    }

    _handleSwipe() {
      const absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      const direction = absDeltax / this.touchDeltaX;
      this.touchDeltaX = 0;

      if (!direction) {
        return;
      }

      this._slide(direction > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT);
    }

    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN, (event) =>
          this._keydown(event)
        );
      }

      if (this._config.pause === "hover") {
        EventHandler.on(this._element, EVENT_MOUSEENTER, (event) =>
          this.pause(event)
        );
        EventHandler.on(this._element, EVENT_MOUSELEAVE, (event) =>
          this.cycle(event)
        );
      }

      if (this._config.touch && this._touchSupported) {
        this._addTouchEventListeners();
      }
    }

    _addTouchEventListeners() {
      const hasPointerPenTouch = (event) => {
        return (
          this._pointerEvent &&
          (event.pointerType === POINTER_TYPE_PEN ||
            event.pointerType === POINTER_TYPE_TOUCH)
        );
      };

      const start = (event) => {
        if (hasPointerPenTouch(event)) {
          this.touchStartX = event.clientX;
        } else if (!this._pointerEvent) {
          this.touchStartX = event.touches[0].clientX;
        }
      };

      const move = (event) => {
        this.touchDeltaX =
          event.touches && event.touches.length > 1
            ? 0
            : event.touches[0].clientX - this.touchStartX;
      };

      const end = (event) => {
        if (hasPointerPenTouch(event)) {
          this.touchDeltaX = event.clientX - this.touchStartX;
        }

        this._handleSwipe();

        if (this._config.pause === "hover") {
          this.pause();

          if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
          }

          this.touchTimeout = setTimeout(
            (event) => this.cycle(event),
            TOUCHEVENT_COMPAT_WAIT + this._config.interval
          );
        }
      };

      SelectorEngine.find(SELECTOR_ITEM_IMG, this._element).forEach(
        (itemImg) => {
          EventHandler.on(itemImg, EVENT_DRAG_START, (event) =>
            event.preventDefault()
          );
        }
      );

      if (this._pointerEvent) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, (event) =>
          start(event)
        );
        EventHandler.on(this._element, EVENT_POINTERUP, (event) => end(event));

        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, (event) =>
          start(event)
        );
        EventHandler.on(this._element, EVENT_TOUCHMOVE, (event) => move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, (event) => end(event));
      }
    }

    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      const direction = KEY_TO_DIRECTION[event.key];

      if (direction) {
        event.preventDefault();

        this._slide(direction);
      }
    }

    _getItemIndex(element) {
      this._items =
        element && element.parentNode
          ? SelectorEngine.find(SELECTOR_ITEM, element.parentNode)
          : [];
      return this._items.indexOf(element);
    }

    _getItemByOrder(order, activeElement) {
      const isNext = order === ORDER_NEXT;
      return getNextActiveElement(
        this._items,
        activeElement,
        isNext,
        this._config.wrap
      );
    }

    _triggerSlideEvent(relatedTarget, eventDirectionName) {
      const targetIndex = this._getItemIndex(relatedTarget);

      const fromIndex = this._getItemIndex(
        SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element)
      );

      return EventHandler.trigger(this._element, EVENT_SLIDE, {
        relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex,
      });
    }

    _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        const activeIndicator = SelectorEngine.findOne(
          SELECTOR_ACTIVE$1,
          this._indicatorsElement
        );
        activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
        activeIndicator.removeAttribute("aria-current");
        const indicators = SelectorEngine.find(
          SELECTOR_INDICATOR,
          this._indicatorsElement
        );

        for (let i = 0; i < indicators.length; i++) {
          if (
            Number.parseInt(
              indicators[i].getAttribute("data-bs-slide-to"),
              10
            ) === this._getItemIndex(element)
          ) {
            indicators[i].classList.add(CLASS_NAME_ACTIVE$2);
            indicators[i].setAttribute("aria-current", "true");
            break;
          }
        }
      }
    }

    _updateInterval() {
      const element =
        this._activeElement ||
        SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      if (!element) {
        return;
      }

      const elementInterval = Number.parseInt(
        element.getAttribute("data-bs-interval"),
        10
      );

      if (elementInterval) {
        this._config.defaultInterval =
          this._config.defaultInterval || this._config.interval;
        this._config.interval = elementInterval;
      } else {
        this._config.interval =
          this._config.defaultInterval || this._config.interval;
      }
    }

    _slide(directionOrOrder, element) {
      const order = this._directionToOrder(directionOrOrder);

      const activeElement = SelectorEngine.findOne(
        SELECTOR_ACTIVE_ITEM,
        this._element
      );

      const activeElementIndex = this._getItemIndex(activeElement);

      const nextElement = element || this._getItemByOrder(order, activeElement);

      const nextElementIndex = this._getItemIndex(nextElement);

      const isCycling = Boolean(this._interval);
      const isNext = order === ORDER_NEXT;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;

      const eventDirectionName = this._orderToDirection(order);

      if (nextElement && nextElement.classList.contains(CLASS_NAME_ACTIVE$2)) {
        this._isSliding = false;
        return;
      }

      if (this._isSliding) {
        return;
      }

      const slideEvent = this._triggerSlideEvent(
        nextElement,
        eventDirectionName
      );

      if (slideEvent.defaultPrevented) {
        return;
      }

      if (!activeElement || !nextElement) {
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      this._activeElement = nextElement;

      const triggerSlidEvent = () => {
        EventHandler.trigger(this._element, EVENT_SLID, {
          relatedTarget: nextElement,
          direction: eventDirectionName,
          from: activeElementIndex,
          to: nextElementIndex,
        });
      };

      if (this._element.classList.contains(CLASS_NAME_SLIDE)) {
        nextElement.classList.add(orderClassName);
        reflow(nextElement);
        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);

        const completeCallBack = () => {
          nextElement.classList.remove(directionalClassName, orderClassName);
          nextElement.classList.add(CLASS_NAME_ACTIVE$2);
          activeElement.classList.remove(
            CLASS_NAME_ACTIVE$2,
            orderClassName,
            directionalClassName
          );
          this._isSliding = false;
          setTimeout(triggerSlidEvent, 0);
        };

        this._queueCallback(completeCallBack, activeElement, true);
      } else {
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        this._isSliding = false;
        triggerSlidEvent();
      }

      if (isCycling) {
        this.cycle();
      }
    }

    _directionToOrder(direction) {
      if (![DIRECTION_RIGHT, DIRECTION_LEFT].includes(direction)) {
        return direction;
      }

      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }

      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }

    _orderToDirection(order) {
      if (![ORDER_NEXT, ORDER_PREV].includes(order)) {
        return order;
      }

      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }

      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }

    static carouselInterface(element, config) {
      const data = Carousel.getOrCreateInstance(element, config);
      let { _config } = data;

      if (typeof config === "object") {
        _config = { ..._config, ...config };
      }

      const action = typeof config === "string" ? config : _config.slide;

      if (typeof config === "number") {
        data.to(config);
      } else if (typeof action === "string") {
        if (typeof data[action] === "undefined") {
          throw new TypeError(`No method named "${action}"`);
        }

        data[action]();
      } else if (_config.interval && _config.ride) {
        data.pause();
        data.cycle();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Carousel.carouselInterface(this, config);
      });
    }

    static dataApiClickHandler(event) {
      const target = getElementFromSelector(this);

      if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
        return;
      }

      const config = {
        ...Manipulator.getDataAttributes(target),
        ...Manipulator.getDataAttributes(this),
      };
      const slideIndex = this.getAttribute("data-bs-slide-to");

      if (slideIndex) {
        config.interval = false;
      }

      Carousel.carouselInterface(target, config);

      if (slideIndex) {
        Carousel.getInstance(target).to(slideIndex);
      }

      event.preventDefault();
    }
  }
  EventHandler.on(
    document,
    EVENT_CLICK_DATA_API$5,
    SELECTOR_DATA_SLIDE,
    Carousel.dataApiClickHandler
  );
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);

    for (let i = 0, len = carousels.length; i < len; i++) {
      Carousel.carouselInterface(
        carousels[i],
        Carousel.getInstance(carousels[i])
      );
    }
  });
});
