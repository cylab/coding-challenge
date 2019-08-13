import { Company } from "./Company";

// If not otherwise required, every property should be immutable to prevent side effects and concurrent modification
export class Customer {
    constructor(
        readonly firstName: string,
        readonly lastName: string,
        readonly dateOfBirth: Date,
        readonly emailAddress: string,
        readonly company: Company,
        readonly hasCreditLimit: boolean,
        readonly creditLimit?: number,
    ) {}
}
