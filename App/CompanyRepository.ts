import { Classification } from "./Classification";
import { Company } from "./Company";

export class CompanyRepository {
    public getById(id: string): Company | undefined {
        return {
            id: id,
            name: "test",
            classification: Classification.Bronze,
       };
    }
}
