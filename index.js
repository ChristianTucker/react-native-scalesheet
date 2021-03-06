import { Dimensions } from "react-native";

// Grab the window object from that native screen size.
const window = Dimensions.get("window");

// The vertical resolution of the screen.
const screenHeight = window.height;

// The horizontal resolution of the screen.
const screenWidth = window.width;

// The average resolution of common devices, based on a ~5" mobile screen.
const baselineHeight = 680;

// An array of keys that should be ignored by the create function.
const ignoredKeys = ["flex", "fontWeight", "elevation"];

// Scales the item based on the screen height and baselineHeight
function scale(value) {
  return Math.floor(screenHeight / baselineHeight * value);
}

// Scale the items in an array.
function scaleArray(array) {
  const scaledArray = [];
  array.forEach(item => {
    if (isNaN(item)) {
      scaledArray.push(scaleViewportOrDefault(item));
    } else {
      scaledArray.push(scale(item));
    }
  });
  return array;
}

// Recursively scale the object if the ignore property is not set.
function scaleObject(styleValue) {
  const { ignored, value } = styleValue;
  if (ignored) return value;
  return create(styleValue);
}

// Check to see if an item that is not a number is a viewport scaling call (ie. 100vw or 100vh)
// if it is then return the appropriate value based on screen width or height,
// if it is not then return the default value passed to the component.
function scaleViewportOrDefault(styleValue) {
  if (typeof styleValue === "string" && styleValue.length > 2) {
    const suffix = styleValue.substring(styleValue.length - 2);
    const string = styleValue.substring(0, styleValue.length - 2);
    const value = isNaN(string) ? false : Number(string);

    if (value !== false && suffix === "vw") {
      return value / 100 * screenWidth;
    } else if (value !== false && suffix === "vh") {
      return value / 100 * screenHeight;
    } else {
      return styleValue;
    }
  } else {
    return styleValue;
  }
}

// Creates a new ScaleSheet and returns the value.
function create(styles) {
  const scaledStyles = {};
  for (var key in styles) {
    const styleValue = styles[key];
    if (ignoredKeys.includes(key)) {
      scaledStyles[key] = styleValue;
      continue;
    }

    if (typeof styleValue === "object") {
      if (Array.isArray(styleValue)) {
        scaledStyles[key] = scaleArray(styleValue);
      } else {
        scaledStyles[key] = scaleObject(styleValue);
      }
    } else if (!isNaN(styleValue)) {
      let scaledValue = scale(styleValue);
      if (key === "borderWidth" && styleValue > 0) {
        scaledValue = Math.max(1, scaledValue);
      }
      scaledStyles[key] = scaledValue;
    } else if (isNaN(styleValue)) {
      scaledStyles[key] = scaleViewportOrDefault(styleValue);
    }
  }
  return scaledStyles;
}

// Obtains a percentage value of the screens current width
function getScreenWidth(percentage = 100) {
  return screenWidth * (percentage / 100);
}

// Obtains a percentage value of the screens current height
function getScreenHeight(percentage = 100) {
  return screenHeight * (percentage / 100);
}

export default {
  scale,
  create,
  getScreenWidth,
  getScreenHeight
};
