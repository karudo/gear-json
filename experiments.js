const _ = require('lodash');

const types = [
  {
    type: 'number',
    checker: _.isNumber,
    jsonNative: true,
  },
  {
    type: 'string',
    checker: _.isString,
    jsonNative: true,
  },
  {
    type: 'boolean',
    checker: _.isBoolean,
    jsonNative: true,
  },
  {
    type: 'null',
    checker: _.isNull,
    jsonNative: true,
  },
  {
    type: 'datetime',
    checker: _.isDate,
    pack: v => v.valueOf(),
    unpack: v => new Date(v)
  },
  {
    type: 'array',
    checker: _.isArray,
  },
  {
    type: 'object',
    checker: _.isPlainObject,
  },
];

const typesMap = _.keyBy(types, 'type')
const typesNames = types.map(t => t.type);
const typesCheckers = _.mapValues(typesMap, 'checker');
const jsonNativeTypes = _.keyBy(types.filter(t => t.jsonNative), 'type');

function detectTypeName (value) {
  return typesNames.find(tn => typesCheckers[tn](value)) || 'string'
}

function determineSchema (value, path = [], arr = []) {
  const type = detectTypeName(value);
  switch (type) {
    case 'array':
      for (let i = 0; i < value.length; i++) {
        determineSchema(value[i], [...path, i], arr)
      }
      break;
    case 'object':
      for (const k in value) {
        determineSchema(value[k], [...path, k], arr)
      }
      break;
    default:
      arr.push({
        path,
        type
      })
  }
  return arr
}

function packObject (obj) {
  const notNative = determineSchema(obj).filter(({type}) => !jsonNativeTypes[type])
  notNative.forEach(({path, type}) => {
    const v = _.get(obj, path);
    _.set(obj, path, typesMap[type].pack(v))
  });
  return [obj, notNative]
}

const x = packObject({
  qwe: 9,
  a: 'q',
  sss: [9, {s: null}],
  ppp: {8: false, 77: 'r', p: {p: false, x: [9, new Date()]}}
})
console.log(x)
