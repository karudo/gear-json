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

const typesNames = types.map(t => t.type);
const typesCheckers = _.mapValues(_.keyBy(types, 'type'), 'checker');


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

console.log(determineSchema({
  qwe: 9,
  a: 'q',
  sss: [9, {s: null}],
  ppp: {8: false, 77: new Date()}
}))
