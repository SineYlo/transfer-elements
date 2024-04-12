/**
 * @file Moves elements from one place to another.
 * @copyright SineYlo, 2024
 * @version 2.0.0
 * @license MIT
 */

class TransferElements {
  constructor(...objects_with_parameters) {
    if (objects_with_parameters.length === 0) {
      throw TypeError('at least one object with parameters must be specified for the constructor');
    }

    const source_elements = [];

    const validated_objects_with_parameters = objects_with_parameters.map(
      (object_with_parameters) => {
        if (
          this.#get_object_type(object_with_parameters) !== '[object Object]'
        ) {
          throw TypeError(`the arguments specified for the constructor must be objects of type 'Object'`);
        }

        ['source_element', 'breakpoints'].forEach((parameter_key) => {
          if (!(Object.hasOwn(object_with_parameters, parameter_key))) {
            throw TypeError(`the '${parameter_key}' parameter is not specified for the main object`);
          }
        });

        const { source_element, breakpoints } = object_with_parameters;

        if (!(source_element instanceof Element)) {
          throw TypeError(`the value specified for the 'source_element' parameter must be an object of type 'Element'`);
        }

        if (source_elements.includes(source_element)) {
          throw TypeError(`there can only be one object in the constructor with such a 'source_element': '${source_element.cloneNode().outerHTML}'`);
        }

        source_elements.push(source_element);

        object_with_parameters.breakpoints = this.#assemble_breakpoints(
          breakpoints,
          source_element
        );

        return object_with_parameters;
      }
    );

    const sorted_breakpoint_triggers = [...(
      validated_objects_with_parameters.reduce(
        (collection, { breakpoints }) => {
          Object.keys(breakpoints).forEach((breakpoint_trigger) => {
            if (Number(breakpoint_trigger)) {
              collection.add(breakpoint_trigger);
            }
          });

          return collection;
        },

        new Set()
      ).add('default')
    )].sort((a, b) => b - a);

    const storage_of_breakpoints = sorted_breakpoint_triggers.reduce(
      (storage, breakpoint_trigger) => {
        storage.set(breakpoint_trigger, []);

        return storage;
      },

      new Map()
    );

    validated_objects_with_parameters.forEach(
      ({ source_element, breakpoints }) => {
        Object.entries(breakpoints).forEach(
          ([breakpoint_trigger, { target_element, target_position }]) => {
            /**
             * Each breakpoint object in the internal storage must contain
             * three properties ('source_element', 'target_element'
             * and 'target_position'). This is necessary in order to be able
             * to consider the breakpoint as an independent part of the rest.
             * Thanks to this, we can avoid sequential transfer.
             * ——————————————————————————————————————————————————
             * At this stage, objects are added in a chaotic manner, and
             * to some extent they are temporary.
             */
            storage_of_breakpoints.get(breakpoint_trigger).push({
              source_element,
              target_element,
              target_position
            });
          }
        );
      }
    );

