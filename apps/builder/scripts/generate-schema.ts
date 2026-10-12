import { writeFileSync } from "node:fs";
import { z } from "zod";
import { docsConfigSchema } from "../src/config.ts";

const schema = z.toJSONSchema(docsConfigSchema, { target: "draft-2020-12", io: "input" });
const out = new URL("../docs.config.schema.json", import.meta.url);
writeFileSync(out, `${JSON.stringify(schema, null, 2)}\n`);
