import Joi from 'joi';

export const createProductSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(2).max(5000).required(),
  price: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().required(),
  category: Joi.string().trim().min(2).max(100).required(),
  affiliateLink: Joi.string().uri().allow('', null).optional(),
});

export const productQuerySchema = Joi.object({
  search: Joi.string().trim().max(200).allow('').optional(),
  category: Joi.string().trim().max(100).allow('').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  sort: Joi.string().valid('newest', 'price_asc', 'price_desc').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
