/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_NOT_STARTED = 'not started'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_RUNNING = 'running'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_FINISHED = 'finished'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_FAILED = 'failed'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_CANCELLED_TIMEOUT = 'cancelled by timeout'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_CANCELLED_USER = 'cancelled by user'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 */
const LRO_RS_CANCELLED_SHUTDOWN = 'cancelled by node shutdown'

/**
 * A list of all the possible values returned by server for LRO `run_state`
 *
 * @constant
 * @type {String[]}
 * @category Constant
 *
 */
const LRO_RUN_STATES = [
  LRO_RS_NOT_STARTED,
  LRO_RS_RUNNING,
  LRO_RS_FINISHED,
  LRO_RS_FAILED,
  LRO_RS_CANCELLED_TIMEOUT,
  LRO_RS_CANCELLED_USER,
  LRO_RS_CANCELLED_SHUTDOWN
]

module.exports = {
  LRO_RS_NOT_STARTED,
  LRO_RS_RUNNING,
  LRO_RS_FINISHED,
  LRO_RS_FAILED,
  LRO_RS_CANCELLED_TIMEOUT,
  LRO_RS_CANCELLED_USER,
  LRO_RS_CANCELLED_SHUTDOWN,
  LRO_RUN_STATES
}
