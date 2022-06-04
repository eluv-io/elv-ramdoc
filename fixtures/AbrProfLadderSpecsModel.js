const passesModelCheck = require('@eluvio/elv-js-helpers/Boolean/passesModelCheck')

const filterKV = require('@eluvio/elv-js-helpers/Functional/filterKV')

const assertAfterCheck = require('@eluvio/elv-js-helpers/ModelAssertion/assertAfterCheck')

const defCheckedKVObjModel = require('@eluvio/elv-js-helpers/ModelFactory/defCheckedKVObjModel')

const AbrProfLadderKeyModel = require('./AbrProfLadderKeyModel')
const AbrProfRungSpecsModel = require('./AbrProfRungSpecsModel')

const _ABRProfLadderSpecsModel = defCheckedKVObjModel(
  '_ABRProfileLadderSpecs',
  AbrProfLadderKeyModel,
  AbrProfRungSpecsModel
)

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates the `ladder_specs` property of [AbrProfileModel](#AbrProfileModel).
 *
 * A `ladder_specs` object must have keys that are valid instances of [AbrProfLadderKeyModel](#AbrProfLadderKeyModel) and
 * values that are valid instances of [AbrProfRungSpecsModel](#AbrProfRungSpecsModel).
 *
 * Additionally:
 *  * `ladder_specs` must not be an empty object
 *  * The `media_type` specified in each element of a value's `rung_specs` array must match the `media_type` specified in the value's key
 *
 * Throws an exception if passed in an invalid value.
 *
 * @class
 * @category AbrProfile
 * @sig * -> Object | THROW
 * @param {*} - The input to validate
 * @returns {Object} The validated input, proxied by ObjectModel
 * @example
 *
 * const AbrProfLadderSpecsModel = require('@eluvio/elv-abr-profile/AbrProfile/AbrProfLadderSpecsModel')
 *
 * AbrProfLadderSpecsModel({})  //=> EXCEPTION: 'ladder_specs must not be empty'
 *
 * AbrProfLadderSpecsModel({
 *   '{"media_type":"audio","channels":1}': {
 *     rung_specs: [
 *       {
 *         bit_rate: 128000,
 *         height: 480,
 *         media_type: 'video',
 *         pregenerate: true,
 *         width: 640
 *       }
 *     ]
 *   }
 * })                           //=> EXCEPTION: 'ladder_specs key and ladder rung_specs entries must have same media_type'
 *
 * AbrProfLadderSpecsModel({
 *   '{"media_type":"audio","channels":1}': {
 *     rung_specs: [
 *       {
 *         bit_rate: 128000,
 *         media_type: 'audio',
 *         pregenerate: true
 *       }
 *     ]
 *   }
 * })                           //=> (object with same data, proxied by ObjectModel)
 *
 */
const AbrProfLadderSpecsModel = _ABRProfLadderSpecsModel.extend()
  .assert(
    ...assertAfterCheck(
      passesModelCheck(_ABRProfLadderSpecsModel),
      obj => Object.keys(obj).length > 0,
      () => 'ladder_specs must not be empty'
    )
  ).assert(
    ...assertAfterCheck(
      passesModelCheck(_ABRProfLadderSpecsModel),
      obj => Object.keys(
        filterKV(
          pair => JSON.parse(pair.fst()).media_type !== pair.snd().rung_specs[0].media_type,
          obj
        )
      ).length === 0,
      () => 'ladder_specs key and ladder rung_specs entries must have same media_type'
    )
  ).as('ABRProfileLadderSpecs')

module.exports = AbrProfLadderSpecsModel
