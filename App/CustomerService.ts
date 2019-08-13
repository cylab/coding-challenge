import { CompanyRepository } from "./CompanyRepository";
import { Customer } from "./Customer";
import { CustomerDataAccess } from "./CustomerDataAccess";

export class CustomerService
{
    AddCustomer(firname, surname, email, dateOfBirth, companyId)
    {
        if (firname || surname)
        {
            return false;
        }

        if (!email.Contains("@") && !email.Contains("."))
        {
            return false;
        }

        var now = Date();
        var age = datediff('y', dateOfBirth, now);
        if (age < 21)
        {
            return false;
        }

        var companyRepository = new CompanyRepository();
        var company = companyRepository.GetById(companyId);

        var customer: Customer = {
            Company: company,
            DateOfBirth: dateOfBirth,
            EmailAddress: email,
            Firstname: firname,
            Surname: surname
        };
        if (company.Name == "VeryImportantClient")
        {
            // Skip credit check
            customer.HasCreditLimit = false;
        }
        else
        {
            // Do credit check
            customer.HasCreditLimit = true;
            customer.CreditLimit = 10;
        }

        if (customer.HasCreditLimit && customer.CreditLimit < 500)
        {
            return false;
        }

        CustomerDataAccess.AddCustomer(customer);

        return true;
    }
}


// datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
function datediff(datepart, fromdate, todate) {
    datepart = datepart.toLowerCase();
    var diff = todate - fromdate;
    var divideBy = {
        w: 604800000,
        d: 86400000,
        h: 3600000,
        n: 60000,
        s: 1000
    };

    return Math.floor(diff / divideBy[datepart]);
}