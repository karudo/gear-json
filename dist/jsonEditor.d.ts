export declare type TypeNumberName = 'number';
export declare type TypeStringName = 'string';
export declare type TypeDateName = 'date';
export declare type TypeObjectName = 'object';
export declare type TypeArrayName = 'array';
export declare type TypeBooleanName = 'boolean';
export declare type TypeNullName = 'null';
export declare type JsonNativeType = TypeNumberName | TypeStringName | TypeObjectName | TypeArrayName | TypeBooleanName | TypeNullName;
export declare type ExtendType = JsonNativeType | TypeDateName;
export declare type ScalarType = TypeNumberName | TypeStringName | TypeBooleanName | TypeNullName | TypeDateName;
export declare const tnNumber: TypeNumberName;
export declare const tnString: TypeStringName;
export declare const tnDate: TypeDateName;
export declare const tnObject: TypeObjectName;
export declare const tnArray: TypeArrayName;
export declare const tnBoolean: TypeBooleanName;
export declare const tnNull: TypeNullName;
export declare const checkers: {
    [T in ExtendType]: (v: any) => boolean;
};
export declare const defaults: {
    [tnNumber]: (v: any) => number;
    [tnString]: (v: any) => string;
    [tnDate]: (v: any) => Date;
    [tnObject]: (v: any) => any;
    [tnArray]: (v: any) => any[];
    [tnBoolean]: (v: any) => boolean;
    [tnNull]: (v: any) => null;
};
export declare const jsonNativeTypesNames: JsonNativeType[];
export declare const extendTypesNames: ExtendType[];
export declare function detectJsonNativeTypeName(value: any): JsonNativeType;
export declare function detectExtendTypeName(value: any): ExtendType;
export declare function createTypeDetector(types: ExtendType[]): (value: any) => ExtendType;
export declare type SchemaItemObjectProperty = {
    key: string;
    prop: SchemaItem;
};
export declare type SchemaScalarItem = {
    num: number;
    type: ScalarType;
};
export declare type SchemaArrayItem = {
    num: number;
    type: TypeArrayName;
    items: SchemaItem[];
};
export declare type SchemaObjectItem = {
    num: number;
    type: TypeObjectName;
    properties: SchemaItemObjectProperty[];
};
export declare type SchemaItem = SchemaScalarItem | SchemaObjectItem | SchemaArrayItem;
export declare function createObjectProp(key: string, prop: SchemaItem): SchemaItemObjectProperty;
export declare function createSchemaItem(type: ExtendType): SchemaItem;
export declare function createSchemaDetector(detectTypeName: (json: any) => ExtendType): (json: any) => SchemaItem;
export declare function generateVuexID(): string;
export declare function getValueByPath(obj: any, path: any[]): any;
export declare function getSchemaByPath(schema: SchemaItem, path: any[]): SchemaItem;
