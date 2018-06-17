import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNull from 'lodash/isNull'

type TypeNumberName = 'number';
type TypeStringName = 'string';
type TypeObjectName = 'object';
type TypeArrayName = 'array';
type TypeBooleanName = 'boolean';
type TypeNull = 'null';

export type JsonType = TypeNumberName | TypeStringName | TypeObjectName | TypeArrayName | TypeBooleanName | TypeNull;

export const tnNumber: TypeNumberName = 'number';
export const tnString: TypeStringName = 'string';
export const tnObject: TypeObjectName = 'object';
export const tnArray: TypeArrayName = 'array';
export const tnBoolean: TypeBooleanName = 'boolean';
export const tnNull: TypeNull = 'null';

function floatVal (v: any): number {
  v = parseFloat(v);
  return isNaN(v) ? 0 : v;
}

export const checkers: {[T in JsonType]: (v: any) => boolean} = {
  [tnNumber]: isNumber,
  [tnString]: isString,
  [tnObject]: isPlainObject,
  [tnArray]: isArray,
  [tnBoolean]: isBoolean,
  [tnNull]: isNull
};

export const defaults: {
  [tnNumber]: (v: any) => number,
  [tnString]: (v: any) => string,
  [tnObject]: (v: any) => any,
  [tnArray]: (v: any) => any[],
  [tnBoolean]: (v: any) => boolean,
  [tnNull]: (v: any) => null
} = {
  [tnNumber]: floatVal,
  [tnString]: (oldVal) => (isString(oldVal) || isNumber(oldVal) || isBoolean(oldVal)) ? `${oldVal}` : '',
  [tnObject]: () => ({}),
  [tnArray]: () => ([]),
  [tnBoolean]: oldVal => !!oldVal,
  [tnNull]: () => null
};

export const typesNames: JsonType[] = [tnNumber, tnString, tnObject, tnArray, tnBoolean, tnNull];

function detectTypeName (value: any): JsonType {
  return typesNames.find(tn => checkers[tn](value)) || tnString
}

export type SchemaItemObjectProperty = {
  key: string,
  prop: SchemaItem
}

export type SchemaItem = {
  num: number,
  type: JsonType,
  properties?: SchemaItemObjectProperty[],
  items?: SchemaItem[]
}

const optionsDefaults = {
  [tnObject]: () => ({properties: []}),
  [tnArray]: () => ({items: []})
};

let num: number = 0;
export function createSchemaItem (type: JsonType, options?: any): SchemaItem {
  return {
    num: ++num,
    type,
    ...((optionsDefaults as any)[type] && (optionsDefaults as any)[type]()),
    ...options
  }
}
export function createObjectProp (key: string, prop: SchemaItem): SchemaItemObjectProperty {
  return {
    key,
    prop
  }
}

export function getEditorSchema (json: any): SchemaItem {
  const type = detectTypeName(json);
  let schema;
  switch (type) {
    case tnArray:
      schema = createSchemaItem(type, {
        items: json.map((item: any) => getEditorSchema(item))
      });
      break;
    case tnObject:
      schema = createSchemaItem(type, {
        properties: Object.keys(json).map(key => createObjectProp(key, getEditorSchema(json[key])))
      });
      break;
    default:
      schema = createSchemaItem(type)
  }
  return schema
}

let vuid = 0;
export function generateVuexID () {
  return `i${vuid++}`
}

export function getValueByPath (obj: any, path: any[]): any {
  for (const key of path) {
    obj = obj[key]
  }
  return obj
}

export function getSchemaByPath (schema: SchemaItem, path: any[]): SchemaItem {
  for (const idx of path) {
    if (schema.type === tnArray) {
      schema = (schema as any).items[idx]
    } else if (schema.type === tnObject) {
      schema = (schema as any).properties[idx].prop
    }
  }
  return schema
}
