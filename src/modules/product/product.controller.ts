import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../models/req.model';
import { Product } from './product.model';
import { createProductSchema, productQuerySchema } from './product.validation';
import { logger } from '../../config/logger';

/**
 * POST /api/products
 * Admin-only (see product.routes.ts: protect + requireAdmin).
 */
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const product = await Product.create({
      ...value,
      createdBy: req.user.id,
    });

    logger.info('Product created', { productId: product._id, createdBy: req.user.id });

    return res.status(201).json({
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products
 * Public. Supports keyword search, category filter, price range, sort, pagination.
 * Query params: search, category, minPrice, maxPrice, sort, page, limit
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = productQuerySchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        message: 'Invalid query parameters',
        details: error.details.map((d) => d.message),
      });
    }

    const { search, category, minPrice, maxPrice, sort } = value;
    const page = value.page || 1;
    const limit = value.limit || 12;

    const query: Record<string, unknown> = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      query.price = priceFilter;
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };
    const sortStage = sortMap[sort as string] || sortMap.newest;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortStage)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      data: products,
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};
