interface BaseResult<T, E> {
    isOk(): boolean;
    isErr(): boolean;
    value(): T;
    err(): E;
}

export class Ok<T, E> implements BaseResult<T, E> {
    constructor(private okValue: T) {}

    public isOk(): boolean {
        return true;
    }

    public isErr(): boolean {
        return false;
    }

    public value(): T {
        return this.okValue;
    }

    public err(): E {
        throw new Error("Illegal error access on successful result!");
    }

    public toString() {
        return "Some " + this.value;
    }
}

export class Fail<T, E> implements BaseResult<T, E> {
    constructor(private error: E) {}

    public isOk(): boolean {
        return false;
    }

    public isErr(): boolean {
        return true;
    }

    public value(): T {
        throw new Error("Illegal value access on failed result!");
    }

    public err(): E {
        return this.error;
    }
}

export type Result<T, E> = Ok<T, E> | Fail<T, E>;
