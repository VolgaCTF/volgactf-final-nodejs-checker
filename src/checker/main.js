const axios = require('axios')
const { Result } = require('../result')
const logger = require('../logger')

function isPingEnabled () {
  return (process.env.VOLGACTF_FINAL_PING_ENABLED || 'yes') === 'yes'
}

async function pingService (endpoint) {
  try {
    const response = await axios.head(`http://${endpoint}:8080`)
    return response.status === 200
  } catch (error) {
    return false
  }
}

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function sleep (seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

function getRandomString (len) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  let r = ''
  for (let i = 0; i < len; i++) {
    const ndx = Math.floor(Math.random() * chars.length)
    r += chars[ndx]
  }
  return r
}

async function push (endpoint, capsule, label, metadata) {
  // TODO: write your own implementation
  const pause = getRandomInt(1, 5)
  logger.debug(`Sleeping for ${pause} seconds...`)
  await sleep(pause)
  if (isPingEnabled() && !await pingService(endpoint)) {
    return Result.DOWN
  }
  return [Result.UP, getRandomString(8), getRandomString(16)]
}

async function pull (endpoint, capsule, label, metadata) {
  // TODO: write your own implementation
  const pause = getRandomInt(1, 5)
  logger.debug(`Sleeping for ${pause} seconds...`)
  await sleep(pause)
  if (isPingEnabled() && !await pingService(endpoint)) {
    return Result.DOWN
  }
  return [Result.UP, getRandomString(16)]
}

module.exports = {
  push: push,
  pull: pull
}
