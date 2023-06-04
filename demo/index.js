/**
 * Transfer
 * — — —
 * @file Transfers any elements from one place to another.
 * @copyright Vladimir Vavshchik, 2024
 * @version 1.0.0
 * @license MIT
 */

class Transfer {
  constructor(...objectsWithParameters) {
    if (objectsWithParameters.length === 0) {
      throw TypeError('at least one object with parameters must be specified for the constructor');
    }

    /**
     * The array is used in validation to avoid a situation where an object
     * with a source element that is already involved is specified.
     * — — —
     * It is also used in its own 'Transfer Simulation' technology
     * to generate a breakpoint object.
     */
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

    /**
     * For the 'Transfer Simulation' technology to work correctly, the
     * breakpoint triggers must be placed in a certain order. Since
     * the 'Desktop First' approach is used, the numeric breakpoint triggers
     * are sorted in descending order and at the very end 'default'.
     * — — —
     * This collection is also used to get a single breakpoint trigger
     * when the size of the observed element changes.
     */
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

    /**
     * The main internal storage of breakpoints, which is used by the 'Transfer
     * Simulation' technology, and is also involved in the mechanism
     * responsible for transferring the source elements when the size of the
     * observed element changes.
     */
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
             * to some extent they are temporary. Later, when the simulation
             * starts, new objects with correct data and order
             * will be generated.
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

    /**
     * The code block of the 'Transfer Simulation' technology.
     * — — —
     * It allows you to pre-form and seal the storage, which will then be used
     * for the main transfer at breakpoints when the size of the observed
     * element changes.
     * — — —
     * Also, at this stage, catching the latest errors is being completed.
     * This ensures that when the real transfer comes, there
     * will be no problems.
     */
    storageOfBreakpoints.forEach((breakpointObjects) => {
      /**
       * Sorting twice is done for a reason.
       * — — —
       * This sorting is necessary in case the user specified objects in
       * a chaotic order. Ideally, they should go in the order in which
       * the source elements are specified in the 'DOM', but we live in the
       * real world and all people are different, so we have to take
       * into account even such moments. Anyway, this is the least
       * of the problems.
       * — — —
       * Another issue is that the insertion of the source elements should
       * start from a smaller target position, not a larger one. So even if
       * the user specifies the objects in the correct order, it does not
       * guarantee that the first element will have a lower target position
       * than the second.
       */
      this.#sortBreakpointObjects(breakpointObjects);

      /**
       * Before inserting, we need to remove the original elements from
       * the 'DOM' in advance so that when searching for an element at the
       * target position, we get the one we need.
       * — — —
       * If the deletion took place in turn before each insertion, then this
       * would lead to the fact that the elements after insertion were not
       * in their positions.
       */
      this.#removeSourceElements(breakpointObjects);
      this.#insertSourceElements(breakpointObjects, true);

      /**
       * Clearing the array is necessary so that after the transfer we can fill
       * it with already new generated objects for each source element.
       * These objects will contain updated, accurate position information.
       * — — —
       * Sometimes, after some transfers, there are offsets of elements and the
       * position that the user specified no longer corresponds to reality.
       */
      breakpointObjects.length = 0;

      sourceElements.forEach((sourceElement) => {
        breakpointObjects.push(this.#generateBreakpointObject(
          sourceElement,
          true
        ));
      });

      /**
       * The offset of the elements was mentioned in the previous comment.
       * So it is because of him and some other cases that additional sorting
       * is performed. If it is not done, then after the actual transfer
       * begins, the insertion will be incorrect.
       * — — —
       * The user's objects are sorted first, and then the generated objects.
       * It is important to remember that the insertion order should always
       * start from a smaller target position to a larger one and nothing else.
       */
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

        /**
         * Similar actions have already been performed in the transfer
         * simulation, but they were used there in order to be able to
         * create new breakpoint objects.
         * — — —
         * In addition, there is no check for the maximum target position.
         */
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

        /**
         * Checking for the maximum target position is only necessary
         * at the time of the transfer simulation. If it is successful,
         * then it does not make sense to perform the check again when there
         * will be a transfer at breakpoints when the size of the
         * observed element changes.
         */
        if (hasCheckOfMaximumTargetPosition) {
          this.#throwExceptionIfMaximumTargetPositionIsExceeded(
            childElementsOfTargetElement,
            targetPosition
          );
        }

        const childElementOfTargetElement = childElementsOfTargetElement[
          targetPosition
        ];

        /**
         * If the target element has no child elements, then the source element
         * will simply be inserted into it. In all other cases,
         * the child element is retrieved based on the target position,
         * and then inserted in front of this element.
         */
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

    /**
     * The breakpoint object that the user specifies contains only
     * two properties ('targetElement' and 'targetPosition'). Therefore, when
     * we generate the 'default' breakpoint object, we also need two properties
     * and no more. But the 'Transfer Simulation' technology works
     * with a different structure, in which each breakpoint object
     * must contain a 'sourceElement'.
     */
    if (isComplete) {
      breakpointObject.sourceElement = sourceElement;
    }

    return breakpointObject;
  }
}
