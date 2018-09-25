import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isDate from 'lodash/isDate'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNull from 'lodash/isNull'

type TypeNumberName = 'number';
type TypeStringName = 'string';
type TypeDateName = 'date';
type TypeObjectName = 'object';
type TypeArrayName = 'array';
type TypeBooleanName = 'boolean';
type TypeNullName = 'null';

type JsonNativeType = TypeNumberName | TypeStringName | TypeObjectName | TypeArrayName | TypeBooleanName | TypeNullName;
type ExtendType = JsonNativeType | TypeDateName;
type ScalarType = TypeNumberName | TypeStringName | TypeBooleanName | TypeNullName | TypeDateName;

export const tnNumber: TypeNumberName = 'number';
export const tnString: TypeStringName = 'string';
export const tnDate: TypeDateName = 'date';
export const tnObject: TypeObjectName = 'object';
export const tnArray: TypeArrayName = 'array';
export const tnBoolean: TypeBooleanName = 'boolean';
export const tnNull: TypeNullName = 'null';

function floatVal (v: any): number {
  v = parseFloat(v);
  return isNaN(v) ? 0 : v;
}

export const checkers: {[T in ExtendType]: (v: any) => boolean} = {
  [tnNumber]: isNumber,
  [tnString]: isString,
  [tnDate]: isDate,
  [tnObject]: isPlainObject,
  [tnArray]: isArray,
  [tnBoolean]: isBoolean,
  [tnNull]: isNull
};

export const defaults: {
  [tnNumber]: (v: any) => number,
  [tnString]: (v: any) => string,
  [tnDate]: (v: any) => Date,
  [tnObject]: (v: any) => any,
  [tnArray]: (v: any) => any[],
  [tnBoolean]: (v: any) => boolean,
  [tnNull]: (v: any) => null
} = {
  [tnNumber]: floatVal,
  [tnString]: (oldVal) => (isString(oldVal) || isNumber(oldVal) || isBoolean(oldVal)) ? `${oldVal}` : '',
  [tnDate]: (v) => new Date(v),
  [tnObject]: () => ({}),
  [tnArray]: () => ([]),
  [tnBoolean]: oldVal => !!oldVal,
  [tnNull]: () => null
};

export const jsonNativeTypesNames: JsonNativeType[] = [tnNumber, tnString, tnObject, tnArray, tnBoolean, tnNull];
export const extendTypesNames: ExtendType[] = [tnNumber, tnString, tnDate, tnObject, tnArray, tnBoolean, tnNull];

export function detectJsonNativeTypeName (value: any): JsonNativeType {
  return jsonNativeTypesNames.find(tn => checkers[tn](value)) || tnString
}
export function detectExtendTypeName (value: any): ExtendType {
  return extendTypesNames.find(tn => checkers[tn](value)) || tnString
}
export function createTypeDetector (types: ExtendType[]) {
  return function detectType (value: any) {
    return types.find(tn => checkers[tn](value)) || tnString
  }
}

type SchemaItemObjectProperty = {
  key: string,
  prop: SchemaItem
}

type SchemaScalarItem  = {
  num: number,
  type: ScalarType,
}

type SchemaArrayItem = {
  num: number,
  type: TypeArrayName,
  items: SchemaItem[]
}

type SchemaObjectItem = {
  num: number,
  type: TypeObjectName,
  properties: SchemaItemObjectProperty[]
}

type SchemaItem = SchemaScalarItem | SchemaObjectItem | SchemaArrayItem;

let num: number = 0;

function createSchemaScalarItem (type: ScalarType): SchemaScalarItem {
  return {
    num: ++num,
    type
  }
}
function createSchemaArrayItem (items: SchemaItem[] = []): SchemaArrayItem {
  return {
    num: ++num,
    type: tnArray,
    items
  }
}
function createSchemaObjectItem (properties: SchemaItemObjectProperty[] = []): SchemaObjectItem {
  return {
    num: ++num,
    type: tnObject,
    properties
  }
}

export function createObjectProp (key: string, prop: SchemaItem): SchemaItemObjectProperty {
  return {
    key,
    prop
  }
}

export function createSchemaItem (type: ExtendType): SchemaItem {
  let schema: SchemaItem;
  switch (type) {
    case tnArray:
      schema = createSchemaArrayItem();
      break;
    case tnObject:
      schema = createSchemaObjectItem();
      break;
    default:
      schema = createSchemaScalarItem(type)
  }
  return schema
}
export function createSchemaDetector (detectTypeName: (json: any) => ExtendType) {
  return function detectSchema (json: any): SchemaItem {
    const type = detectTypeName(json);
    let schema: SchemaItem;
    switch (type) {
      case tnArray:
        schema = createSchemaArrayItem(json.map((item: any) => detectSchema(item)));
        break;
      case tnObject:
        schema = createSchemaObjectItem(Object.keys(json).map(key => createObjectProp(key, detectSchema(json[key]))));
        break;
      default:
        schema = createSchemaScalarItem(type)
    }
    return schema
  }
}

let vuid = 0;
export function generateVuexID () {
  return `_json_editor_${vuid++}`
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
      schema = schema.items[idx]
    } else if (schema.type === tnObject) {
      schema = schema.properties[idx].prop
    }
  }
  return schema
}
