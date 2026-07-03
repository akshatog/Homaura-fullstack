# Product Management System - README

## Overview

Centralized product management system for Homaura. All product operations are handled through a single, maintainable architecture.

## Structure

```
backend/
├── products/
│   ├── products.data.js      # All product data (EDIT THIS to add products)
│   └── products.service.js   # Reusable business logic
└── manage-products.js         # CLI interface
```

## Quick Start

### View All Products
```bash
node manage-products.js list
```

### Add All Products
```bash
node manage-products.js add-all
```

### Verify Products
```bash
node manage-products.js verify 17 18 19 20
```

### Update Product
```bash
node manage-products.js update 17 stock 30
```

## Adding New Products

1. Edit `products/products.data.js`
2. Add new product object to the array
3. Run `node manage-products.js add-all`

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `add-all` | Add all products from data file | `node manage-products.js add-all` |
| `add [indices]` | Add specific products by index | `node manage-products.js add 0 1 2` |
| `verify [ids]` | Verify products by ID | `node manage-products.js verify 17 18` |
| `list` | List all products in database | `node manage-products.js list` |
| `update [id] [field] [value]` | Update product field | `node manage-products.js update 17 stock 25` |
| `delete [id]` | Delete product | `node manage-products.js delete 99` |
| `help` | Show help message | `node manage-products.js help` |

## Current Products

- **Total**: 10 products
- **Stock**: 340 units
- **Value**: ₹19,290

All products are defined in `products/products.data.js`
