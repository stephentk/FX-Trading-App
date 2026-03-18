
import { Controller, Get, Param, Query, UseGuards, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './admin.service';
import { AdminGuard } from '../common/guards/admin-guard';
import { Admin } from '../common/decorators/admin.decorator';


@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService:AnalyticsService ) {}
@Patch('makeAdmin/:userId')
async promoteUser(@Param('userId') userId: string) {
  try {
    const result = await this.analyticsService.MakeAdmin(userId);
    return {
      message: 'User is admin successfully',
      data: result,
    };
  } catch (error) {
  
  
    throw new HttpException(
      {
        message: 'Failed to make admin',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
 
@Patch('removeAdmin/:userId')
@UseGuards(AdminGuard)
async demoteUser(@Param('userId') userId: string) {
  try {
    const result = await this.analyticsService.MakeUser(userId);
    return {
      message: 'User demoted from admin successfully',
      data: result,
    };
  } catch (error) {

    throw new HttpException(
      {
        message: 'Failed to make user',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

 @Get('allusers')
@UseGuards(AdminGuard)
async getAllUsers(
  @Query('page') page: string,
  @Query('limit') limit: string,
) {
  try {
    const users = await this.analyticsService.getAllUsers(Number(page) || 1, Number(limit) || 10);
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new HttpException(
      {
        message: 'Failed to fetch users',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


@Get('user/:id')
@UseGuards(AdminGuard)
async getUser(@Param('id') id: string) {
  try {
    const user = await this.analyticsService.getUserById(id);
    return {
      message: 'User fetched successfully',
      data: user,
    };
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw new HttpException(
      {
        message: 'Failed to fetch user',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Get('user/trades/:id')
@UseGuards(AdminGuard)
async getUserTrades(@Param('id') userId: string) {
  try {
    const trades = await this.analyticsService.getUserTrades(userId);
    return {
      message: 'User trades fetched successfully',
      data: trades,
    };
  } catch (error) {
    console.error(`Error fetching trades for user ${userId}:`, error);
    throw new HttpException(
      {
        message: 'Failed to fetch user trades',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Get('users/activity')
@UseGuards(AdminGuard)
async getUserActivity(
  @Query('page') page: string,
  @Query('limit') limit: string,
) {
  try {
    const activity = await this.analyticsService.getAllUsersTradesPaginated(
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      message: 'User activity fetched successfully',
      data: activity,
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw new HttpException(
      {
        message: 'Failed to fetch user activity',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

}