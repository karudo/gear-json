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

export type TypeDesc = {
  type: string
  checker: (a: any) => boolean
  jsonNative?: boolean
  serialize?: (a: any) => any
  deserialize?: (a: any) => any
}

const baseTypes: TypeDesc[] = [
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

export class GearJson {
  private types: TypeDesc[];
  private typesMap: {[key: string]: TypeDesc};
  private typesNames: string[];
  private typesCheckers: {[key: string]: (a: any) => boolean};
  private jsonNativeTypes: {[key: string]: TypeDesc};

  constructor (extendTypes: TypeDesc[] = []) {
    this.types = [...extendTypes, ...baseTypes]
    this.typesMap = keyBy(this.types, 'type');
    this.typesNames = this.types.map(t => t.type);
    this.typesCheckers = mapValues(this.typesMap, 'checker');
    this.jsonNativeTypes = keyBy(this.types.filter(t => t.jsonNative), 'type');
  }

  detectTypeName (value: any): string {
    return this.typesNames.find(tn => this.typesCheckers[tn](value)) || 'string'
  }

  determineSchema (value: any, path: PathItemType[] = [], arr: PackedTypeInfo[] = []) {
    const type = this.detectTypeName(value);
    switch (type) {
      case 'array':
        for (let i = 0; i < value.length; i++) {
          this.determineSchema(value[i], [...path, i], arr)
        }
        break;
      case 'object':
        for (const k in value) {
          this.determineSchema(value[k], [...path, k], arr)
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

  serializeObject (obj: object, types: PackedSchema): object {
    types.forEach(({path, type}) => {
      const v = get(obj, path);
      set(obj, path, (this.typesMap[type] as any).serialize(v))
    });
    return obj;
  }

  deserializeObject (obj: object, types: PackedSchema): object {
    types.forEach(({path, type}) => {
      const v = get(obj, path);
      set(obj, path, (this.typesMap[type] as any).deserialize(v))
    });
    return obj;
  }

  packObject (obj: object): PackedObject {
    const notNativeTypes = this.determineSchema(obj).filter(({type}) => !this.jsonNativeTypes[type]);
    const serialized = this.serializeObject(obj, notNativeTypes);
    return [serialized, notNativeTypes]
  }

  unpackObject ([obj, types]: PackedObject): object {
    return this.deserializeObject(obj, types);
  }

  packSingleSchemaCollection (items: object[], types: PackedSchema): PackedCollectionWithCommonSchema {
    return {
      type: 1,
      items: items.map(item => this.serializeObject(item, types)),
      types: types,
    }
  }

  packDifferentSchemaCollection (items: object[]): PackedCollectionWithDifferentSchema {
    return {
      type: 2,
      items: items.map(item => this.packObject(item)),
    }
  }

  unpackCollection(coll: PackedCollectionWithCommonSchema | PackedCollectionWithDifferentSchema): object[] {
    if (coll.type === 1) {
      return coll.items.map(obj => this.deserializeObject(obj, coll.types))
    }
    if (coll.type === 2) {
      return coll.items.map(obj => this.unpackObject(obj))
    }
    return []
  }
}
