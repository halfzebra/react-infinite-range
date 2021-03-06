import { InfinteRangeTransitions } from './InfiniteRangeTransitions';

describe('init', () => {
  it('should reset value to floor if it is smaller', () => {
    expect(
      InfinteRangeTransitions.init({
        chunkSize: 500000,
        floor: 100,
        defaultValue: 0
      })
    ).toMatchObject({ value: 100, max: 500000, min: 100 });
  });

  it('should reset value to ceiling if it is larger', () => {
    expect(
      InfinteRangeTransitions.init({
        ceiling: 1000000000,
        defaultValue: 1000000000 + 1
      })
    ).toMatchObject({ value: 1000000000 });
  });

  it('should produce the initial state with min, max and value', () => {
    expect(
      InfinteRangeTransitions.init({
        defaultValue: 100,
        floor: 100,
        chunkSize: 500000
      })
    ).toMatchObject({ max: 500000, min: 100, value: 100 });
  });

  it('should produce correct state if value is smaller than `chunkSize`', () => {
    expect(
      InfinteRangeTransitions.init({
        defaultValue: 25000,
        floor: 100,
        chunkSize: 500000
      })
    ).toMatchObject({ max: 500000, min: 100, value: 25000 });
  });

  it('should produce correct state if value is larger than `chunkSize`', () => {
    expect(
      InfinteRangeTransitions.init({
        defaultValue: 500100,
        floor: 100,
        chunkSize: 500000
      })
    ).toMatchObject({ max: 1000100, min: 100, value: 500100 });
  });
});

describe('update', () => {
  const config = {
    ...InfinteRangeTransitions.defaultProps,
    value: 100,
    step: 100,
    floor: 100,
    ceiling: 1000000000,
    chunkSize: 500000
  };

  it('should changeEnd the state for displaying the next step', () => {
    expect(
      InfinteRangeTransitions.update(config, {
        value: 500000,
        max: 500000,
        min: 100
      })
    ).toEqual({ value: 500000, max: 1000000, min: 100 });
  });

  it('step back after one chunks forward', () => {
    expect(
      InfinteRangeTransitions.update(config, {
        value: 100,
        max: 1000000,
        min: 100
      })
    ).toEqual({
      value: 100,
      max: 500000,
      min: 100
    });
  });

  it('step back after two chunks forward', () => {
    expect(
      InfinteRangeTransitions.update(config, {
        value: 1000000,
        max: 2000000,
        min: 1000000
      })
    ).toEqual({
      value: 1000000,
      max: 1500000,
      min: 500000
    });
  });
});
