import {BadRequestException, Injectable, PipeTransform} from "@nestjs/common";


@Injectable()
export class ParseBigintPipe implements PipeTransform<string, bigint> {
	transform(value: string) {
		if (!/^\d+$/.test(value)) {
			throw new BadRequestException('Invalid number');
		}
		return BigInt(value);
	}
}