import { MappingOptions, Settings } from "./json-convert-options";
import { Any } from "./any";
import { PropertyConvertingMode } from "./json-convert-enums";


/**
 * Map of all registered json objects
 */
const jsonObjectsMap: Map<string, { new(): any }> = new Map<string, { new(): any }>();

/**
 * Decorator of a class that is a custom converter.
 *
 * @param target the class
 */
export function JsonConverter(target: any): void {
    target[Settings.MAPPER_PROPERTY] = "";
}

/**
 * Decorator of a class that comes from a JSON object.
 *
 * @param classIdentifier the class identifier
 *
 * @returns
 *
 * @throws Error
 */
export function JsonObject(classIdentifier?: string | undefined) {
    return function <T extends new (...args: any) => any>(target: T, context: ClassDecoratorContext<T>): void {
        let className = classIdentifier ? classIdentifier : context.name!;

        // Store the classIdentifier with the actual class reference
        if (jsonObjectsMap.has(className)) {
            throw new Error(
                'Fatal error in JsonConvert. ' +
                    'You must use unique class identifiers in the @JsonObject() decorator.\n\n' +
                    '\tClass identifier: \n' +
                    '\t\t' +
                    className +
                    '\n\n' +
                    'This class identifier has been already used for class "' +
                    jsonObjectsMap.get(className)?.name +
                    '".\n\n'
            );
        } else {
            jsonObjectsMap.set(className, target);
        }

        target.prototype[Settings.CLASS_IDENTIFIER] = className;

        if (!context.metadata) {
            return;
        }

        const mapping = context.metadata[Settings.MAPPING_PROPERTY] as { [key: string]: MappingOptions };

        // Make sure we replace the mapping names of all properties of this class
        if (!mapping) {
            return;
        }

        const unmappedKeys = Object.keys(mapping).filter((val) => val.indexOf(`${Settings.CLASS_IDENTIFIER}.`) === 0);

        for (const key of unmappedKeys) {
            const replacedKey = key.replace(Settings.CLASS_IDENTIFIER, className);
            mapping[replacedKey] = mapping[key];

            // We must delete the mapping without associated class since it will
            // cause issues with inheritance of mappings and overrides.
            delete mapping[key];
        }

        target.prototype[Settings.MAPPING_PROPERTY] = mapping;
    };
}

/**
 * Decorator of a class property that comes from a JSON object.
 *
 * The second param can be either a type or a class of a custom converter.
 *
 * Use the following notation for the type:
 * - Primitive type: String|Number|Boolean
 * - Custom type: YourClassName
 * - Array type: [String|Number|Boolean|YourClassName]
 *
 * If you decide to use a custom converter, make sure this class implements the interface JsonCustomConvert from this package.
 *
 * @param jsonPropertyName optional param (default: classPropertyName) the property name in the expected JSON object
 * @param conversionOption optional param (default: Any), should be either the expected type (String|Boolean|Number|etc) or a custom converter class implementing JsonCustomConvert
 * @param convertingMode optional param (default: PropertyConvertingMode.MAP_NULLABLE), determines how nullable
 * property types should be serialized and deserialized
 *
 * @returns
 *
 * @throws Error
 */
