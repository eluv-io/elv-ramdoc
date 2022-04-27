/**
 * Returns a description of an upper bound condition
 *
 * @function
 * @private
 * @since v0.0.1
 * @category Miscellaneous
 * @sig a -> a -> Boolean -> Boolean -> String
 * @param {*} lowerBound
 * @param {*} upperBound
 * @param {Boolean} lowerInclusive - Whether values are allowed to equal `lowerBound`
 * @param {Boolean} upperInclusive - Whether values are allowed to equal `upperBound`
 * @returns {String}
 * @example
 *
 * _boundDescBetween(0, 42, true, true)     //=> 'must be >= 0 and <= 42'
 *
 * _boundDescBetween(0, 42, false, false)   //=> 'must be > 0 and < 42'
 *
 */
const _boundDescBetween = (lowerBound,upperBound, lowerInclusive,upperInclusive) =>
  `must be ${(lowerInclusive ? '>=' : '>')} ${lowerBound} and ${(upperInclusive ? '<=' : '<')} ${upperBound}`

module.exports = _boundDescBetween
