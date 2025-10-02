import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import College from '../models/College.model';
import { getPaginationParams, calculatePagination } from '../utils/helpers';

export const getAllColleges = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const filter: any = {};

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  const total = await College.countDocuments(filter);
  const colleges = await College.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, colleges, pagination, 'Colleges fetched successfully');
});

