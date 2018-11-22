export const numericValueFromEvent = ({
  target: { value }
}: SyntheticInputEvent<>): number => parseInt(value, 10);
