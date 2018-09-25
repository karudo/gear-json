"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isNumber_1 = __importDefault(require("lodash/isNumber"));
const isString_1 = __importDefault(require("lodash/isString"));
const isDate_1 = __importDefault(require("lodash/isDate"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const isBoolean_1 = __importDefault(require("lodash/isBoolean"));
const isNull_1 = __importDefault(require("lodash/isNull"));
exports.tnNumber = 'number';
exports.tnString = 'string';
exports.tnDate = 'date';
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
    [exports.tnDate]: isDate_1.default,
    [exports.tnObject]: isPlainObject_1.default,
    [exports.tnArray]: isArray_1.default,
    [exports.tnBoolean]: isBoolean_1.default,
    [exports.tnNull]: isNull_1.default
};
exports.defaults = {
    [exports.tnNumber]: floatVal,
    [exports.tnString]: (oldVal) => (isString_1.default(oldVal) || isNumber_1.default(oldVal) || isBoolean_1.default(oldVal)) ? `${oldVal}` : '',
    [exports.tnDate]: (v) => new Date(v),
    [exports.tnObject]: () => ({}),
    [exports.tnArray]: () => ([]),
    [exports.tnBoolean]: oldVal => !!oldVal,
    [exports.tnNull]: () => null
};
exports.jsonNativeTypesNames = [exports.tnNumber, exports.tnString, exports.tnObject, exports.tnArray, exports.tnBoolean, exports.tnNull];
exports.extendTypesNames = [exports.tnNumber, exports.tnString, exports.tnDate, exports.tnObject, exports.tnArray, exports.tnBoolean, exports.tnNull];
function detectJsonNativeTypeName(value) {
    return exports.jsonNativeTypesNames.find(tn => exports.checkers[tn](value)) || exports.tnString;
}
exports.detectJsonNativeTypeName = detectJsonNativeTypeName;
function detectExtendTypeName(value) {
    return exports.extendTypesNames.find(tn => exports.checkers[tn](value)) || exports.tnString;
}
exports.detectExtendTypeName = detectExtendTypeName;
let num = 0;
function createSchemaScalarItem(type) {
    return {
        num: ++num,
        type
    };
}
function createSchemaArrayItem(items = []) {
    return {
        num: ++num,
        type: exports.tnArray,
        items
    };
}
function createSchemaObjectItem(properties = []) {
    return {
        num: ++num,
        type: exports.tnObject,
        properties
    };
}
function createObjectProp(key, prop) {
    return {
        key,
        prop
    };
}
exports.createObjectProp = createObjectProp;
function createSchemaItem(type) {
    let schema;
    switch (type) {
        case exports.tnArray:
            schema = createSchemaArrayItem();
            break;
        case exports.tnObject:
            schema = createSchemaObjectItem();
            break;
        default:
            schema = createSchemaScalarItem(type);
    }
    return schema;
}
exports.createSchemaItem = createSchemaItem;
function createSchemaDetector(detectTypeName) {
    return function detectSchema(json) {
        const type = detectTypeName(json);
        let schema;
        switch (type) {
            case exports.tnArray:
                schema = createSchemaArrayItem(json.map((item) => detectSchema(item)));
                break;
            case exports.tnObject:
                schema = createSchemaObjectItem(Object.keys(json).map(key => createObjectProp(key, detectSchema(json[key]))));
                break;
            default:
                schema = createSchemaScalarItem(type);
        }
        return schema;
    };
}
exports.createSchemaDetector = createSchemaDetector;
let vuid = 0;
function generateVuexID() {
    return `_json_editor_${vuid++}`;
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
