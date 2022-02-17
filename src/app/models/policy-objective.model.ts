import {Deserializable} from "./deserializable.model";

export class PolicyObjective implements Deserializable{

    public instance!: string;
    public instanceLabel!: string;
    public wikibaseId: string | undefined;

    deserialize(input: any): this {
        return Object.assign(this, {
            instance: input.instance,
            instanceLabel: input.instanceLabel,
            wikibaseId: input.instance.split("/").pop()
        });
    }

}
