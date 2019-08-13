import { Classification } from "./Classification";

export class Company {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly classification: Classification,
    ) {}
}
