import { RefObject } from "react";

const useDropdownPosition = (
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>
) => {
  const getDropdownPosition = () => {
    if (!ref.current) {
      return {
        top: 0,
        left: 0,
      };
    }

    const rect = ref.current.getBoundingClientRect();
    const dropdownWidth = 240; // width of dropdown (w-60 = 15rem = 240px)

    // calculate initial position
    let left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY;

    // check if dropdown would go off right edge of viewport
    if (left + dropdownWidth > window.innerWidth) {
      left = rect.right + window.scrollX - dropdownWidth;

      // if still off-screen, align to right edge of viewport
      // with some padding
      if (left < 0) {
        left = window.innerWidth - dropdownWidth - 16;
      }
    }

    // ensure dropdown doesn't go off left edge
    if (left < 0) {
      left = 16;
    }

    return {
      top,
      left,
    };
  };

  return { getDropdownPosition };
};

export { useDropdownPosition };