export function JsonProperty(...params: any[]) {
    return function <C, V>(target: undefined, context: ClassFieldDecoratorContext<C, V>): void {
        const classPropertyName = String(context.name);

        let jsonPropertyName: string = classPropertyName;
        let conversionOption: any = Any;
        let convertingMode: PropertyConvertingMode = PropertyConvertingMode.MAP_NULLABLE;

        switch (params.length) {
            case 1:
                if (params[0] === undefined)
                    throw new Error(
                        'Fatal error in JsonConvert. ' +
                            'It is not allowed to explicitly pass "undefined" as first parameter in the @JsonProperty decorator.\n\n' +
                            '\tClass property: \n' +
                            '\t\t' +
                            classPropertyName +
                            '\n\n' +
                            'Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n'
                    );
                jsonPropertyName = params[0];
                break;
            case 2:
                if (params[0] === undefined)
                    throw new Error(
                        'Fatal error in JsonConvert. ' +
                            'It is not allowed to explicitly pass "undefined" as first parameter in the @JsonProperty decorator.\n\n' +
                            '\tClass property: \n' +
                            '\t\t' +
                            classPropertyName +
                            '\n\n' +
                            'Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n'
                    );
                if (params[1] === undefined)
                    throw new Error(
                        'Fatal error in JsonConvert. ' +
                            'It is not allowed to explicitly pass "undefined" as second parameter in the @JsonProperty decorator.\n\n' +
                            '\tClass property: \n' +
                            '\t\t' +
                            classPropertyName +
                            '\n\n' +
                            'Use "Any" to allow any type. You can import this class from "json2typescript".\n\n'
                    );
                jsonPropertyName = params[0];
                conversionOption = params[1];
                break;
            case 3:
                if (params[0] === undefined)
                    throw new Error(
                        'Fatal error in JsonConvert. ' +
                            'It is not allowed to explicitly pass "undefined" as first parameter in the @JsonProperty decorator.\n\n' +
                            '\tClass property: \n' +
                            '\t\t' +
                            classPropertyName +
                            '\n\n' +
                            'Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n'
                    );
                if (params[1] === undefined)
                    throw new Error(
                        'Fatal error in JsonConvert. ' +
                            'It is not allowed to explicitly pass "undefined" as second parameter in the @JsonProperty decorator.\n\n' +
                            '\tClass property: \n' +
                            '\t\t' +
                            classPropertyName +
                            '\n\n' +
                            'Use "Any" to allow any type. You can import this class from "json2typescript".\n\n'
                    );
                jsonPropertyName = params[0];
                conversionOption = params[1];
                if (params[2] === true) {
                    convertingMode = PropertyConvertingMode.IGNORE_NULLABLE;
                } else if (params[2] === PropertyConvertingMode.IGNORE_NULLABLE || params[2] === PropertyConvertingMode.PASS_NULLABLE || params[2] === PropertyConvertingMode.MAP_NULLABLE) {
                    convertingMode = params[2];
                } else {
                    convertingMode = PropertyConvertingMode.MAP_NULLABLE;
                }
                break;
            default:
                break;
        }

        if (!context.metadata) {
            return;
        }

        let propertiesMapping: { [key: string]: MappingOptions } = {};

        if (!context.metadata[Settings.MAPPING_PROPERTY]) {
            context.metadata[Settings.MAPPING_PROPERTY] = propertiesMapping;
        } else {
            propertiesMapping = context.metadata[Settings.MAPPING_PROPERTY] as { [key: string]: MappingOptions };
        }

        let jsonPropertyMappingOptions = new MappingOptions();
        jsonPropertyMappingOptions.classPropertyName = classPropertyName;
        jsonPropertyMappingOptions.jsonPropertyName = jsonPropertyName;
        jsonPropertyMappingOptions.convertingMode = convertingMode;

        // Check if conversionOption is a type or a custom converter.
        if (typeof conversionOption !== 'undefined' && conversionOption !== null && typeof conversionOption[Settings.MAPPER_PROPERTY] !== 'undefined') {
            jsonPropertyMappingOptions.customConverter = new conversionOption();
        } else {
            jsonPropertyMappingOptions.expectedJsonType = conversionOption;
        }

        // Save the mapping info
        const propertyKey = `${Settings.CLASS_IDENTIFIER}.${classPropertyName}`;
        if (typeof propertiesMapping[propertyKey] === 'undefined') {
            propertiesMapping[propertyKey] = jsonPropertyMappingOptions;
        } else {
            throw new Error('Fatal error in JsonConvert. ' + 'It is not allowed to add multiple decorators for the same property.\n\n' + '\tClass property: \n' + '\t\t' + classPropertyName + '\n\n');
        }
    };
}
