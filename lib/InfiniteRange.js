import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Motion, presets, spring } from 'react-motion'

export const numericValueFromEvent = ({ target: { value } }) =>
  parseInt(value, 10)

const noop = () => void null

export class InfiniteRange extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    floor: PropTypes.number,
    ceiling: PropTypes.number,
    step: PropTypes.number,
    chunkSize: PropTypes.number,
    onChange: PropTypes.func,
    onInput: PropTypes.func,
    value: PropTypes.number
  }

  static defaultProps = {
    floor: Number.MIN_SAFE_INTEGER,
    ceiling: Number.MAX_SAFE_INTEGER,
    step: 1,
    chunkSize: 100,
    onChange: noop,
    onInput: noop,
    value: 0
  }

  static initialState({ chunkSize, ceiling, floor, defaultValue }) {
    let initialValue = defaultValue

    if (defaultValue < floor) {
      initialValue = floor
    } else if (ceiling < defaultValue) {
      initialValue = ceiling
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
        }
  }

  // Calculates the next position after the change.
  static update({ chunkSize, floor }, state) {
    const { value, max, min } = state

    if (value === max) {
      let nextMin = value - chunkSize
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value + chunkSize
      }
    } else if (value === min) {
      let nextMin = value - chunkSize
      return {
        value,
        min: nextMin < floor ? floor : nextMin,
        max: value === floor ? chunkSize : value + chunkSize
      }
    }

    return state
  }

  // Intended to tick the range, when the pin in hitting one of the edges.
  static tick({ floor, step }, state) {
    const { max, value, min, ...rest } = state

    if (floor === value) {
      return state
    }

    if (max === value) {
      return {
        ...rest,
        value: value + step,
        max: max + step
      }
    } else if (min === value) {
      return {
        ...rest,
        value: value - step,
        min: min - step
      }
    }

    return state
  }

  state = InfiniteRange.initialState(this.props)

  isChanging = false

  changeBegin = () => {
    this.isChanging = true
  }

  change = event => {
    // Handle other types of range components, that don't emit events.
    let value = Number.isInteger(event) ? event : numericValueFromEvent(event)
    this.props.onInput(value)
    this.setState({ ...this.state, value })
  }

  changeEnd = () => {
    this.props.onChange(this.value)
    this.setState(InfiniteRange.update(this.props, this.state))
    this.isChanging = false
  }

  externalUpdate = value => {
    this.setState(
      InfiniteRange.initialState({ ...this.props, defaultValue: value })
    )
  }

  render() {
    return (
      <Motion
        style={{
          min: spring(this.state.min, presets.noWobble),
          max: spring(this.state.max, presets.noWobble)
        }}
      >
        {interpolatedStyle => {
          let inputProps = this.state

          if (this.isChanging === false) {
            // Round the interpolated values, because input[type="range"] does not operate on Floats.
            const interpolatedRoundedStyle = mapObject(
              x => Math.round(x),
              interpolatedStyle
            )

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
            }
          }

          return this.props.children({
            step: this.props.step,
            onMouseDown: this.changeBegin,
            onInput: this.change,
            onMouseUp: this.changeEnd,
            ...inputProps
          })
        }}
      </Motion>
    )
  }
}

/**
 * Return `target` if the distance from `current` is smaller than `offset`
 *
 * @param target
 * @param offset
 * @return {*}
 */
const snapIfWithinOffset = (current, target, offset) => {
  return Math.abs(target - current) > offset ? current : target
}

const mapObject = (fn, object) => {
  let result = {}
  for (let key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      result[key] = fn(object[key], key)
    }
  }
  return result
}
