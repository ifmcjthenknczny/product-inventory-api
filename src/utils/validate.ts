import { Schema } from "joi";

const validateSchema = <T>(data: unknown, schema: Schema): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    throw new Error( error.details.map((d) => d.message).join(", "))
  }

  return value;
};

export default validateSchema;
