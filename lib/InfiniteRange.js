/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Motion, presets, spring } from 'react-motion';

/*::
import type {Element} from 'react';
*/

export const numericValueFromEvent = ({
  target: { value }
}: SyntheticInputEvent<>): number => parseInt(value, 10);

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

type InfiniteRangeInputState = {
  max: number,
  min: number,
  value: number
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

const animationPreset = { ...presets.wobbly, precision: 10000 };

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

  static initialState({
    chunkSize,
    ceiling,
    floor,
    defaultValue
  }: InfiniteRangeProps): InfiniteRangeState {
    let initialValue = defaultValue;

    if (defaultValue < floor) {
      initialValue = floor;
    } else if (ceiling < defaultValue) {
      initialValue = ceiling;
    }

    return chunkSize < defaultValue
      ? InfiniteRange.update(
          { chunkSize, floor },
          {
            value: initialValue,
            min: initialValue - chunkSize,
            max: initialValue + chunkSize,
            animate: false
          }
        )
      : {
          value: initialValue,
          min: floor,
          max: chunkSize,
          animate: false
        };
  }

  // Calculates the next position after the change.
  static update(
    { chunkSize, floor }: { chunkSize: number, floor: number },
    state: InfiniteRangeState
  ) {
    const { value, max, min, ...rest } = state;

    if (value === max) {
      let nextMin = value - chunkSize;
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value + chunkSize,
        ...rest
      };
    } else if (value === min) {
      let nextMin = value - chunkSize;
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value === floor ? chunkSize : value + chunkSize,
        ...rest
      };
    }

    return state;
  }

  static externalStateUpdate(props) {
    return {
      ...InfiniteRange.initialState({
        ...props,
        defaultValue: props.value
      }),
      animate: true
    };
  }

  static getDerivedStateFromProps(
    props: InfiniteRangeProps,
    state: InfiniteRangeState
  ) {
    if (props.value !== state.value) {
      return { ...InfiniteRange.externalStateUpdate(props), animate: true };
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
    const nextState = InfiniteRange.update(this.props, this.state);
    this.setState({ ...nextState, animate: this.state.max !== nextState.max });
  };

  fn = (val: number, key: string) =>
    snapIfWithinOffset(Math.round(val), this.state[key], 1000);

  renderChildren = (interpolatedStyle: InfiniteRangeInputState) => {
    let inputState = this.state;

    // Make the slider thumb snap to the value, when it gets too close.
    if (this.state.animate) {
      inputState = mapObject(this.fn, interpolatedStyle);
    }

    return this.props.children({
      step: this.props.step,
      onInput: this.change,
      onMouseUp: this.changeEnd,
      ...inputState
    });
  };

  stopAnimating = () => this.setState({ animate: false });

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
