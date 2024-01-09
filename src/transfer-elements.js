/**
 * @file Moves elements from one place to another.
 * @copyright SineYlo, 2024
 * @version 1.0.3
 * @license MIT
 */

class TransferElements {
  constructor(...objectsWithParameters) {
    if (objectsWithParameters.length === 0) {
      throw TypeError('at least one object with parameters must be specified for the constructor');
    }

    const sourceElements = [];

    const validatedObjectsWithParameters = objectsWithParameters.map(
      (objectWithParameters) => {
        if (this.#getObjectType(objectWithParameters) !== '[object Object]') {
          throw TypeError(`the arguments specified for the constructor must be objects of type 'Object'`);
        }

        ['sourceElement', 'breakpoints'].forEach((parameterKey) => {
          if (!(Object.hasOwn(objectWithParameters, parameterKey))) {
            throw TypeError(`the '${parameterKey}' parameter is not specified for the main object`);
          }
        });

        const { sourceElement, breakpoints } = objectWithParameters;

        if (!(sourceElement instanceof Element)) {
          throw TypeError(`the value specified for the 'sourceElement' parameter must be an object of type 'Element'`)
        }

        if (sourceElements.includes(sourceElement)) {
          throw TypeError(`there can only be one object in the constructor with such a 'sourceElement': '${sourceElement.cloneNode().outerHTML}'`);
        }

        sourceElements.push(sourceElement);

        objectWithParameters.breakpoints = this.#assembleBreakpoints(
          breakpoints,
          sourceElement
        );

        return objectWithParameters;
      }
    );

    const sortedBreakpointTriggers = [...(
      validatedObjectsWithParameters.reduce(
        (collection, validatedObjectWithParameters) => {
          Object.keys(validatedObjectWithParameters.breakpoints).forEach(
            (breakpointTrigger) => {
              if (Number(breakpointTrigger)) {
                collection.add(breakpointTrigger);
              }
            }
          );

          return collection;
        },

        new Set()
      ).add('default')
    )].sort((a, b) => b - a);

    const storageOfBreakpoints = sortedBreakpointTriggers.reduce(
      (storage, breakpointTrigger) => {
        storage.set(breakpointTrigger, []);

        return storage;
      },

      new Map()
    );

    validatedObjectsWithParameters.forEach(
      (validatedObjectWithParameters) => {
        Object.entries(validatedObjectWithParameters.breakpoints).forEach(
          ([breakpointTrigger, { targetElement, targetPosition }]) => {
            /**
             * Each breakpoint object in the internal storage must contain
             * three properties ('sourceElement', 'targetElement'
             * and 'targetPosition'). This is necessary in order to be able
             * to consider the breakpoint as an independent part of the rest.
             * Thanks to this, we can avoid sequential transfer.
             * — — —
             * At this stage, objects are added in a chaotic manner, and
             * to some extent they are temporary.
             */
            storageOfBreakpoints.get(breakpointTrigger).push({
              sourceElement: validatedObjectWithParameters.sourceElement,
              targetElement,
              targetPosition
            });
          }
        )
      }
    );

