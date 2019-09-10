const { JWK, JWT } = require('@panva/jose')

class CapsuleDecoder {
  constructor () {
    const keyPem = process.env.VOLGACTF_FINAL_FLAG_SIGN_KEY_PUBLIC.replace(
      /\\n/g, '\n')
    this.key = JWK.asKey(keyPem)
    this.wrapPrefixLen = process.env.VOLGACTF_FINAL_FLAG_WRAP_PREFIX.length
    this.wrapSuffixLen = process.env.VOLGACTF_FINAL_FLAG_WRAP_SUFFIX.length
  }

  getFlag (capsule) {
    const token = capsule.slice(this.wrapPrefixLen, -this.wrapSuffixLen)
    const payload = JWT.verify(token, this.key)
    return payload.flag
  }
}

module.exports.decoder = new CapsuleDecoder()