    storage_of_breakpoints.forEach((breakpoint_objects) => {
      this.#sort_breakpoint_objects(breakpoint_objects);

      this.#remove_source_elements(breakpoint_objects);
      this.#insert_source_elements(breakpoint_objects, true);

      breakpoint_objects.length = 0;

      source_elements.forEach((source_element) => {
        breakpoint_objects.push(this.#generate_breakpoint_object(
          source_element,
          true
        ));
      });

      this.#sort_breakpoint_objects(breakpoint_objects);
    });

    let previous_breakpoint_trigger = 'default';

    const resize_observer = new ResizeObserver(
      ([{ borderBoxSize: [{ inlineSize }], target }]) => {
        /**
         * It is important to check the scrollbar before transferring
         * the source element, and if it is present, then get its width and add
         * it to the width of the observed element. If this is not done,
         * the transfer will be performed before what is necessary.
         */
        const current_width = inlineSize + this.#get_scrollbar_width(target);

        const current_breakpoint_trigger = this.#get_breakpoint_trigger(
          sorted_breakpoint_triggers,
          current_width
        );

        /**
         * One of the optimizations that makes sure that the transfer is not
         * performed continuously with each change in the size of the observed
         * element, but only if the current breakpoint trigger differs from
         * the previous one. That is, if the user's screen dimensions fall under
         * the 'default' breakpoint trigger, then the code inside will
         * never be executed.
         */
        if (previous_breakpoint_trigger !== current_breakpoint_trigger) {
          const breakpoint_objects = storage_of_breakpoints.get(
            current_breakpoint_trigger
          );

          this.#remove_source_elements(breakpoint_objects);
          this.#insert_source_elements(breakpoint_objects, false);

          previous_breakpoint_trigger = current_breakpoint_trigger;
        }
      }
    );

    resize_observer.observe(document.documentElement);
  }

  #assemble_breakpoints(breakpoints, source_element) {
    if (this.#get_object_type(breakpoints) !== '[object Object]') {
      throw TypeError(`the value specified for the 'breakpoints' parameter must be an object of type 'Object'`);
    }

    const breakpoint_entries = Object.entries(breakpoints);

    if (breakpoint_entries.length === 0) {
      throw TypeError(`at least one breakpoint must be specified for the 'breakpoints' object`);
    }

    const validated_breakpoints = Object.fromEntries(
      breakpoint_entries.map(
        ([breakpoint_trigger, breakpoint_object]) => {
          const breakpoint_trigger_as_number = Number(breakpoint_trigger);

          if (
            !breakpoint_trigger_as_number ||
            breakpoint_trigger_as_number <= 0 ||
            breakpoint_trigger_as_number > Number.MAX_SAFE_INTEGER
          ) {
            throw RangeError(`the breakpoint trigger must be a safe (integer or fractional) number greater than zero`);
          }

          if (this.#get_object_type(breakpoint_object) !== '[object Object]') {
            throw TypeError(`the breakpoint object must be of type 'Object'`);
          }

          if (!Object.hasOwn(breakpoint_object, 'target_element')) {
            throw TypeError(`the 'target_element' parameter is not specified for the breakpoint object`);
          }

          const { target_element, target_position } = breakpoint_object;

          if (!(target_element instanceof Element)) {
            throw TypeError(`the value specified for the 'target_element' parameter must be an object of type 'Element'`);
          }

          if (source_element === target_element) {
            throw TypeError(`the value specified for the 'target_element' parameter must be different from the value specified for the 'source_element' parameter`);
          }

          if (this.#is_target_element_descendant_of_source_element(
            target_element, source_element
          )) {
            throw TypeError(`the element that is specified as the value for the 'target_element' parameter must not be a descendant of the element specified as the value for the 'source_element' parameter`);
          }

          if (this.#is_tag_of_target_element_self_closing(target_element)) {
            throw TypeError(`the element specified as the value for the 'target_element' parameter must be a paired tag`);
          }

          if (Object.hasOwn(breakpoint_object, 'target_position')) {
            if (typeof target_position !== 'number') {
              throw TypeError(`the value specified for the 'target_position' parameter must be of type 'number'`);
            }

            if (target_position < 0 || !Number.isSafeInteger(target_position)) {
              throw RangeError(`the number specified as the value for the 'target_position' parameter must be a non-negative safe integer`);
            }
          }

          return [
            breakpoint_trigger_as_number,
            {
              target_position: target_position ?? 0,

              ...breakpoint_object
            }
          ];
        }
      )
    );

    /**
     * The 'default' breakpoint is needed in order to be able to return
     * the source element to the position from which the first
     * transfer was made.
     */
    validated_breakpoints.default = this.#generate_breakpoint_object(
      source_element,
      false
    );

    return validated_breakpoints;
  }

  #get_child_elements_of_target_element(target_element) {
    return target_element.children;
  }

  #get_breakpoint_trigger(breakpoint_triggers, current_width) {
    /**
     * Since the 'Desktop First' approach is used by default, we check from
     * the smallest to the largest for the convenience of finding the nearest
     * breakpoint trigger. At the same time, the collection of breakpoint
     * triggers is arranged in a different order, from larger to smaller.
     * ——————————————————————————————————————————————————
     * In addition, we should also skip the 'default' located at the very end.
     * Therefore, the search starts with the penultimate breakpoint trigger.
     */
    for (let i = breakpoint_triggers.length - 2; i >= 0; --i) {
      const breakpoint_trigger = breakpoint_triggers[i];

      if (current_width <= breakpoint_trigger) {
        return breakpoint_trigger;
      }
    }

    return 'default';
  }

  #get_scrollbar_width(observable_element) {
    const available_screen_width = window.screen.availWidth;
    const width_of_observable_element = observable_element.clientWidth;

    let scrollbar_width = 0;

    if (width_of_observable_element !== available_screen_width) {
      scrollbar_width += available_screen_width - width_of_observable_element;
    }

    return scrollbar_width;
  }

  #get_object_type(object) {
    return Object.prototype.toString.call(object);
  }

  #is_target_element_descendant_of_source_element(
    target_element,
    source_element
  ) {
    while (target_element = target_element.parentElement) {
      if (target_element === source_element) {
        return true;
      }
    }

    return false;
  }

  #is_tag_of_target_element_self_closing(target_element) {
    return !new RegExp(/<\/[a-zA-Z]+>$/).test(target_element.outerHTML);
  }

  #sort_breakpoint_objects(breakpoint_objects) {
    if (breakpoint_objects.length > 1) {
      breakpoint_objects.sort((a, b) => (
        a.target_position - b.target_position
      ));
    }
  }

  #remove_source_elements(breakpoint_objects) {
    breakpoint_objects.forEach(({ source_element }) => {
      source_element.remove();
    });
  }

  #insert_source_elements(
    breakpoint_objects,
    has_check_of_maximum_target_position
  ) {
    breakpoint_objects.forEach(
      ({ source_element, target_element, target_position }) => {
        const child_elements_of_target_element = (
          this.#get_child_elements_of_target_element(target_element)
        );

        if (has_check_of_maximum_target_position) {
          this.#throw_exception_if_maximum_target_position_is_exceeded(
            child_elements_of_target_element,
            target_position
          );
        }

        const child_element_of_target_element = (
          child_elements_of_target_element[target_position]
        );

        if (!child_element_of_target_element) {
          target_element.append(source_element);

          return;
        }

        child_element_of_target_element.before(source_element);
      }
    );
  }

  #throw_exception_if_maximum_target_position_is_exceeded(
    child_elements_of_target_element,
    target_position
  ) {
    const maximum_target_position = child_elements_of_target_element.length;

    if (target_position > maximum_target_position) {
      throw RangeError(`the number specified as the value for the 'target_position' parameter exceeds the maximum allowed value of '${maximum_target_position}'`);
    }
  }

  #generate_breakpoint_object(source_element, is_complete) {
    const parent_element_of_source_element = source_element.parentElement;

    const breakpoint_object = {
      target_element: parent_element_of_source_element,
      target_position: [
        ...parent_element_of_source_element.children
      ].findIndex(
        (child_element_of_source_element) => (
          child_element_of_source_element === source_element
        )
      )
    };

    if (is_complete) {
      breakpoint_object.source_element = source_element;
    }

    return breakpoint_object;
  }
}
