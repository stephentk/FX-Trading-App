import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FxService } from './fx.service';

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

 @Get('rates')
  async getRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    if (!fromCurrency || !toCurrency) {
      throw new HttpException(
        'Both from and to currencies are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const rate = await this.fxService.getRatePair(fromCurrency, toCurrency);
      return {
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        rate,
      };
    } catch (error) {
      console.error('Error fetching FX rate:', error.message);
      throw new HttpException(
        'Failed to fetch FX rate',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}