/**
 * Returns a description of a lower bound condition
 *
 * @function
 * @private
 * @since v0.0.1
 * @category Miscellaneous
 * @sig a -> Boolean -> String
 * @param {*} lowerBound
 * @param {Boolean} inclusive - Whether values are allowed to equal `lowerBound`
 * @returns {String}
 * @example
 *
 * _boundDescLower(42, true)   //=> 'must be >= 42'
 *
 * _boundDescLower(42, false)  //=> 'must be > 42'
 *
 */
const _boundDescLower = (lowerBound, inclusive) =>
  `must be ${(inclusive ? '>=' : '>')} ${lowerBound}`

module.exports = _boundDescLower
