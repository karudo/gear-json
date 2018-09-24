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
export declare function packObject(obj: object): PackedObject;
export declare function unpackObject(packedObj: PackedObject): object;
export declare function packSingleSchemaCollection(items: object[], types: PackedSchema): PackedCollectionWithCommonSchema;
export declare function packDifferentSchemaCollection(items: object[]): PackedCollectionWithDifferentSchema;
export declare function unpackCollection(coll: PackedCollectionWithCommonSchema | PackedCollectionWithDifferentSchema): object[];
export {};
