# react-infinite-range [![Build Status](https://travis-ci.org/halfzebra/react-infinite-range.svg?branch=master)](https://travis-ci.org/halfzebra/react-infinite-range)

[Higher-Order Component](https://reactjs.org/docs/higher-order-components.html) for creating infinite range input.

<img width="250px" alt="react-infinite-range example" src="https://user-images.githubusercontent.com/3983879/44298581-eb148080-a2e5-11e8-9ce0-f1cd50297fcc.gif">

## Usage

### [Uncontrolled](https://reactjs.org/docs/uncontrolled-components.html)

```js
import { InfiniteRange } from 'react-infinite-range'

const Form = ({ updateInputState }) => (
    <InfiniteRange
      floor={100}
      ceiling={1000000000}
      step={100}
      chunkSize={500000}
      defaultValue={100}
      onInput={updateInputState}
    >
      {props => <input type="range" { ...props } />}
    </InfiniteRange>
)
```

### [Controlled](https://reactjs.org/docs/forms.html#controlled-components)

[InfiniteRange](/lib/InfiniteRange) owns the state of the input component. This is a design decision aimed on reduction of possible issues in situations, where you might want to update the state of the input directly. Read more in [You Probably Don't Need Derived State](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)
