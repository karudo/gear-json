declare type TypeNumberName = 'number';
declare type TypeStringName = 'string';
declare type TypeObjectName = 'object';
declare type TypeArrayName = 'array';
declare type TypeBooleanName = 'boolean';
declare type TypeNull = 'null';
export declare type JsonType = TypeNumberName | TypeStringName | TypeObjectName | TypeArrayName | TypeBooleanName | TypeNull;
export declare const tnNumber: TypeNumberName;
export declare const tnString: TypeStringName;
export declare const tnObject: TypeObjectName;
export declare const tnArray: TypeArrayName;
export declare const tnBoolean: TypeBooleanName;
export declare const tnNull: TypeNull;
export declare const checkers: {
    [T in JsonType]: (v: any) => boolean;
};
export declare const defaults: {
    [tnNumber]: (v: any) => number;
    [tnString]: (v: any) => string;
    [tnObject]: (v: any) => any;
    [tnArray]: (v: any) => any[];
    [tnBoolean]: (v: any) => boolean;
    [tnNull]: (v: any) => null;
};
export declare const typesNames: JsonType[];
export declare type SchemaItemObjectProperty = {
    key: string;
    prop: SchemaItem;
};
export declare type SchemaItem = {
    num: number;
    type: JsonType;
    properties?: SchemaItemObjectProperty[];
    items?: SchemaItem[];
};
export declare function createSchemaItem(type: JsonType, options?: any): SchemaItem;
export declare function createObjectProp(key: string, prop: SchemaItem): SchemaItemObjectProperty;
export declare function getEditorSchema(json: any): SchemaItem;
export declare function generateVuexID(): string;
export declare function getValueByPath(obj: any, path: any[]): any;
export declare function getSchemaByPath(schema: SchemaItem, path: any[]): SchemaItem;
export {};
