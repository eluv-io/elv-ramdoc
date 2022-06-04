const defSealedObjModel = require('@eluvio/elv-js-helpers/ModelFactory/defSealedObjModel')

const AbrProfAddlOffSpecsModel = require('./AbrProfAddlOffSpecsModel')
const AbrProfCommentsModel = require('./AbrProfCommentsModel')
const AbrProfImageWmModel = require('./AbrProfImageWmModel')
const AbrProfLadderSpecsModel = require('./AbrProfLadderSpecsModel')
const AbrProfPlayoutFmtsModel = require('./AbrProfPlayoutFmtsModel')
const AbrProfSegSpecsModel = require('./AbrProfSegSpecsModel')
const AbrProfTextWmModel = require('./AbrProfTextWmModel')
const AbrProfVidPmLadderModel = require('./AbrProfVidPmLadderModel')

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates ABR Profiles.
 *
 * Throws an exception if passed in an invalid object.
 *
 * @class
 * @category AbrProfile
 * @sig * -> Object | THROW
 * @param {*} - The input to validate
 * @param {AbrProfCommentsModel} .comments - an array of strings
 * @param {Boolean} .drm_optional - if `true`, then clear playout is allowed
 * @param {Boolean} .store_clear - if `true`, then storing parts without encryption is allowed (incompatible with `drm_optional: false`)
 * @param {AbrProfLadderSpecsModel} .ladder_specs - an object containing bitrate/resolution ladders, each associated with a number of audio channels or a video aspect ratio.
 * @param {AbrProfPlayoutFmtsModel} .playout_formats - an object containing playout formats to make available, each format is a combination of streaming protocol (Dash or HLS) and DRM standard (`null` for clear playout)
 * @param {AbrProfSegSpecsModel} .segment_specs - an object containing specifications for what kinds of segments to create for each media type (audio or video) and how many to store in each object part
 * @param {AbrProfImageWmModel} [.image_watermark] - an object containing image watermark information (cannot be used at same time as `simple_watermark`)
 * @param {AbrProfTextWmModel} [.simple_watermark] - an object containing text watermark information (cannot be used at same time as `image_watermark`)
 * @param {AbrProfAddlOffSpecsModel} [.additional_offering_specs] - an object containing specifications for any additional offerings to create after transcoding. Each specification is an array of [JSON Patch](https://jsonpatch.com/) operations to perform on a copy of the mezzanine offering created during ingest.
 * @param {AbrProfVidPmLadderModel} [.video_parametric_ladder] - an object containing a parametric video ladder than can be used to generate video ladder specs for a particular video. This will only be used if `ladder_specs` does not already contain an entry for the master video's aspect ratio.
 * @returns {Object} The validated input, proxied by ObjectModel
 * @example
 *
 * const AbrProfileModel = require('@eluvio/elv-abr-profile/AbrProfile/AbrProfileModel')
 *
 * AbrProfileModel({})  //=> EXCEPTION: 'ladder_specs must not be empty'
 *
 * AbrProfileModel({
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
 * AbrProfileModel({
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
const AbrProfileModel = defSealedObjModel(
  'AbrProfile',
  {
    comments: [AbrProfCommentsModel],
    drm_optional: Boolean,
    store_clear: Boolean,
    ladder_specs: AbrProfLadderSpecsModel,
    playout_formats: AbrProfPlayoutFmtsModel,
    segment_specs: AbrProfSegSpecsModel,
    image_watermark: AbrProfImageWmModel,
    simple_watermark: AbrProfTextWmModel,
    additional_offering_specs: AbrProfAddlOffSpecsModel,
    video_parametric_ladder: AbrProfVidPmLadderModel
  }
)

// TODO: check check drm_optional vs. store_clear vs playout_formats, mutex watermarks
module.exports = AbrProfileModel
