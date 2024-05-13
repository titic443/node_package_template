// src/function.ts
import { Sequelize } from "sequelize";
var TimeScaleSequalize = class extends Sequelize {
  constructor(options) {
    super(options);
  }
  async addConstraint(table, constraintName, constraint1, constraint2) {
    try {
      if (constraint2) {
        await this.query(
          `
            ALTER TABLE public.${table}
            ADD CONSTRAINT ${constraintName} UNIQUE ("${constraint1}", "${constraint2}");
            COMMIT;
            `,
          {
            raw: true
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
            raw: true
          }
        );
      }
    } catch (err) {
      throw err;
    }
  }
  async createHyperTable(table, constraint, interval) {
    try {
      if (interval) {
        await this.query(
          `SELECT create_hypertable('${table}', '${constraint}', chunk_time_interval => INTERVAL '${interval.toString()} day');`,
          {
            raw: true
          }
        );
      } else {
        await this.query(
          `SELECT create_hypertable('${table}', '${constraint}');`,
          {
            raw: true
          }
        );
      }
    } catch (err) {
      throw err;
    }
  }
  async createTrigger(name, table, funcName) {
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
  async createFunc(name, table, column, criteria, constraint) {
    try {
      let setColumn = "";
      for (let i = 0; i < column.length; i++) {
        if (column.length - 1 == i) {
          setColumn += `"${column[i]}" = NEW. "${column[i]}"`;
        } else {
          setColumn += `"${column[i]}" = NEW. "${column[i]}",
	`;
        }
      }
      let setCriteria = "";
      for (let i = 0; i < criteria.length; i++) {
        if (criteria.length - 1 == i) {
          setCriteria += `"${criteria[i]}" = NEW. "${criteria[i]}";`;
        } else {
          setCriteria += `"${criteria[i]}" = NEW. "${criteria[i]}" and 
	`;
        }
      }
      let newC = column.map((value) => `"${value}"`);
      let newCr = column.map((value) => `NEW. "${value}"
	`);
      let exCr = "";
      for (let i = 0; i < column.length; i++) {
        if (column.length - 1 == i) {
          exCr += `"${column[i]}" = EXCLUDED."${column[i]}";`;
        } else {
          exCr += `"${column[i]}" = EXCLUDED."${column[i]}",
	`;
        }
      }
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
    } catch (err) {
      throw err;
    }
  }
};
export {
  TimeScaleSequalize
};
//# sourceMappingURL=index.mjs.map