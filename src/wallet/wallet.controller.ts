import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { User } from '../auth/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FundWalletDto } from './dto/fund.dto';
import { ConvertWalletDto } from './dto/convert.dto';
import { TradeWalletDto } from './dto/trade.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
     private authService: AuthService,
  ) {}


@Get()
async getBalances(@GetUser('id') userId: string) {
  try {
    const user = await this.authService.getUserByid(userId);

    if (!user || !user.wallet) {
      throw new BadRequestException('User wallet not found');
    }

    console.log('Get balances request for user:', user.id);

    const balances = await this.walletService.getBalances(user.wallet.id);

    return {
      message: 'Balances fetched successfully',
      data: balances,
    };
  } catch (error) {
    console.error('Error fetching balances:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'Failed to fetch balances',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


@Post('fund')
async fundWallet(
  @GetUser('id') userId: string,
  @Body() dto: FundWalletDto,
) {
  try {
    const user = await this.authService.getUserByid(userId);

    if (!user || !user.wallet) {
      throw new BadRequestException('User wallet not found');
    }

    console.log('Fund wallet request:', { userId: user.id, ...dto });

    const result = await this.walletService.fund(
      user.wallet.id,
      dto.amount,
      dto.currencyCode,
    );

    return {
      message: 'Wallet funded successfully',
      data: result,
    };
  } catch (error) {
    console.error('Error funding wallet:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'Failed to fund wallet',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


@Post('convert')
async convertCurrency(
  @GetUser('id') userId: string,
  @Body() dto: ConvertWalletDto,
) {
  try {
    const user = await this.authService.getUserByid(userId);

    if (!user || !user.wallet) {
      throw new BadRequestException('User wallet not found');
    }

    console.log('Convert currency request:', {
      userId: user.id,
      ...dto,
    });

    const result = await this.walletService.convert(
      user.wallet.id,
      dto.fromCurrency,
      dto.toCurrency,
      dto.amount,
    );

    return {
      message: 'Currency converted successfully',
      data: result,
    };
  } catch (error) {
    console.error('Error converting currency:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'Failed to convert currency',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


@Post('trade')
async tradeCurrency(
  @GetUser('id') userId: string,
  @Body() dto: TradeWalletDto,
) {
  try {
    const user = await this.authService.getUserByid(userId);

    if (!user || !user.wallet) {
      throw new BadRequestException('User wallet not found');
    }

    console.log('Trade currency request:', {
      userId: user.id,
      ...dto,
    });

    const result = await this.walletService.trade(
      user.wallet.id,
      dto.fromCurrency,
      dto.toCurrency,
      dto.amount,
    );

    return {
      message: 'Trade executed successfully',
      data: result,
    };
  } catch (error) {
    console.error('Error trading currency:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'Failed to execute trade',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
