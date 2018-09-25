"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = __importDefault(require("lodash/set"));
const get_1 = __importDefault(require("lodash/get"));
const keyBy_1 = __importDefault(require("lodash/keyBy"));
const mapValues_1 = __importDefault(require("lodash/mapValues"));
const isNumber_1 = __importDefault(require("lodash/isNumber"));
const isString_1 = __importDefault(require("lodash/isString"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const isBoolean_1 = __importDefault(require("lodash/isBoolean"));
const isNull_1 = __importDefault(require("lodash/isNull"));
const isDate_1 = __importDefault(require("lodash/isDate"));
const types = [
    {
        type: 'number',
        checker: isNumber_1.default,
        jsonNative: true,
    },
    {
        type: 'string',
        checker: isString_1.default,
        jsonNative: true,
    },
    {
        type: 'boolean',
        checker: isBoolean_1.default,
        jsonNative: true,
    },
    {
        type: 'null',
        checker: isNull_1.default,
        jsonNative: true,
    },
    {
        type: 'datetime',
        checker: isDate_1.default,
        serialize: (v) => v.valueOf(),
        deserialize: (v) => new Date(v)
    },
    {
        type: 'array',
        checker: isArray_1.default,
    },
    {
        type: 'object',
        checker: isPlainObject_1.default,
    },
];
const typesMap = keyBy_1.default(types, 'type');
const typesNames = types.map(t => t.type);
const typesCheckers = mapValues_1.default(typesMap, 'checker');
const jsonNativeTypes = keyBy_1.default(types.filter(t => t.jsonNative), 'type');
function detectTypeName(value) {
    return typesNames.find(tn => typesCheckers[tn](value)) || 'string';
}
function determineSchema(value, path = [], arr = []) {
    const type = detectTypeName(value);
    switch (type) {
        case 'array':
            for (let i = 0; i < value.length; i++) {
                determineSchema(value[i], [...path, i], arr);
            }
            break;
        case 'object':
            for (const k in value) {
                determineSchema(value[k], [...path, k], arr);
            }
            break;
        default:
            arr.push({
                path,
                type
            });
    }
    return arr;
}
function serializeObject(obj, types) {
    types.forEach(({ path, type }) => {
        const v = get_1.default(obj, path);
        set_1.default(obj, path, typesMap[type].serialize(v));
    });
    return obj;
}
function deserializeObject(obj, types) {
    types.forEach(({ path, type }) => {
        const v = get_1.default(obj, path);
        set_1.default(obj, path, typesMap[type].deserialize(v));
    });
    return obj;
}
function packObject(obj) {
    const notNativeTypes = determineSchema(obj).filter(({ type }) => !jsonNativeTypes[type]);
    const serialized = serializeObject(obj, notNativeTypes);
    return [serialized, notNativeTypes];
}
exports.packObject = packObject;
function unpackObject(packedObj) {
    const [obj, types] = packedObj;
    return deserializeObject(obj, types);
}
exports.unpackObject = unpackObject;
function packSingleSchemaCollection(items, types) {
    return {
        type: 1,
        items: items.map(item => serializeObject(item, types)),
        types: types,
    };
}
exports.packSingleSchemaCollection = packSingleSchemaCollection;
function packDifferentSchemaCollection(items) {
    return {
        type: 2,
        items: items.map(item => packObject(item)),
    };
}
exports.packDifferentSchemaCollection = packDifferentSchemaCollection;
function unpackCollection(coll) {
    if (coll.type === 1) {
        return coll.items.map(obj => deserializeObject(obj, coll.types));
    }
    if (coll.type === 2) {
        return coll.items.map(unpackObject);
    }
    return [];
}
exports.unpackCollection = unpackCollection;
