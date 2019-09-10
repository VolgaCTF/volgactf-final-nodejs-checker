const Router = require('@koa/router')
const router = new Router()

const path = require('path')
const { Worker } = require('worker_threads')

router.post('/push', async (ctx) => {
  new Worker(path.join(__dirname, 'worker.js')).postMessage({
    type: 'push',
    payload: ctx.request.body
  })
  ctx.status = 202
})

router.post('/pull', async (ctx) => {
  new Worker(path.join(__dirname, 'worker.js')).postMessage({
    type: 'pull',
    payload: ctx.request.body
  })
  ctx.status = 202
})

module.exports = router
