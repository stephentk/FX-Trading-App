import { IsNotEmpty, IsNumber, Min, IsString, Length } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @Length(3, 3, { message: 'Currency code must be 3 letters, e.g., NGN, USD' })
  currencyCode: string;
}
