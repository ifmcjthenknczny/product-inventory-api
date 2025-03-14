import { Schema } from "joi";

class ValidationError extends Error {
    status = 400;
}

const validateSchema = <T>(data: unknown, schema: Schema<T>): T => {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

    if (error) {
        const message = error.details.map((d) => d.message).join(", ");
        throw new ValidationError(message);
    }

    return value;
};

export default validateSchema;
