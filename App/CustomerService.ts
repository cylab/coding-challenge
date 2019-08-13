import {Company} from "./Company";
import {CompanyRepository} from "./CompanyRepository";
import {Customer} from "./Customer";
import {CustomerDataAccess} from "./CustomerDataAccess";
import {Fail, Ok, Result} from "./Result";

// These are constants that were hardcoded in the verifications
// it would be very likely, that they need to be derived from some
// context (like customer nationality, company status etc.),
// but since I don't know this now, I put them here to keep it simple.
// In later refactorings I can use "find usages" to identify the code to refactor.
const minAge = 21;
const minCreditLimit = 500;
const veryImportantClient = "VeryImportantClient";

export class CustomerService {

    // dependencies should be passed in the constructor to be able to mock them in tests
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly customerDataAccess: CustomerDataAccess,
    ) {}

    // Arguments of service-methods should be typed to the expected type.
    // Any conversion should happen before the call.
    //
    // In a usual backend-application, I would probably wrap the arguments
    // in a DTO and convert it to a domain object in the controller before
    // passing it into the service. This would probably need a CustomerBuilder
    // that resolves the companyId to a company instance while constructing
    // the Customer domain object.
    //
    // But for the sake of _not_ overengineering the solution, I leave it like it is here ;)
    //
    // Last but not least, returning a bare boolean as a result was not informative enough,
    // so I changed  the return type to something that can provide detailed error messages.
    public addCustomer(firstName: string, lastName: string, email: string, dateOfBirth: Date, companyId: string): Result<Customer, Error[]> {

        // everything that is not absolutely required to be mutable, should be immutable (const, readonly)
        const company = this.companyRepository.getById(companyId);

        // CLARIFICATION NEEDED by the Product Owner!!!
        // This whole credit-limit stuff makes very little sense in the real world...
        // See the function comment for more thoughts...
        const creditLimit = findCreditLimit(company);

        // call a bunch of verifications as preconditions before continuing
        const errors = new Array<Error>().concat(
            verifyCompany(companyId, company),
            verifyFullName(firstName, lastName),
            verifyEmail(email),
            verifyAge(dateOfBirth),
            verifyCreditLimit(creditLimit),
        );

        // In Java, I would probably throw a checked Exception here, but
        // this might be tedious to handle in functional programming styles
        // and also is a bit disdained by non-java programmers
        if (errors.length > 0) {
            return new Fail<Customer, Error[]>(errors);
        }

        // Pass _all_ properties during construction and don't modify them afterwards
        const customer: Customer = {
            company: company!,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            emailAddress: email,
            hasCreditLimit: creditLimit !== undefined,
            creditLimit: creditLimit,
        };

        // The customerDataAccess should be an instance, since static method calls are difficult to mock.
        // Some more problem points:
        // - error-handling is missing in case storing the data does not work
        // - the Customer should get an ID from customerDataAccess to retrieve it later
        // - duplicate of customers are/cannot be handled
        this.customerDataAccess.addCustomer(customer);

        // I want the caller to get the created customer, so I return it in the Ok result.
        return new Ok<Customer, Error[]>(customer);
    }
}

// ----------------> Verifications <----------------

// a little syntactic sugar for the verifications...
const verified: Error[] = [];
const emailPattern = new RegExp(/^\S+?@\S+\.\S+$/); // very simple email pattern

function verifyCompany(companyId: any, company?: Company): Error[] {
    return company ? verified
        : [new Error(`No company found for id '${companyId}'`)];
}

function verifyFullName(firstName: string, lastName: string): Error[] {
    // the ! operator might be difficult to spot sometimes,
    // so providing a function to check the desired state is easier to read
    const bothNamesGiven = isNotEmpty(firstName) && isNotEmpty(lastName);
    return bothNamesGiven ? verified
        : [new Error(`Both 'firstName' and 'lastName' must be provided`)];
}

function verifyEmail(email: string): Error[] {
    return email.match(emailPattern) != null ? verified
        : [new Error(`Given email address is invalid`)];
}

function verifyAge(dateOfBirth: Date): Error[] {
    return findAge(dateOfBirth) >= minAge ? verified
        : [new Error(`Not old enough`)];
}

function verifyCreditLimit(creditLimit?: number): Error[] {
    const goodCredit = creditLimit === undefined || creditLimit! >= minCreditLimit;
    return goodCredit ? verified
        : [new Error(`Insufficient credit limit`)];
}

// CLARIFICATION NEEDED by the Product Owner!!!
// I don't have any business requirements to refactor the creditLimit handling correctly...
//
// Problematic points:
// - checking against a hardcoded company name is very bad, but I don't have enough information to do otherwise
// - only customers of "VeryImportantClient" can be added -> with current CompanyRepository, that means _no_ customer
// - there are Classifications (Bronze, Silver, Gold), but I don't have information to map these to creditLimits
// - the creditLimit only depends on the company and realistically may change over time, so
//   - storing it in the customer makes no sense
//   - it should be derived from the company association dynamically
//   - it should come from some storage
//   - it should not be checked on customer creation/addition, but on purchases
function findCreditLimit(company?: Company): number | undefined {
    // I want the function to _always_ return a value to make the
    // validation easier, so I expect company to be optional
    if (!company || company.name === veryImportantClient) {
        // Skip credit check
        return undefined;
    } else {
        // Do credit check
        return 10;
    }
}

// ----------------> Utilities <----------------

function isNotEmpty(value: string): boolean {
    return value != null && value !== "";
}

// Despite being local to this module, the formerly used datediff() implementation
// was broader than the use case and also contained errors:
// - it used string constants instead of enums
// - it missed entries for 'y' and 'm'
// - it did not take leap days into account
//
// so I replaced it with a function that does the only thing we need: calculating the age.
// In a real-world application, I probably would use MomentJS though...
function findAge(dateOfBirth: Date): number {
    const today = new Date();
    const todayOffset = today.getMonth() * 31 + today.getDate();
    const birthOffset = dateOfBirth.getMonth() * 31 + dateOfBirth.getDate();
    const preBDayCorrection = (todayOffset - birthOffset) < 0 ? 1 : 0;
    return today.getFullYear() - dateOfBirth.getFullYear() - preBDayCorrection;
}
