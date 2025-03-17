# Simple Inventory Management System

This project is a RESTful API designed to manage an inventory of products, handle stock levels, and process orders efficiently using Node.js and Express.js. The system follows the CQRS pattern and implements business logic for stock management, order processing and creation, and discount calculations.

## Table of contents
- [Features](#features)
- [Technology Stack](#technology-stack)
  * [Npm packages](#npm-packages)
- [Setup & Installation](#setup---installation)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Running the server on local environment](#running-the-server-on-local-environment)
  * [Running with Docker](#running-with-docker)
  * [Testing](#testing)
- [API Endpoints](#api-endpoints)
  * [Product Management](#product-management)
  * [Order Management](#order-management)
- [MongoDB Collection Models](#mongodb-collection-models)
  * [Product](#product)
  * [Order](#order)
  * [Customer](#customer)
- [Pricing Logic](#pricing-logic)
- [Notes](#notes)
- [License](#license)
- [Author](#author)

## Features
- **Operations for products**
- **Stock management** (restocking and selling with stock level constraints)
- **Order processing** with automatic stock reservation and validation
- **Discounts based on volume, seasonal promotions, as well as location-based pricing**
- **Robust validation using Joi**
- **Error handling and proper HTTP status codes**
- **Database persistence using MongoDB (initialized with sample data)**
- **Docker support for easy deployment**
- **CI for development**

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Containerization:** Docker
- **CI/CD:** Github Actions

### Npm packages
- **ORM:** Mongoose
- **Validation:** Joi
- **Date handling:** Luxon
- **Holiday calculations:** date-holidays

## Setup & Installation
### Prerequisites
- Node.js installed (version >=22 recommended)
- Yarn installed globally
- Docker (optional, for containerized deployment)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/ifmcjthenknczny/product-inventory-api.git
   cd product-inventory-api
   ```

After that you can either [run the server on local environment](#running-the-server-on-local-environment) or [run the app using docker](#running-with-docker).

### Running the server on local environment
2. Install dependencies:
   ```sh
   yarn
   ```
3. Configure environment variables:
  - Rename `.env_example` to `.env` and fill it with the required database and configuration details.
4. Start the server:
   ```sh
   yarn start
   ```

### Running with Docker
2. Build and run the container:
   ```sh
   docker-compose up --build
   ```
Running the app this way will automatically start the local MongoDB container with sample products and customers from different regions. The default env values are already set in Docker.

### Testing
For testing purposes `ts-jest` lib is used. Running tests is simple and can be done with a single command:

```sh
yarn test
```

This will execute the test suite, ensuring that all functionalities work as expected.

Tests are also automatically executed as part of the Continuous Integration (CI) pipeline using GitHub Actions. This helps maintain code quality by running tests on every push and pull request, ensuring that new changes do not introduce unexpected issues.

## API Endpoints

### Product Management
- **GET /products**  
  Retrieves a list of all products (without pagination).
  <details>
  <summary>Click for example curl</summary>
  ```bash
  curl -X GET http://localhost:3000/products -H "Content-Type: application/json"
  ```
  </details>

- **POST /products**  
  Creates a new product (fields: `name`, `description`, `price` (float with at most 2 decimal places), `stock`).
  <details>
  <summary>Click for example curl</summary>
  ```bash
  curl -X POST http://localhost:3000/products \
      -H "Content-Type: application/json" \
      -d '{
        "name": "I'm egg",
        "description": "Easter egg",
        "unitPrice": 0.30,
        "stock": 50
      }'
  ```
  </details>

- **POST /products/:id/restock**  
  Increases the stock level of a product.
  <details>
  <summary>Click for example curl</summary>
  curl -X POST http://localhost:3000/products/1/restock \
      -H "Content-Type: application/json" \
      -d '{
        "quantity": 10
      }'
  </details>

- **POST /products/:id/sell**  
  Decreases the stock level of a product (to zero or above).
  <details>
  <summary>Click for example curl</summary>
  curl -X POST http://localhost:3000/products/1/sell \
      -H "Content-Type: application/json" \
      -d '{
        "quantity": 5
      }'
  </details>

### Order Management
- **POST /orders**  
  Creates a new order (fields: `customerId`, `products`). Stock reservation is implemented to prevent race conditions and orders are rolled back if stock deduction fails.
  <details>
  <summary>Click for example curl</summary>
  ```bash
  curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d '{ "customerId": "1", "products": [{ "productId": "1", "quantity": 2 }] }'
  ```
  </details>

## MongoDB Collection Models
### Product
```json
{
  "_id": "int",
  "name": "string (max 50 chars)",
  "description": "string (max 50 chars)",
  "unitPrice": "int (stored as integer, mapped to float in API)",
  "stock": "int (min 0)",
  "reservedStock": (optional) [
    {
      "orderId": "string",
      "quantity": "int (min 0)"
    }
  ]
}
```

### Order
```json
{
  "_id": "string",
  "customerId": "int",
  "products": [
    {
      "productId": "int",
      "quantity": "int (min 1)",
      "unitPrice": "int (min 0)",
      "unitPriceBeforeModifiers": "int (min 0, optional)",
      "priceModifiers": (optional) [
        {
          "name": "enum (one of 'SeasonalDiscount', 'VolumeDiscount', 'LocationBased')",
          "details": "string",
          "modifierPercent": "int (percentage change, e.g., -30)"
        }
      ]
    }
  ],
  "totalAmount": "int (min 0)"
}
```

### Customer
```json
{
  "_id": "int",
  "name": "string",
  "location": "string (one of 'US', 'Europe' or 'Asia')",
}
```

## Pricing Logic
- **Discount Logic:**
  - **Volume-based discounts:**
    - 5+ units: 10% off
    - 10+ units: 20% off
    - 50+ units: 30% off
  - **Seasonal & promotional discounts:**
    - Black Friday: 25% off all products.
    - Holiday Sales: 15% off (for a maximum of two types of products).
  - **Only the highest applicable discount for given product (most profitable option for customer) is applied.**
- **Location-based pricing:**
  - Europe: +15%
  - Asia: -5%
  - Other: no change

## Notes
- **Pagination** should be implemented for `/products` to ensure efficient product lookup in larger deployments.
- **Removing the `sellProduct` endpoint** is recommended, as selling should be managed through the `createOrder` flow to maintain stock consistency.
- **Unit price is stored as an integer** to simplify arithmetic operations and avoid IEEE 754 floating-point precision issues. Since working with real prices is more intuitive for humans, it is converted from a float in requests and to a float in responses.
- Since a cent cannot be divided, **discount calculations always favor the store**. For example, a 30% discount on a price of 19.99 results in 14.00 rather than 13.99.
- Further performace optimizations are possible.
- It is assumed that the site does not serve customers outside the US, Europe and Asia.
- Pricing based on customer location is not counted as discount.
- Since the task requirements don't specify that a product should have a `category` field, and the `category` isn't included in the request body for the create product POST endpoint, I assumed that the Holiday Sale discount should apply to at most two product types, rather than product categories.

## License
This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

## Author
[Maciej Konieczny](https://github.com/ifmcjthenknczny/)]