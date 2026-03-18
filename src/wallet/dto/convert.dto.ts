import { IsNotEmpty, IsNumber, Min, IsString, Length } from 'class-validator';

export class ConvertWalletDto {
  @IsString()
  @Length(3, 3)
  fromCurrency: string;

  @IsString()
  @Length(3, 3)
  toCurrency: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
