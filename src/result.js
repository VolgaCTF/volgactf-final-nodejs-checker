const Result = {
  UP: 101,
  CORRUPT: 102,
  MUMBLE: 103,
  DOWN: 104,
  INTERNAL_ERROR: 110
}
Object.freeze(Result)

module.exports.Result = Result

module.exports.getResultName = function (val) {
  for (const [k, v] of Object.entries(Result)) {
    if (v === val) {
      return k
    }
  }
  return null
}
