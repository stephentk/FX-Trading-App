import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Redis from 'ioredis';

@Injectable()
export class FxService {
  private ratesCache: Record<string, number> = {}; // in-memory fallback
  private lastFetched: Date | null = null;
  private readonly FX_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Fetch FX rates from Redis, fallback to in-memory, or fetch from API
   */
  async fetchRates(baseCurrency = 'NGN'): Promise<Record<string, number>> {
    const cacheKey = `fx_rates:${baseCurrency.toUpperCase()}`;

    // 1️⃣ Try Redis first
    const cachedRedis = await this.redis.get(cacheKey);
    if (cachedRedis) {
      return JSON.parse(cachedRedis);
    }

    // 2️⃣ Check in-memory cache
    if (
      this.lastFetched &&
      Date.now() - this.lastFetched.getTime() < this.FX_CACHE_TTL
    ) {
      return this.ratesCache;
    }

    // 3️⃣ Fetch from API
    try {
      const apiUrl = `${this.configService.get<string>('FX_API_URL')}/${baseCurrency}`;
      const apiKey = this.configService.get<string>('FX_API_KEY'); // optional
      const response = await axios.get(`${apiUrl}?apikey=${apiKey}`);
      const data = response.data;

      if (!data || !data.rates) {
        throw new HttpException(
          'Invalid FX API response',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // 4️⃣ Update in-memory cache
      this.ratesCache = data.rates;
      this.lastFetched = new Date();

      // 5️⃣ Save to Redis with expiry (EX = TTL in seconds)
      await this.redis.set(
        cacheKey,
        JSON.stringify(data.rates),
        'EX',
        this.FX_CACHE_TTL / 1000, // convert ms → seconds
      );

      return this.ratesCache;
    } catch (error) {
      console.error('FX API fetch error:', error.message);

      // fallback to in-memory if API fails
      if (this.ratesCache && Object.keys(this.ratesCache).length) {
        return this.ratesCache;
      }

      throw new HttpException(
        'Failed to fetch FX rates',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const rates = await this.fetchRates(fromCurrency.toUpperCase());

    const fromRate = rates[fromCurrency.toUpperCase()];
    const toRate = rates[toCurrency.toUpperCase()];

    if (!fromRate || !toRate) {
      throw new HttpException(
        'Invalid currency for conversion',
        HttpStatus.BAD_REQUEST,
      );
    }

    const converted = amount * (toRate / fromRate);
    return Number(converted.toFixed(2));
  }

async getRatePair(fromCurrency: string, toCurrency: string): Promise<number> {
  const rates = await this.fetchRates(fromCurrency); // fetch base rates
  const fromRate = rates[fromCurrency.toUpperCase()] || 1; // base rate
  const toRate = rates[toCurrency.toUpperCase()];

  if (!toRate) {
    throw new HttpException(
      `Rate not found for ${toCurrency}`,
      HttpStatus.NOT_FOUND,
    );
  }

  // Conversion formula: amount_in_target = 1 * (toRate / fromRate)
  return Number((toRate / fromRate).toFixed(6));
}

}
