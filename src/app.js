const Koa = require('koa')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const auth = require('koa-basic-auth')

const app = new Koa()

const router = require('./router')
const logger = require('./logger')

app.use(koaLogger({
  transporter: (str, args) => {
    logger.info(str)
  }
}))

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401
      ctx.set('WWW-Authenticate', 'Basic realm="Protected area"')
    } else {
      throw err
    }
  }
})

app.use(auth({
  name: process.env.VOLGACTF_FINAL_AUTH_CHECKER_USERNAME,
  pass: process.env.VOLGACTF_FINAL_AUTH_CHECKER_PASSWORD
}))

app.use(bodyParser())

app.use(router.routes())

app.listen(80, '0.0.0.0')
