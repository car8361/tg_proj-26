import {applyDecorators} from "@nestjs/common";
import { ValidateBy} from "class-validator";
import {Transform} from "class-transformer";
import {tap} from "rxjs"

const IsValidId = (value: unknown) => typeof value === "bigint" && value > 0n && value <= 9223372036854775807n;

const toBigInt = (value: unknown) => typeof value === "string" && /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : value;

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

const IsValidIdArray = (value: unknown) => Array.isArray(value) &&  value.every(v => v > 0n && v < 9223372036854775807n);
const ArrayToBigInt = (value: unknown) => Array.isArray(value) && value.map(v => (typeof v === "string" || typeof v === "number") && /^[1-9]\d{0,18}$/.test(v.toString()) ? BigInt(v) : v);

export const IsIdArray = () =>
	applyDecorators(
		Transform(({value}) => ArrayToBigInt(value)),
		ValidateBy({
			name: "IsIdArray",
			validator: {
				validate: IsValidIdArray,
				defaultMessage: () => "$properties must be a valid id"
			}
		})
	)

export default IsId;

