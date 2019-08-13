import * as chai from "chai";
import * as sinon from "sinon";
import {SinonStubbedInstance} from "sinon";
import {Classification} from "../App/Classification";
import {CompanyRepository} from "../App/CompanyRepository";
import {CustomerDataAccess} from "../App/CustomerDataAccess";
import {CustomerService} from "../App/CustomerService";

const expect = chai.expect;

describe("CustomerService", function() {
    const thisYear = new Date().getFullYear();

    describe("addCustomer", function() {
        let companyRepository: SinonStubbedInstance<CompanyRepository>;
        let customerDataAccess: SinonStubbedInstance<CustomerDataAccess>;
        let underTest: CustomerService;

        beforeEach(() => {
            companyRepository = sinon.createStubInstance(CompanyRepository);
            customerDataAccess = sinon.createStubInstance(CustomerDataAccess);
            underTest = new CustomerService(companyRepository, customerDataAccess);
        });

        it("fails on unknown company", function() {
            companyRepository.getById.returns(undefined);

            const result = underTest.addCustomer("first", "last", "first.last@email.com", new Date(thisYear - 22, 1, 1), "unknown");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members(["No company found for id 'unknown'"]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        it("fails on missing firstName", function() {
            companyRepository.getById.returns({
                id: "important",
                name: "VeryImportantClient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("", "last", "first.last@email.com", new Date(thisYear - 22, 1, 1), "important");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members(["Both 'firstName' and 'lastName' must be provided"]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        it("fails on missing lastName", function() {
            companyRepository.getById.returns({
                id: "important",
                name: "VeryImportantClient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("first", "", "first.last@email.com", new Date(thisYear - 22, 1, 1), "important");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members(["Both 'firstName' and 'lastName' must be provided"]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        ["", "first.last@email", "first.lastATemail.com", "first last@email.com"].forEach((email) =>
            it(`fails on invalid email '${email}'`, function() {
                companyRepository.getById.returns({
                    id: "important",
                    name: "VeryImportantClient",
                    classification: Classification.Bronze,
                });

                const result = underTest.addCustomer("first", "last", email, new Date(thisYear - 22, 1, 1), "important");

                expect(result.isErr()).to.equal(true);
                expect(result.err().map((err) => err.message)).to.have.members(["Given email address is invalid"]);

                sinon.assert.calledOnce(companyRepository.getById);
                sinon.assert.notCalled(customerDataAccess.addCustomer);
            }),
        );

        it("fails on low age", function() {
            companyRepository.getById.returns({
                id: "important",
                name: "VeryImportantClient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("first", "last", "first.last@email.com", new Date(thisYear - 19, 1, 1), "important");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members(["Not old enough"]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        it("fails on insufficient credit limit", function() {
            companyRepository.getById.returns({
                id: "insufficient",
                name: "insufficient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("first", "last", "first.last@email.com", new Date(thisYear - 22, 1, 1), "insufficient");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members(["Insufficient credit limit"]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        it("can handle multiple failures", function() {
            companyRepository.getById.returns({
                id: "insufficient",
                name: "insufficient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("first", "", "first.last@email.com", new Date(thisYear - 12, 1, 1), "insufficient");

            expect(result.isErr()).to.equal(true);
            expect(result.err().map((err) => err.message)).to.have.members([
                "Not old enough",
                "Both 'firstName' and 'lastName' must be provided",
                "Insufficient credit limit",
            ]);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.notCalled(customerDataAccess.addCustomer);
        });

        it("adds a valid customer", function() {
            companyRepository.getById.returns({
                id: "important",
                name: "VeryImportantClient",
                classification: Classification.Bronze,
            });

            const result = underTest.addCustomer("first", "last", "first.last@email.com", new Date(thisYear - 22, 1, 1), "important");

            expect(result.isOk()).to.equal(true);
            const customer = result.value();
            expect(customer.firstName).to.equal("first");
            expect(customer.lastName).to.equal("last");
            expect(customer.emailAddress).to.equal("first.last@email.com");
            expect(customer.dateOfBirth).to.deep.equal(new Date(thisYear - 22, 1, 1));
            expect(customer.hasCreditLimit).to.equal(false);
            expect(customer.creditLimit).to.equal(undefined);

            sinon.assert.calledOnce(companyRepository.getById);
            sinon.assert.calledOnce(customerDataAccess.addCustomer);
        });

    });
});
