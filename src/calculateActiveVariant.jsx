import crc32 from 'fbjs/lib/crc32';
import emitter from './emitter';
import store from './store';

const calculateVariant = (experimentName, userIdentifier) => {
  /*

    Choosing a weighted variant:
      For C, A, B with weights 2, 4, 8

      variants = A, B, C
      weights = 4, 8, 2
      weightSum = 14
      weightedIndex = 9

      AAAABBBBBBBBCC
      ========^
      Select B

    */

  // Sorted array of the variant names, example: ["A", "B", "C"]
  const variants = emitter.getSortedVariants(experimentName);
  // Array of the variant weights, also sorted by variant name. For example, if
  // variant C had weight 2, variant A had weight 4, and variant B had weight 8
  // return [4, 8, 2] to correspond with ["A", "B", "C"]
  const weights = emitter.getSortedVariantWeights(experimentName);
  // Sum the weights
  const weightSum = weights.reduce((a, b) => {
    return a + b;
  }, 0);
  // A random number between 0 and weightSum
  let weightedIndex =
    typeof userIdentifier === 'string'
      ? Math.abs(crc32(userIdentifier) % weightSum)
      : Math.floor(Math.random() * weightSum);
  // Iterate through the sorted weights, and deduct each from the weightedIndex.
  // If weightedIndex drops < 0, select the variant. If weightedIndex does not
  // drop < 0, default to the last variant in the array that is initially assigned.
  let selectedVariant = variants[variants.length - 1];
  for (let index = 0; index < weights.length; index++) {
    weightedIndex -= weights[index];
    if (weightedIndex < 0) {
      selectedVariant = variants[index];
      break;
    }
  }
  emitter.setActiveVariant(experimentName, selectedVariant);
  return selectedVariant;
};

export default (experimentName, userIdentifier, defaultVariantName) => {
  if (typeof userIdentifier === 'string') {
    return calculateVariant(experimentName, userIdentifier);
  }
  const activeValue = emitter.getActiveVariant(experimentName);
  if (typeof activeValue === 'string') {
    return activeValue;
  }
  const storedValue = store.getItem('PUSHTELL-' + experimentName);
  if (typeof storedValue === 'string') {
    emitter.setActiveVariant(experimentName, storedValue, true);
    return storedValue;
  }
  if (typeof defaultVariantName === 'string') {
    emitter.setActiveVariant(experimentName, defaultVariantName);
    return defaultVariantName;
  }
  return calculateVariant(experimentName);
};
