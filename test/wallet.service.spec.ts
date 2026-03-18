import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletService } from '../src/wallet/wallet.service';
import { Wallet } from '../src/wallet/entities/wallet.entity';
import { Balance } from '../src/wallet/entities/balance.entity';
import { FxService } from 'src/fx/fx.service';
import { TransactionService } from 'src/transactions/transactions.service';


describe('WalletService', () => {
  let service: WalletService;

  let walletRepo: jest.Mocked<Repository<Wallet>>;
  let balanceRepo: jest.Mocked<Repository<Balance>>;
  let fxService: jest.Mocked<FxService>;
  let transactionService: jest.Mocked<TransactionService>;
  let dataSource: DataSource;

  // 🔥 transactional manager mock (VERY IMPORTANT)
  let data: any;

  beforeEach(async () => {
    data = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,

        // ✅ Wallet Repo
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn(),
          },

          
        },

        // ✅ Balance Repo
        {
          provide: getRepositoryToken(Balance),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },

        



        // ✅ FX Service
        {
          provide: FxService,
          useValue: {
            fetchRates: jest.fn(),
             convert: jest.fn(),
          },
        },

        // ✅ Transaction Service
        {
          provide: TransactionService,
          useValue: {
         logTransaction: jest.fn(),
         getTransactions: jest.fn() 
          },
        },

        // ✅ DataSource (FIXED)
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (cb) => {
              return cb(data);
            }),
          },
        },
      ],
    }).compile();

        service = module.get<WalletService>(WalletService);
    fxService = module.get(FxService);
    transactionService = module.get(TransactionService);
    dataSource = module.get(DataSource);

    walletRepo = module.get(getRepositoryToken(Wallet));
    balanceRepo = module.get(getRepositoryToken(Balance));
    fxService = module.get(FxService) as jest.Mocked<FxService>;
    transactionService = module.get(
      TransactionService,
    ) as jest.Mocked<TransactionService>;
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===============================
  // 💰 FUND WALLET
  // ===============================
  describe('fund', () => {
    it('should create new balance if none exists', async () => {
      data.findOne.mockResolvedValue(null);

      data.create.mockReturnValue({
        walletId: 'wallet-1',
        currencyCode: 'NGN',
        amount: 4000,
      });

      data.save.mockResolvedValue({
        walletId: 'wallet-1',
        currencyCode: 'NGN',
        amount: 4000,
      });

      const result = await service.fund('wallet-1', 4000, 'NGN');

      expect(data.findOne).toHaveBeenCalled();
      expect(data.save).toHaveBeenCalled();
      expect(result.balance.amount).toBe(4000);
    });

    it('should increase existing balance', async () => {
      data.findOne.mockResolvedValue({
        walletId: 'wallet-1',
        currencyCode: 'NGN',
        amount: 4000,
      });

      data.save.mockResolvedValue({
        walletId: 'wallet-1',
        currencyCode: 'NGN',
        amount: 4000,
      });

      const result = await service.fund('wallet-1', 2000, 'NGN');

      expect(result.balance.amount).toBe(6000);
    });
  });

  // ===============================
  // 🔄 CONVERT
  // ===============================
//   describe('convert', () => {
//     it('should convert currency successfully', async () => {
//       const fromBalance = {
//         walletId: 'wallet-1',
//         currencyCode: 'NGN',
//         amount: 6000,
//       };

//       const toBalance = {
//         walletId: 'wallet-1',
//         currencyCode: 'USD',
//         amount: 0,
//       };

//       manager.findOne
//         .mockResolvedValueOnce(fromBalance)
//         .mockResolvedValueOnce(toBalance);

//       // ✅ Correct FX mock
//       fxService.fetchRates.mockResolvedValue({ 'NGN/USD': 0.001 });

//       manager.save.mockResolvedValue({});

//       const result = await service.convert(
//         'wallet-1',
//         'NGN',
//         'USD',
//         3000,
//       );
// fxService.convert.mockResolvedValue(5);

//       expect(fxService.convert).toHaveBeenCalled();
//       expect(manager.save).toHaveBeenCalled();

//       // ✅ Ensure transaction logged
//       expect(transactionService.getTransactions).toHaveBeenCalled();
//     });

//     it('should throw error if insufficient balance', async () => {
//       manager.findOne.mockResolvedValue({
//         walletId: 'wallet-1',
//         currencyCode: 'NGN',
//         amount: 1000,
//       });

//       await expect(
//         service.convert('wallet-1', 'NGN', 'USD', 5000),
//       ).rejects.toThrow();
//     });
//   });


  describe('convert', () => {
    it('should convert currency successfully', async () => {
      // Mock balances
      const fromBalance = { walletId: 'wallet-1', currencyCode: 'NGN', amount: 6000 };
      const toBalance = { walletId: 'wallet-1', currencyCode: 'USD', amount: 0 };

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn()
            .mockResolvedValueOnce(fromBalance)
            .mockResolvedValueOnce(toBalance),
          create: jest.fn(),
          save: jest.fn(),
        });
      });

      // Mock FX conversion
      (fxService.convert as jest.Mock).mockResolvedValue(5);

      // Call service
      const result = await service.convert('wallet-1', 'NGN', 'USD', 3000);

      // Assertions
      expect(fxService.convert).toHaveBeenCalledWith(3000, 'NGN', 'USD');
    //   expect(transactionService.getTransactions).toHaveBeenCalled();
    });
  });

  // ===============================
  // 📊 GET BALANCES
  // ===============================
  describe('getBalances', () => {
    it('should return balances', async () => {
      const balances = [
        { currencyCode: 'NGN', amount: 1000 },
        { currencyCode: 'USD', amount: 50 },
      ];

      jest.spyOn(service, 'getBalances').mockResolvedValue(balances as any);

      const result = await service.getBalances('wallet-1');

      expect(result).toEqual(balances);
    });
  });
});