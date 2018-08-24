# react-infinite-range [![Build Status](https://travis-ci.org/halfzebra/react-infinite-range.svg?branch=master)](https://travis-ci.org/halfzebra/react-infinite-range) [![npm version](https://badge.fury.io/js/react-infinite-range.svg)](https://badge.fury.io/js/react-infinite-range)

React Component for creating infinite range inputs.

<img width="250px" alt="react-infinite-range example" src="https://user-images.githubusercontent.com/3983879/44298581-eb148080-a2e5-11e8-9ce0-f1cd50297fcc.gif">

## API Docs

### `<InfiniteRange>`

#### Usage

### [Uncontrolled](https://reactjs.org/docs/uncontrolled-components.html)

```js
import { InfiniteRange } from 'react-infinite-range'
// In your render:
<InfiniteRange
  floor={100}
  ceiling={1000000000}
  step={100}
  chunkSize={500000}
  defaultValue={100}
>
  {props => <input type="range" { ...props } />}
</InfiniteRange>
```

### [Controlled](https://reactjs.org/docs/forms.html#controlled-components)

[InfiniteRange](/lib/InfiniteRange) owns the state of the input component and derives it from props. This is a design decision to hide implementation details from the consumer. Read more in [You Probably Don't Need Derived State](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

#### Props

##### children: (state: InfiniteRangeInputState & InfiniteRangeChildProps) => Element<*>

Required function.

##### floor: number

Lower boundary for the input, you might think of it as `min` for traditional HTML range input.

##### ceiling: number

Upper boundary for the input, you might think of it as `max` for traditional HTML range input.

##### step: number

An equivalent of `step` for traditional HTML range input.

##### chunkSize: number

##### onChange: (value: number) => void

##### onInput: (value: number) => void

##### defaultValue: number

##### value: number
