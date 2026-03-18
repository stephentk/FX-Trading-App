# FX Wallet & Trading API

## 📌 Overview

This project is a **multi-currency wallet and FX trading system** built with **NestJS + TypeORM**.
It allows users to register, verify via OTP, manage wallets, fund accounts, convert currencies, and trade NGN with other currencies.

---

# ⚙️ Setup Instructions

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fx-wallet-app
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Setup Environment Variables

Create a `.env` file:

DB_HOST=
DB_PORT=
DB_USERNAME
DB_PASSWORD==
DB_NAME

FX_API_KEY = =
FX_API_URL = 'https://api.exchangerate-api.com/v4/latest'


JWT_SECRET=
JWT_EXPIRATION=1h

EMAIL_USER==
EMAIL_PASS==

PORT=3000
```

---

## 4. Run Database

Make sure PostgreSQL is running, then:

```bash
npm run start:dev
```

> Tables will be created automatically using:

```ts
synchronize: true
```
npm run test
---

## 5. Run Redis (Optional for OTP)

```bash
redis-server
```

---

# 🔐 Authentication Flow

## 1. Register

**POST `/auth/register`**

* Creates user
* Creates wallet
* Sends OTP to email

---

## 2. Verify OTP

**POST `/auth/verify`**

* Validates OTP
* Activates account

---

# 💰 Wallet APIs

## Get Wallet Balance

**GET `/wallet`**

Returns balances per currency:

```json
{
  "NGN": 50000,
  "USD": 120
}
```

---

## Fund Wallet

**POST `/wallet/fund`**

```json
{
  "amount": 10000,
  "currencyCode": "NGN"
}
```

---

## Convert Currency

**POST `/wallet/convert`**

```json
{
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "amount": 100
}
```

---

## Trade Currency

**POST `/wallet/trade`**

```json
{
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "amount": 50000
}
```

> Trade rules:

* Only NGN ↔ Other currencies
* Cannot trade USD → EUR directly

---

# 📊 FX APIs

## Get Current Rates

**GET `/fx/rates`**

```json
{
  "USD": 1500,
  "EUR": 1650
}
```

---

# 📜 Transactions

## Get Transaction History

**GET `/transactions`**

---

# 🛠 Admin APIs

## Make Admin

**PATCH `/admin/makeAdmin/:userId`**

## Remove Admin

**PATCH `/admin/removeAdmin/:userId`**

> Protected by `AdminGuard`

---

# 📈 Analytics APIs

## User Activity

**GET `/analytics/allusers**
**GET `/analytics/user/:id**

## User Trades

**GET `/analytics/user/trades/:id`**

## All Users (Paginated)

**GET `/analytics/users/activity?page=1&limit=10`**

---

# 🧠 Key Assumptions

1. **Wallet Creation**

   * Wallet is automatically created during user registration.

2. **Initial Balance**

   * Default balance is **0** for all currencies.

3. **Currency Handling**

   * Supported currencies: `NGN, USD, EUR, GBP`
   * Currency codes are always uppercase.

4. **FX Rates**

   * Rates are fetched from an external service (or mocked).
   * No historical FX storage (uses `rateUsed` in transactions).

5. **Transactions**

   * Every action logs a transaction:

     * FUND
     * CONVERT
     * TRADE

6. **Precision**

   * Uses `decimal(18,4)` for balances
   * Uses `decimal(18,8)` for FX rates

---

# 🏗 Architectural Decisions

## 1. Modular Structure

* `Auth Module`
* `Wallet Module`
* `Transaction Module`
* `Analytics Module`
* `Admin Module`

---

## 2. Transaction Logging

Every wallet operation writes to the **Transaction table**:

| Type    | Description         |
| ------- | ------------------- |
| FUND    | Deposit funds       |
| CONVERT | Currency conversion |
| TRADE   | NGN ↔ FX trading    |

---

## 3. Wallet Design

* One wallet per user
* Multiple balances per wallet (per currency)

---


## 4. Atomic Transactions

All wallet operations use:

```ts
dataSource.transaction(...)
```

Ensures:

* No partial updates
* Data consistency

---

# 🔄 Flow Diagrams

## Wallet Funding Flow

```
User → API → Validate Amount
     → Update Balance
     → Log Transaction
     → Return Response
```

---

## Currency Conversion Flow

```
Check Balance → Fetch FX Rate → Convert Amount
→ Deduct From Source → Add To Target
→ Save Both Balances → Log Transaction
```

---

## Trade Flow (NGN ↔ FX)

```
Validate NGN Pair
→ Check Balance
→ Apply FX Rate
→ Update Wallet
→ Log Transaction
```

---

# 📦 API Documentation

##  Postman

****
https://web.postman.co/workspace/aafa996c-812b-480b-8ac0-fb50618f187e/collection/25081348-60b2b0fd-b806-4727-80ec-123a62c01c48?action=share&source=copy-link&creator=25081348
---



---

#
