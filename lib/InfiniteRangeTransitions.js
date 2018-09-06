export type InfiniteRangeConfiguration = {
  floor: number,
  ceiling: number,
  step: number,
  chunkSize: number,
  defaultValue: number,
  value: number
};

export type InfiniteRangeInputState = {
  max: number,
  min: number,
  value: number
};

const init = ({
  chunkSize,
  ceiling,
  floor,
  defaultValue
}: InfiniteRangeConfiguration): InfiniteRangeInputState => {
  let initialValue = defaultValue;

  if (defaultValue < floor) {
    initialValue = floor;
  } else if (ceiling < defaultValue) {
    initialValue = ceiling;
  }

  return chunkSize < defaultValue
    ? InfinteRangeTransitions.update(
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
};

const update = (
  { chunkSize, floor }: { chunkSize: number, floor: number },
  state: InfiniteRangeInputState
): InfiniteRangeInputState => {
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
};

export const InfinteRangeTransitions = {
  init,
  update
};
