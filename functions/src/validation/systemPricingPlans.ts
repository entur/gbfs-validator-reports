import validate from "./validate";
const gbfsSchema = require("../../schema/system_pricing_plans.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
};
