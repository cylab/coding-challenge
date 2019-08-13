import { Company } from "./Company";
import { Classification } from "./Classification";

export class CompanyRepository {
    GetById(id): Company {
        return {
            Id: id,
            Name: "test",
            Classification: Classification.Bronze
       }
    }
}