"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isNumber_1 = __importDefault(require("lodash/isNumber"));
const isString_1 = __importDefault(require("lodash/isString"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const isBoolean_1 = __importDefault(require("lodash/isBoolean"));
const isNull_1 = __importDefault(require("lodash/isNull"));
exports.tnNumber = 'number';
exports.tnString = 'string';
exports.tnObject = 'object';
exports.tnArray = 'array';
exports.tnBoolean = 'boolean';
exports.tnNull = 'null';
function floatVal(v) {
    v = parseFloat(v);
    return isNaN(v) ? 0 : v;
}
exports.checkers = {
    [exports.tnNumber]: isNumber_1.default,
    [exports.tnString]: isString_1.default,
    [exports.tnObject]: isPlainObject_1.default,
    [exports.tnArray]: isArray_1.default,
    [exports.tnBoolean]: isBoolean_1.default,
    [exports.tnNull]: isNull_1.default
};
exports.defaults = {
    [exports.tnNumber]: floatVal,
    [exports.tnString]: (oldVal) => (isString_1.default(oldVal) || isNumber_1.default(oldVal) || isBoolean_1.default(oldVal)) ? `${oldVal}` : '',
    [exports.tnObject]: () => ({}),
    [exports.tnArray]: () => ([]),
    [exports.tnBoolean]: oldVal => !!oldVal,
    [exports.tnNull]: () => null
};
exports.typesNames = [exports.tnNumber, exports.tnString, exports.tnObject, exports.tnArray, exports.tnBoolean, exports.tnNull];
function detectTypeName(value) {
    return exports.typesNames.find(tn => exports.checkers[tn](value)) || exports.tnString;
}
const optionsDefaults = {
    [exports.tnObject]: () => ({ properties: [] }),
    [exports.tnArray]: () => ({ items: [] })
};
let num = 0;
function createSchemaItem(type, options) {
    return Object.assign({ num: ++num, type }, (optionsDefaults[type] && optionsDefaults[type]()), options);
}
exports.createSchemaItem = createSchemaItem;
function createObjectProp(key, prop) {
    return {
        key,
        prop
    };
}
exports.createObjectProp = createObjectProp;
function getEditorSchema(json) {
    const type = detectTypeName(json);
    let schema;
    switch (type) {
        case exports.tnArray:
            schema = createSchemaItem(type, {
                items: json.map((item) => getEditorSchema(item))
            });
            break;
        case exports.tnObject:
            schema = createSchemaItem(type, {
                properties: Object.keys(json).map(key => createObjectProp(key, getEditorSchema(json[key])))
            });
            break;
        default:
            schema = createSchemaItem(type);
    }
    return schema;
}
exports.getEditorSchema = getEditorSchema;
let vuid = 0;
function generateVuexID() {
    return `i${vuid++}`;
}
exports.generateVuexID = generateVuexID;
function getValueByPath(obj, path) {
    for (const key of path) {
        obj = obj[key];
    }
    return obj;
}
exports.getValueByPath = getValueByPath;
function getSchemaByPath(schema, path) {
    for (const idx of path) {
        if (schema.type === exports.tnArray) {
            schema = schema.items[idx];
        }
        else if (schema.type === exports.tnObject) {
            schema = schema.properties[idx].prop;
        }
    }
    return schema;
}
exports.getSchemaByPath = getSchemaByPath;
