"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  TimeScaleSequalize: () => TimeScaleSequalize
});
module.exports = __toCommonJS(src_exports);

// src/function.ts
var import_sequelize = require("sequelize");
var TimeScaleSequalize = class extends import_sequelize.Sequelize {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeScaleSequalize
});
//# sourceMappingURL=index.js.map