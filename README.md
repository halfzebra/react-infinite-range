# react-infinite-range [![Build Status](https://travis-ci.org/halfzebra/react-infinite-range.svg?branch=master)](https://travis-ci.org/halfzebra/react-infinite-range)

## Usage

### Simple

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

### With external update

[InfiniteRange](/lib/InfiniteRange) owns the state of the input component. This is a design decision aimed on reduction of possible issues in situations, where you might want to update the state of the input directly. Read more in [You Probably Don't Need Derived State](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)
