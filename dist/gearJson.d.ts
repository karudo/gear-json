declare type PathItemType = number | string;
declare type PackedTypeInfo = {
    path: PathItemType[];
    type: string;
};
declare type PackedSchema = PackedTypeInfo[];
declare type PackedObject = [object, PackedSchema];
declare type PackedCollectionWithCommonSchema = {
    type: 1;
    items: object[];
    types: PackedSchema;
};
declare type PackedCollectionWithDifferentSchema = {
    type: 2;
    items: PackedObject[];
};
export declare type TypeDesc = {
    type: string;
    checker: (a: any) => boolean;
    jsonNative?: boolean;
    serialize?: (a: any) => any;
    deserialize?: (a: any) => any;
};
export declare class GearJson {
    private types;
    private typesMap;
    private typesNames;
    private typesCheckers;
    private jsonNativeTypes;
    constructor(extendTypes?: TypeDesc[]);
    detectTypeName(value: any): string;
    determineSchema(value: any, path?: PathItemType[], arr?: PackedTypeInfo[]): PackedTypeInfo[];
    serializeObject(obj: object, types: PackedSchema): object;
    deserializeObject(obj: object, types: PackedSchema): object;
    packObject(obj: object): PackedObject;
    unpackObject([obj, types]: PackedObject): object;
    packSingleSchemaCollection(items: object[], types: PackedSchema): PackedCollectionWithCommonSchema;
    packDifferentSchemaCollection(items: object[]): PackedCollectionWithDifferentSchema;
    unpackCollection(coll: PackedCollectionWithCommonSchema | PackedCollectionWithDifferentSchema): object[];
}
export {};
