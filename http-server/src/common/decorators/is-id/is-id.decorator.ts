import {applyDecorators} from "@nestjs/common";
import {IsNotEmpty, IsNumber, IsUUID, Length, ValidateBy} from "class-validator";
import {Transform} from "class-transformer";

const IsValidId = (value: unknown) => typeof value === "bigint" && value > 0n && value <= 9223372036854775807n;

const toBigInt = (value: unknown) => {
	typeof value === "string" && /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : value;
}

export const IsId = () =>
	applyDecorators(
		Transform(({value}) => toBigInt(value)),
		ValidateBy({
			name: "IsId",
			validator: {
			validate: IsValidId,
			defaultMessage: () => "$property must be a valid id"
			}
		})
	)

export default IsId;

