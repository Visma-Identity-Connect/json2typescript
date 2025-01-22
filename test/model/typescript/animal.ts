import { JsonObject, JsonProperty } from "../../../src/json2typescript/json-convert-decorators";

import { DateConverter } from "./date-converter";
import { Human } from "./human";

@JsonObject("BaseAnimal")
export class BaseAnimal {

    @JsonProperty("name", String)
    name: string = "";

    @JsonProperty("owner", Human, true)
    owner: Human | null = null;

    @JsonProperty("birthdate", DateConverter, true)
    birthdate: Date | null = null;
}

// We cannot use the friends property with `Animal` directly as a recursive reference as it's not allowed - ts(2449)
@JsonObject("Animal")
export class Animal extends BaseAnimal {
    @JsonProperty("friends", [BaseAnimal], true)
    friends: Animal[] | null = null;
}