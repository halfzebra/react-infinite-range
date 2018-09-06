/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InfinteRangeTransitions } from './InfiniteRangeTransitions';
import type {
  InfiniteRangeInputState,
  InfiniteRangeConfiguration
} from './InfiniteRangeTransitions';
import { numericValueFromEvent } from './numericValueFromEvent';

/*::
import type {Element} from 'react';
*/

const noop = () => void null;

type InfiniteRangeChildProps = {
  step: number,
  onMouseUp: () => void,
  onInput: (e: number | SyntheticInputEvent<>) => void
};

type InfiniteRangeProps = {
  children: (
    state: InfiniteRangeInputState & InfiniteRangeChildProps
  ) => Element<*>,
  floor: number,
  ceiling: number,
  step: number,
  chunkSize: number,
  onChange: (value: number) => void,
  onInput: (value: number) => void,
  defaultValue: number,
  value: number
};

type InfiniteRangeState = InfiniteRangeInputState;

export class InfiniteRange extends Component<
  InfiniteRangeProps,
  InfiniteRangeState
> {
  static propTypes = {
    children: PropTypes.func.isRequired,
    floor: PropTypes.number,
    ceiling: PropTypes.number,
    step: PropTypes.number,
    chunkSize: PropTypes.number,
    onChange: PropTypes.func,
    onInput: PropTypes.func,
    defaultValue: PropTypes.number,
    value: PropTypes.number
  };

  static defaultProps = {
    floor: Number.MIN_SAFE_INTEGER,
    ceiling: Number.MAX_SAFE_INTEGER,
    step: 1,
    chunkSize: 100,
    onChange: noop,
    onInput: noop,
    defaultValue: 0,
    value: 0
  };

  static initialState = InfinteRangeTransitions.init;

  // Calculates the next position after the change.
  static update = InfinteRangeTransitions.update;

  static externalStateUpdate(
    props: InfiniteRangeConfiguration,
    state: InfiniteRangeInputState
  ) {
    if (props.value <= state.max && state.min <= props.value) {
      return {
        ...state,
        value: props.value
      };
    }

    return InfiniteRange.initialState({
      ...props,
      defaultValue: props.value
    });
  }

  static getDerivedStateFromProps(
    props: InfiniteRangeProps,
    state: InfiniteRangeState
  ) {
    if (props.value !== state.value && Number.isInteger(props.value)) {
      return InfiniteRange.externalStateUpdate(props, state);
    }

    return null;
  }

  // Intended to tick the range, when the pin in hitting one of the edges.
  static tick({ floor, step }: InfiniteRangeProps, state: InfiniteRangeState) {
    const { max, value, min } = state;

    if (floor === value) {
      return state;
    }

    if (max === value) {
      return {
        value: value + step,
        max: max + step
      };
    } else if (min === value) {
      return {
        value: value - step,
        min: min - step
      };
    }

    return state;
  }

  state = InfiniteRange.initialState(this.props);

  change = (event: number | SyntheticInputEvent<>) => {
    // Handle other types of range components, that don't emit events.
    let value: number =
      typeof event === 'number' ? event : numericValueFromEvent(event);
    this.props.onInput(value);
    this.setState({ ...this.state, value });
  };

  changeEnd = () => {
    this.props.onChange(this.state.value);
    this.setState(InfiniteRange.update(this.props, this.state));
  };

  render() {
    return this.props.children({
      step: this.props.step,
      onInput: this.change,
      onMouseUp: this.changeEnd,
      ...this.state
    });
  }
}