    storageOfBreakpoints.forEach((breakpointObjects) => {
      this.#sortBreakpointObjects(breakpointObjects);


      this.#removeSourceElements(breakpointObjects);
      this.#insertSourceElements(breakpointObjects, true);

      breakpointObjects.length = 0;

      sourceElements.forEach((sourceElement) => {
        breakpointObjects.push(this.#generateBreakpointObject(
          sourceElement,
          true
        ));
      });

      this.#sortBreakpointObjects(breakpointObjects);
    });

    let previousBreakpointTrigger = 'default';

    const resizeObserver = new ResizeObserver((resizeObserverEntries) => {
      const resizeObserverEntry = resizeObserverEntries[0];

      /**
       * It is important to check the scrollbar before transferring
       * the source element, and if it is present, then get its width and add
       * it to the width of the observed element. If this is not done,
       * the transfer will be performed before what is necessary.
       */
      const currentWidth = (
        resizeObserverEntry.borderBoxSize[
          0
        ].inlineSize + this.#getScrollbarWidth(resizeObserverEntry.target)
      );
      const currentBreakpointTrigger = this.#getBreakpointTrigger(
        sortedBreakpointTriggers,
        currentWidth
      );

      /**
       * One of the optimizations that makes sure that the transfer is not
       * performed continuously with each change in the size of the observed
       * element, but only if the current breakpoint trigger differs from
       * the previous one. That is, if the user's screen dimensions fall under
       * the 'default' breakpoint trigger, then the code inside will
       * never be executed.
       */
      if (previousBreakpointTrigger !== currentBreakpointTrigger) {
        const breakpointObjects = storageOfBreakpoints.get(
          currentBreakpointTrigger
        );

        this.#removeSourceElements(breakpointObjects);
        this.#insertSourceElements(breakpointObjects, false);

        previousBreakpointTrigger = currentBreakpointTrigger;
      }
    });

    resizeObserver.observe(document.documentElement);
  }

  #assembleBreakpoints(breakpoints, sourceElement) {
    if (this.#getObjectType(breakpoints) !== '[object Object]') {
      throw TypeError(`the value specified for the 'breakpoints' parameter must be an object of type 'Object'`);
    }

    const breakpointEntries = Object.entries(breakpoints);

    if (breakpointEntries.length === 0) {
      throw TypeError(`at least one 'breakpoint' parameter must be specified for the 'breakpoints' object`);
    }

    const validatedBreakpoints = Object.fromEntries(
      breakpointEntries.map(
        ([breakpointTrigger, breakpointObject]) => {
          const breakpointTriggerAsNumber = Number(breakpointTrigger);

          if (
            !breakpointTriggerAsNumber ||
            breakpointTriggerAsNumber <= 0 ||
            breakpointTriggerAsNumber > Number.MAX_SAFE_INTEGER
          ) {
            throw RangeError(`the 'breakpointTrigger' must be a safe (integer or fractional) number greater than zero`)
          }

          if (this.#getObjectType(breakpointObject) !== '[object Object]') {
            throw TypeError(`the 'breakpointObject' must be of type 'Object'`);
          }

          if (!Object.hasOwn(breakpointObject, 'targetElement')) {
            throw TypeError(`the 'targetElement' parameter is not specified for the 'breakpointObject'`);
          }

          const { targetElement, targetPosition } = breakpointObject;

          if (!(targetElement instanceof Element)) {
            throw TypeError(`the value specified for the 'targetElement' parameter must be an object of type 'Element'`)
          }

          if (sourceElement === targetElement) {
            throw TypeError(`the value specified for the 'targetElement' parameter must be different from the value specified for the 'sourceElement' parameter`);
          }

          if (this.#isTargetElementDescendantOfSourceElement(
            targetElement, sourceElement
          )) {
            throw TypeError(`the element that is specified as the value for the 'targetElement' parameter must not be a descendant of the element specified as the value for the 'sourceElement' parameter`);
          }

          if (this.#isTagSelfClosing(targetElement)) {
            throw TypeError(`the element specified as the value for the 'targetElement' parameter must be a paired tag`);
          }

          if (Object.hasOwn(breakpointObject, 'targetPosition')) {
            if (typeof targetPosition !== 'number') {
              throw TypeError(`the value specified for the 'targetPosition' parameter must be of type 'number'`);
            }

            if (targetPosition < 0 || !Number.isSafeInteger(targetPosition)) {
              throw RangeError(`the number specified as the value for the 'targetPosition' parameter must be a non-negative safe integer`);
            }
          }

          return [
            breakpointTriggerAsNumber,
            {
              targetPosition: targetPosition ?? 0,

              ...breakpointObject
            }
          ]
        }
      )
    );

    /**
     * The 'default' breakpoint is needed in order to be able to return
     * the source element to the position from which the first
     * transfer was made.
     */
    validatedBreakpoints.default = this.#generateBreakpointObject(
      sourceElement,
      false
    );

    return validatedBreakpoints;
  }

  #getChildElementsOfTargetElement(targetElement) {
    return targetElement.children;
  }

  #getBreakpointTrigger(breakpointTriggers, currentWidth) {
    /**
     * Since the 'Desktop First' approach is used by default, we check from
     * the smallest to the largest for the convenience of finding the nearest
     * breakpoint trigger. At the same time, the collection of breakpoint
     * triggers is arranged in a different order, from larger to smaller.
     * — — —
     * In addition, we should also skip the 'default' located at the very end.
     * Therefore, the search starts with the penultimate breakpoint trigger.
     */
    for (let i = breakpointTriggers.length - 2; i >= 0; --i) {
      const breakpointTrigger = breakpointTriggers[i];

      if (currentWidth <= breakpointTrigger) {
        return breakpointTrigger;
      }
    }

    return 'default';
  }

  #getScrollbarWidth(observableElement) {
    const availableScreenWidth = window.screen.availWidth;
    const widthOfObservableElement = observableElement.clientWidth;

    let scrollbarWidth = 0;

    if (widthOfObservableElement !== availableScreenWidth) {
      scrollbarWidth += availableScreenWidth - widthOfObservableElement;
    }

    return scrollbarWidth;
  }

  #getObjectType(object) {
    return Object.prototype.toString.call(object);
  }

  #isTargetElementDescendantOfSourceElement(targetElement, sourceElement) {
    while (targetElement = targetElement.parentElement) {
      if (targetElement === sourceElement) {
        return true;
      }
    }

    return false;
  }

  #isTagSelfClosing(targetElement) {
    return !new RegExp(/<\/[a-zA-Z]+>$/).test(targetElement.outerHTML);
  }

  #sortBreakpointObjects(breakpointObjects) {
    if (breakpointObjects.length > 1) {
      breakpointObjects.sort((a, b) => (
        a.targetPosition - b.targetPosition
      ))
    }
  }

  #removeSourceElements(breakpointObjects) {
    breakpointObjects.forEach(({sourceElement}) => {
      sourceElement.remove();
    });
  }

  #insertSourceElements(breakpointObjects, hasCheckOfMaximumTargetPosition) {
    breakpointObjects.forEach(
      ({ sourceElement, targetElement, targetPosition }) => {
        const childElementsOfTargetElement = (
          this.#getChildElementsOfTargetElement(targetElement)
        );

        if (hasCheckOfMaximumTargetPosition) {
          this.#throwExceptionIfMaximumTargetPositionIsExceeded(
            childElementsOfTargetElement,
            targetPosition
          );
        }

        const childElementOfTargetElement = childElementsOfTargetElement[
          targetPosition
        ];

        if (!childElementOfTargetElement) {
          targetElement.append(sourceElement);

          return;
        }

        childElementOfTargetElement.before(sourceElement);
      }
    )
  }

  #throwExceptionIfMaximumTargetPositionIsExceeded(
    childElementsOfTargetElement,
    targetPosition
  ) {
    const maximumTargetPosition = childElementsOfTargetElement.length;

    if (targetPosition > maximumTargetPosition) {
      throw RangeError(`the number specified as the value for the 'targetPosition' parameter exceeds the maximum allowed value of '${maximumTargetPosition}'`);
    }
  }

  #generateBreakpointObject(sourceElement, isComplete) {
    const parentElementOfSourceElement = sourceElement.parentElement;

    const breakpointObject = {
      targetElement: parentElementOfSourceElement,
      targetPosition: [
        ...parentElementOfSourceElement.children
      ].findIndex(
        (childElementOfSourceElement) => (
          childElementOfSourceElement === sourceElement
        )
      )
    };

    if (isComplete) {
      breakpointObject.sourceElement = sourceElement;
    }

    return breakpointObject;
  }
}
