import { Sequelize, Dialect, QueryOptions } from 'sequelize';

interface CustomSequalizeOpt {
    dialect?: Dialect;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    query?: QueryOptions;
}
declare class TimeScaleSequalize extends Sequelize {
    constructor(options?: CustomSequalizeOpt);
    addConstraint(table: string, constraintName: string, constraint1?: string, constraint2?: string): Promise<void>;
    createHyperTable(table: string, constraint: string, interval?: number): Promise<void>;
    createTrigger(name: string, table: string, funcName: string): Promise<void>;
    createFunc(name: string, table: string, column: string[], criteria: string[], constraint?: string): Promise<void>;
}

export { TimeScaleSequalize };
