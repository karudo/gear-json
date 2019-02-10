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
const baseTypes = [
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
class GearJson {
    constructor(extendTypes = []) {
        this.types = [...extendTypes, ...baseTypes];
        this.typesMap = keyBy_1.default(this.types, 'type');
        this.typesNames = this.types.map(t => t.type);
        this.typesCheckers = mapValues_1.default(this.typesMap, 'checker');
        this.jsonNativeTypes = keyBy_1.default(this.types.filter(t => t.jsonNative), 'type');
    }
    detectTypeName(value) {
        return this.typesNames.find(tn => this.typesCheckers[tn](value)) || 'string';
    }
    determineSchema(value, path = [], arr = []) {
        const type = this.detectTypeName(value);
        switch (type) {
            case 'array':
                for (let i = 0; i < value.length; i++) {
                    this.determineSchema(value[i], [...path, i], arr);
                }
                break;
            case 'object':
                for (const k in value) {
                    this.determineSchema(value[k], [...path, k], arr);
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
    serializeObject(obj, types) {
        types.forEach(({ path, type }) => {
            const v = get_1.default(obj, path);
            set_1.default(obj, path, this.typesMap[type].serialize(v));
        });
        return obj;
    }
    deserializeObject(obj, types) {
        types.forEach(({ path, type }) => {
            const v = get_1.default(obj, path);
            set_1.default(obj, path, this.typesMap[type].deserialize(v));
        });
        return obj;
    }
    packObject(obj) {
        const notNativeTypes = this.determineSchema(obj).filter(({ type }) => !this.jsonNativeTypes[type]);
        const serialized = this.serializeObject(obj, notNativeTypes);
        return [serialized, notNativeTypes];
    }
    unpackObject([obj, types]) {
        return this.deserializeObject(obj, types);
    }
    packSingleSchemaCollection(items, types) {
        return {
            type: 1,
            items: items.map(item => this.serializeObject(item, types)),
            types: types,
        };
    }
    packDifferentSchemaCollection(items) {
        return {
            type: 2,
            items: items.map(item => this.packObject(item)),
        };
    }
    unpackCollection(coll) {
        if (coll.type === 1) {
            return coll.items.map(obj => this.deserializeObject(obj, coll.types));
        }
        if (coll.type === 2) {
            return coll.items.map(obj => this.unpackObject(obj));
        }
        return [];
    }
}
exports.GearJson = GearJson;
