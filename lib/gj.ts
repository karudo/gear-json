import set from 'lodash/set'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNull from 'lodash/isNull'
import isDate from 'lodash/isDate'

type PathItemType = number | string;
type PackedTypeInfo = {
  path: PathItemType[],
  type: string
}
type PackedSchema = PackedTypeInfo[];
type PackedObject = [object, PackedSchema];

type PackedCollectionWithCommonSchema = {
  type: 1,
  items: object[],
  types: PackedSchema,
}

type PackedCollectionWithDifferentSchema = {
  type: 2,
  items: PackedObject[],
}

const types = [
  {
    type: 'number',
    checker: isNumber,
    jsonNative: true,
  },
  {
    type: 'string',
    checker: isString,
    jsonNative: true,
  },
  {
    type: 'boolean',
    checker: isBoolean,
    jsonNative: true,
  },
  {
    type: 'null',
    checker: isNull,
    jsonNative: true,
  },
  {
    type: 'datetime',
    checker: isDate,
    serialize: (v: Date) => v.valueOf(),
    deserialize: (v: number) => new Date(v)
  },
  {
    type: 'array',
    checker: isArray,
  },
  {
    type: 'object',
    checker: isPlainObject,
  },
];

const typesMap = keyBy(types, 'type');
const typesNames = types.map(t => t.type);
const typesCheckers = mapValues(typesMap, 'checker');
const jsonNativeTypes = keyBy(types.filter(t => t.jsonNative), 'type');

function detectTypeName (value: any): string {
  return typesNames.find(tn => typesCheckers[tn](value)) || 'string'
}

function determineSchema (value: any, path: PathItemType[] = [], arr: PackedTypeInfo[] = []) {
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

function serializeObject (obj: object, types: PackedSchema): object {
  types.forEach(({path, type}) => {
    const v = get(obj, path);
    set(obj, path, (typesMap[type] as any).serialize(v))
  });
  return obj;
}

function deserializeObject (obj: object, types: PackedSchema): object {
  types.forEach(({path, type}) => {
    const v = get(obj, path);
    set(obj, path, (typesMap[type] as any).deserialize(v))
  });
  return obj;
}

export function packObject (obj: object): PackedObject {
  const notNativeTypes = determineSchema(obj).filter(({type}) => !jsonNativeTypes[type]);
  const serialized = serializeObject(obj, notNativeTypes);
  return [serialized, notNativeTypes]
}

export function unpackObject (packedObj: PackedObject): object {
  const [obj, types] = packedObj;
  return deserializeObject(obj, types);
}

export function packSingleSchemaCollection (items: object[], types: PackedSchema): PackedCollectionWithCommonSchema {
  return {
    type: 1,
    items: items.map(item => serializeObject(item, types)),
    types: types,
  }
}

export function packDifferentSchemaCollection (items: object[]): PackedCollectionWithDifferentSchema {
  return {
    type: 2,
    items: items.map(item => packObject(item)),
  }
}

export function unpackCollection(coll: PackedCollectionWithCommonSchema | PackedCollectionWithDifferentSchema): object[] {
  if (coll.type === 1) {
    return coll.items.map(obj => deserializeObject(obj, coll.types))
  }
  if (coll.type === 2) {
    return coll.items.map(unpackObject)
  }
  return []
}
