import { parseAsBoolean, useQueryStates } from "nuqs";

const useCheckoutStates = () => {
  return useQueryStates({
    success: parseAsBoolean
      .withDefault(false)
      .withOptions({ clearOnDefault: true }),
    cancel: parseAsBoolean
      .withDefault(false)
      .withOptions({ clearOnDefault: true }),
  });
};

export { useCheckoutStates };
