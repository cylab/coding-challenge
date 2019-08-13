import { Company } from "./Company";

export class Customer {
    Firstname;
    Surname;
    DateOfBirth;
    EmailAddress;
    HasCreditLimit?;
    CreditLimit?;
    Company: Company;
}