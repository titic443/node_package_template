import { Dialect, QueryOptions, Sequelize } from "sequelize";

interface CustomSequalizeOpt {
  dialect?: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  query?: QueryOptions;
}

export class TimeScaleSequalize extends Sequelize {
  constructor(options?: CustomSequalizeOpt) {
    super(options);
  }

  async addConstraint(
    table: string,
    constraintName: string,
    constraint1?: string,
    constraint2?: string
  ) {
    try {
      if (constraint2) {
        await this.query(
          `
            ALTER TABLE public.${table}
            ADD CONSTRAINT ${constraintName} UNIQUE ("${constraint1}", "${constraint2}");
            COMMIT;
            `,
          {
            raw: true,
          }
        );
      } else {
        await this.query(
          `
              ALTER TABLE public.${table}
              ADD CONSTRAINT ${constraintName} UNIQUE ("${constraint1}");
              COMMIT;
              `,
          {
            raw: true,
          }
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async createHyperTable(table: string, constraint: string, interval?: number) {
    try {
      if (interval) {
        await this.query(
          `SELECT create_hypertable('${table}', '${constraint}', chunk_time_interval => INTERVAL '${interval.toString()} day');`,
          {
            raw: true,
          }
        );
      } else {
        await this.query(
          `SELECT create_hypertable('${table}', '${constraint}');`,
          {
            raw: true,
          }
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async createTrigger(name: string, table: string, funcName: string) {
    try {
      const q = `
      CREATE TRIGGER ${name}
      AFTER INSERT ON "public"."${table}"
      FOR EACH ROW
      EXECUTE FUNCTION ${funcName}();
      `;
      await this.query(q);
    } catch (err) {
      throw err;
    }
  }

  async createFunc(
    name: string,
    table: string,
    column: string[],
    criteria: string[],
    constraint?: string
  ) {
    try {
      let setColumn: string = "";
      for (let i = 0; i < column.length; i++) {
        if (column.length - 1 == i) {
          setColumn += `"${column[i]}" = NEW. "${column[i]}"`;
        } else {
          setColumn += `"${column[i]}" = NEW. "${column[i]}",\n\t`;
        }
      }

      let setCriteria: string = "";
      for (let i = 0; i < criteria.length; i++) {
        if (criteria.length - 1 == i) {
          setCriteria += `"${criteria[i]}" = NEW. "${criteria[i]}";`;
        } else {
          setCriteria += `"${criteria[i]}" = NEW. "${criteria[i]}" and \n\t`;
        }
      }

      let newC = column.map((value) => `"${value}"`);
      let newCr = column.map((value) => `NEW. "${value}"\n\t`);
      let exCr = "";
      for (let i = 0; i < column.length; i++) {
        if (column.length - 1 == i) {
          exCr += `"${column[i]}" = EXCLUDED."${column[i]}";`;
        } else {
          exCr += `"${column[i]}" = EXCLUDED."${column[i]}",\n\t`;
        }
      }

      // console.log(newCr);

      if (constraint) {
        let q = `
        CREATE OR REPLACE FUNCTION ${name} ()
        RETURNS TRIGGER
        AS $$
      BEGIN
        UPDATE
          "public"."${table}"
        SET
        ${setColumn}
        WHERE
        ${setCriteria}
        IF NOT FOUND THEN
          INSERT INTO "public"."${table}" (${newC})
            VALUES(${newCr})
        ON CONFLICT ON CONSTRAINT "${constraint}" DO UPDATE
        SET
          ${exCr}
        END IF;
        RETURN NULL;
      END;
      $$
      LANGUAGE plpgsql;
      `;

        this.query(q);
      } else {
        let q = `
        CREATE OR REPLACE FUNCTION ${name} ()
        RETURNS TRIGGER
        AS $$
      BEGIN
        UPDATE
          "public"."${table}"
        SET
        ${setColumn}
        WHERE
        ${setCriteria}
        IF NOT FOUND THEN
          INSERT INTO "public"."${table}" (${newC})
            VALUES(${newCr});
        END IF;
        RETURN NULL;
      END;
      $$
      LANGUAGE plpgsql;
      `;
        this.query(q);
      }
      // console.log(q);
    } catch (err) {
      throw err;
    }
  }
}
