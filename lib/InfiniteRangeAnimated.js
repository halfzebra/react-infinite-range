/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Motion, presets, spring } from 'react-motion';
import { InfinteRangeTransitions } from './InfiniteRangeTransitions';
import type {
  InfiniteRangeInputState,
  InfiniteRangeConfiguration
} from './InfiniteRangeTransitions';
import { numericValueFromEvent } from './numericValueFromEvent';

/*::
import type {Element} from 'react';
*/

const snapIfWithinOffset = (
  current: number,
  target: number,
  offset: number
): number => {
  return Math.abs(target - current) > offset ? current : target;
};

function mapObject<A, B>(
  fn: (obj: A, key: string) => B,
  object: { [string]: A }
): { [string]: B } {
  let result = {};
  for (let key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      result[key] = fn(object[key], key);
    }
  }
  return result;
}

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

type InfiniteRangeState = { animate: boolean } & InfiniteRangeInputState;

const animationPreset = { ...presets.noWobble, precision: 10000 };

const on = state => ({ ...state, animate: true });

const off = state => ({ ...state, animate: false });

const branch = (state, animate: boolean) => ({ ...state, animate });

const Animate = {
  on,
  off,
  branch
};

export class InfiniteRangeAnimated extends Component<
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
      return Animate.on({
        ...state,
        value: props.value
      });
    }

    return Animate.on({
      ...InfiniteRangeAnimated.initialState({
        ...props,
        defaultValue: props.value
      })
    });
  }

  static getDerivedStateFromProps(
    props: InfiniteRangeProps,
    state: InfiniteRangeState
  ) {
    if (props.value !== state.value && Number.isInteger(props.value)) {
      return InfiniteRangeAnimated.externalStateUpdate(props, state);
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

  state = Animate.off(InfiniteRangeAnimated.initialState(this.props));

  change = (event: number | SyntheticInputEvent<>) => {
    // Handle other types of range components, that don't emit events.
    let value: number =
      typeof event === 'number' ? event : numericValueFromEvent(event);
    this.props.onInput(value);
    this.setState({ ...this.state, value });
  };

  changeEnd = () => {
    this.props.onChange(this.state.value);
    const nextState = InfiniteRangeAnimated.update(this.props, this.state);
    this.setState(Animate.branch(nextState, this.state.max !== nextState.max));
  };

  fn = (val: number, key: string) =>
    snapIfWithinOffset(Math.round(val), this.state[key], 1000);

  renderChildren = (interpolatedStyle: InfiniteRangeInputState) => {
    const { animate, min, max, value } = this.state;
    let inputState = { min, max, value };

    // Make the slider thumb snap to the value, when it gets too close.
    if (animate) {
      inputState = mapObject(this.fn, interpolatedStyle);
    }

    return this.props.children({
      step: this.props.step,
      onInput: this.change,
      onMouseUp: this.changeEnd,
      ...inputState
    });
  };

  stopAnimating = () => this.setState(Animate.off);

  render() {
    return (
      <Motion
        onRest={this.stopAnimating}
        style={{
          value: spring(this.state.value, animationPreset),
          min: spring(this.state.min, animationPreset),
          max: spring(this.state.max, animationPreset)
        }}
      >
        {this.renderChildren}
      </Motion>
    );
  }
}
