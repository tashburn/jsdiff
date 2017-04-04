const concat = require('lodash/concat')
const keys = require('lodash/keys')
const cloneDeep = require('lodash/cloneDeep')
const isEqual = require('lodash/isEqual')

const { isBoolean, isNumber, isString, isObject, isArray } = require('./util/identify')
const { ADD, REMOVE, UPDATE, CUT, PASTE, NEW, OLD, SKIP } = require('./instructions')
const { diffObjects, forwardObject, backwardObject } = require('./diffObjects')
const { diffArrays, forwardArray, backwardArray } = require('./diffArrays')
const { diffStrings, forwardString, backwardString, stringDiffToOperations } = require('./diffStrings')


function diff(thing1, thing2) {
  // optimized case: objects (add,remove,update)
  if (isObject(thing1) && isObject(thing2)) {
    return diffObjects(thing1, thing2)
  }
  // optimized case: arrays (add,remove,update,cut,paste)
  else if (isArray(thing1) && isArray(thing2)) {
    return diffArrays(thing1, thing2)
  }
  // optimized case: strings
  else if (isString(thing1) && isString(thing2)) {
    return diffStrings(thing1, thing2)
  }
  // typical case (old/new)
  else {
    return {
      [OLD]: thing1,
      [NEW]: thing2,
    }
  }
}


function forward(thing, diff) {
  if (isBoolean(thing)) {
    return diff.new
  }
  else if (isNumber(thing)) {
    return diff.new
  }
  else if (isString(thing)) {
    return forwardString(thing, diff)
  }
  else if (isObject(thing)) {
    return forwardObject(thing, diff)
  }
  else if (isArray(thing)) {
    return forwardArray(thing, diff)
  }
  else throw 'Bad type: '+typeof(thing)
}


function backward(thing, diff) {
  if (isBoolean(thing)) {
    return diff.old
  }
  else if (isNumber(thing)) {
    return diff.old
  }
  else if (isString(thing)) {
    return backwardString(thing, diff)
  }
  else if (isObject(thing)) {
    return backwardObject(thing, diff)
  }
  else if (isArray(thing)) {
    return backwardArray(thing, diff)
  }
  else throw 'Bad type: '+typeof(thing)
}


function verify(oldThing, newThing, diff) {
  const oldThing2 = backward(newThing, diff)
  const newThing2 = forward(oldThing, diff)
  return isEqual(oldThing, oldThing2) && isEqual(newThing, newThing2)
}


// doing exports this way allows circular dependency
module.exports.diff = diff
module.exports.forward = forward
module.exports.backward = backward
module.exports.stringDiffToOperations = stringDiffToOperations
module.exports.verify = verify
