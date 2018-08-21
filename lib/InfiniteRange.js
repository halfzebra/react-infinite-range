/* @flow */

/*::
import type {Element} from 'react';
export type ReactElement = Element<*>;
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Motion, presets, spring } from 'react-motion';

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

type Boo = {
  step: number,
  onMouseUp: () => void,
  onMouseDown: () => void,
  onInput: (e: number | SyntheticInputEvent<>) => void
};

type InfiniteRangeProps = {
  children: (state: InfiniteRangeState & Boo) => ReactElement,
  floor: number,
  ceiling: number,
  step: number,
  chunkSize: number,
  onChange: (value: number) => void,
  onInput: (value: number) => void,
  defaultValue: number,
  value: number
};

type InfiniteRangeState = {
  max: number,
  min: number,
  value: number
};

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
  }: InfiniteRangeProps) {
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
            max: initialValue + chunkSize
          }
        )
      : {
          value: initialValue,
          min: floor,
          max: chunkSize
        };
  }

  // Calculates the next position after the change.
  static update(
    { chunkSize, floor }: { chunkSize: number, floor: number },
    state: InfiniteRangeState
  ) {
    const { value, max, min } = state;

    if (value === max) {
      let nextMin = value - chunkSize;
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value + chunkSize
      };
    } else if (value === min) {
      let nextMin = value - chunkSize;
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value === floor ? chunkSize : value + chunkSize
      };
    }

    return state;
  }

  static getDerivedStateFromProps(
    props: InfiniteRangeProps,
    state: InfiniteRangeState
  ) {
    if (props.value !== state.value) {
      return InfiniteRange.initialState({
        ...props,
        defaultValue: props.value
      });
    }

    return null;
  }

  // Intended to tick the range, when the pin in hitting one of the edges.
  static tick({ floor, step }: InfiniteRangeProps, state: InfiniteRangeState) {
    const { max, value, min, ...rest } = state;

    if (floor === value) {
      return state;
    }

    if (max === value) {
      return {
        ...rest,
        value: value + step,
        max: max + step
      };
    } else if (min === value) {
      return {
        ...rest,
        value: value - step,
        min: min - step
      };
    }

    return state;
  }

  state = InfiniteRange.initialState(this.props);

  isChanging: boolean = false;

  changeBegin = () => {
    this.isChanging = true;
  };

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
    this.isChanging = false;
  };

  render() {
    return (
      <Motion
        style={{
          min: spring(this.state.min, presets.noWobble),
          max: spring(this.state.max, presets.noWobble)
        }}
      >
        {interpolatedStyle => {
          let inputProps = this.state;

          if (this.isChanging === false) {
            // Round the interpolated values, because input[type="range"] does not operate on Floats.
            const interpolatedRoundedStyle = mapObject(
              (x: number): number => Math.round(x),
              interpolatedStyle
            );

            // Make the slider thumb snap to the value, when it gets too close.
            inputProps = {
              value: this.state.value,
              min: snapIfWithinOffset(
                interpolatedRoundedStyle.min,
                this.state.min,
                10
              ),
              max: snapIfWithinOffset(
                interpolatedRoundedStyle.max,
                this.state.max,
                10
              )
            };
          }

          return this.props.children({
            step: this.props.step,
            onMouseDown: this.changeBegin,
            onInput: this.change,
            onMouseUp: this.changeEnd,
            ...inputProps
          });
        }}
      </Motion>
    );
  }
}
