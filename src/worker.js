const { parentPort } = require('worker_threads')
const axios = require('axios')
const path = require('path')

const logger = require('./logger')
const { decoder } = require('./capsule')
const { Result, getResultName } = require('./result')

class Metadata {
  constructor (options) {
    this.timestamp = options.timestamp || null
    this.round = options.round || null
    this.teamName = options.team_name || ''
    this.serviceName = options.service_name || ''
  }

  getTimestamp () {
    return this.timestamp
  }

  getRound () {
    return this.round
  }

  getTeamName () {
    return this.teamName
  }

  getServiceName () {
    return this.serviceName
  }
}

const checkerModule = process.env.VOLGACTF_FINAL_CHECKER_MODULE || path.join(__dirname, 'checker', 'main')
const checker = require(checkerModule)

async function safePush (endpoint, capsule, label, metadata) {
  let result = Result.INTERNAL_ERROR
  let updatedLabel = label
  let message = null
  try {
    const rawResult = await checker.push(endpoint, capsule, label, metadata)
    if (Array.isArray(rawResult)) {
      if (rawResult.length > 0) {
        result = rawResult[0]
      }
      if (rawResult.length > 1) {
        updatedLabel = rawResult[1]
      }
      if (rawResult.length > 2) {
        message = rawResult[2]
      }
    } else {
      result = rawResult
    }
  } catch (error) {
    logger.error(error)
  }
  return [result, updatedLabel, message]
}

async function handlePush (payload) {
  const params = payload.params
  const metadata = new Metadata(payload.metadata)
  const tCreated = new Date(metadata.getTimestamp())
  const tDelivered = new Date()
  const flag = decoder.getFlag(params.capsule)

  const [status, updatedLabel, message] = await safePush(
    params.endpoint,
    params.capsule,
    params.label,
    metadata
  )

  const tProcessed = new Date()

  const jobResult = {
    status: status,
    flag: flag,
    label: updatedLabel,
    message: message
  }

  const deliveryTime = (tDelivered.getTime() - tCreated.getTime()) / 1000.0
  const processingTime = (tProcessed.getTime() - tDelivered.getTime()) / 1000.0

  const logMessage = `PUSH flag '${flag}' /${metadata.getRound()} to ` +
    `'${metadata.getServiceName()}'@'${metadata.getTeamName()}' ` +
    `(${params.endpoint}) - status ${getResultName(status)}, label '${jobResult.label}' ` +
    `[delivery ${deliveryTime}s, processing ${processingTime}s]`
  logger.info(logMessage)

  try {
    const response = await axios.post(payload.report_url, jobResult, {
      auth: {
        username: process.env.VOLGACTF_FINAL_AUTH_MASTER_USERNAME,
        password: process.env.VOLGACTF_FINAL_AUTH_MASTER_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.status !== 204) {
      logger.error(response.status)
      logger.error(response.data)
    }
  } catch (error) {
    logger.error(error)
  }
}

async function safePull (endpoint, capsule, label, metadata) {
  let result = Result.INTERNAL_ERROR
  let message = null
  try {
    const rawResult = await checker.pull(endpoint, capsule, label, metadata)
    if (Array.isArray(rawResult)) {
      if (rawResult.length > 0) {
        result = rawResult[0]
      }
      if (rawResult.length > 1) {
        message = rawResult[1]
      }
    } else {
      result = rawResult
    }
  } catch (error) {
    logger.error(error)
  }
  return [result, message]
}

async function handlePull (payload) {
  const params = payload.params
  const metadata = new Metadata(payload.metadata)
  const tCreated = new Date(metadata.getTimestamp())
  const tDelivered = new Date()
  const flag = decoder.getFlag(params.capsule)

  const [status, message] = await safePull(
    params.endpoint,
    params.capsule,
    params.label,
    metadata
  )

  const tProcessed = new Date()

  const jobResult = {
    request_id: params.request_id,
    status: status,
    message: message
  }

  const deliveryTime = (tDelivered.getTime() - tCreated.getTime()) / 1000.0
  const processingTime = (tProcessed.getTime() - tDelivered.getTime()) / 1000.0

  const logMessage = `PULL flag '${flag}' /${metadata.getRound()} from ` +
    `'${metadata.getServiceName()}'@'${metadata.getTeamName()}' ` +
    `with label '${params.label}' - status ${getResultName(status)} ` +
    `[delivery ${deliveryTime}s, processing ${processingTime}s]`
  logger.info(logMessage)

  try {
    const response = await axios.post(payload.report_url, jobResult, {
      auth: {
        username: process.env.VOLGACTF_FINAL_AUTH_MASTER_USERNAME,
        password: process.env.VOLGACTF_FINAL_AUTH_MASTER_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.status !== 204) {
      logger.error(response.status)
      logger.error(response.data)
    }
  } catch (error) {
    logger.error(error)
  }
}

parentPort.once('message', async (value) => {
  if (value.type === 'push') {
    handlePush(value.payload)
  } else if (value.type === 'pull') {
    handlePull(value.payload)
  }
})
