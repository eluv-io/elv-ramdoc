const curry = require('crocks/helpers/curry')

const boolsToInt = require('./boolsToInt')

/**
 * Returns an item from an array of choices, making the choice based on a separate array of booleans.
 *
 * Used to express multilevel if-then control flows in a more functional style.
 *
 * @function
 * @curried
 * @since v0.0.1
 * @category Functional
 * @sig [*] -> [Boolean] -> *
 * @param {Array} choiceArray An array of items to choose from
 * @param {Boolean[]} boolArray An array of booleans used to determine which element to return from choiceArray
 * @returns {Any}
 * @example
 *
 * // Given the following table:
 *
 * // | isChild | isMale | result  |
 * // |---------|--------|---------|
 * // |    F    |    F   | 'woman' |
 * // |    F    |    T   |  'man'  |
 * // |    T    |    F   |  'girl' |
 * // |    T    |    T   |  'boy'  |
 *
 * let isChild = false
 * let isMale = false
 * truthTable(['woman','man','girl','boy'],[isChild, isMale]) //=> "woman"
 *
 * // For comparison - expressed using if/then
 * let isChild = false
 * let isMale = false
 * if(isChild) {
 *   if(isMale) {
 *     return 'boy'
 *   } else {
 *     return 'girl'
 *   }
 * } else {
 *   if(isMale) {
 *     return 'man'
 *   } else {
 *     return 'woman'
 *   }
 * }
 *
 */
const truthTable = curry(
  (choiceArray, boolArray) => choiceArray[boolsToInt(boolArray)]
)

module.exports = truthTable
