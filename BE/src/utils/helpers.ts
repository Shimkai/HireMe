export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const sanitizeUser = (user: any) => {
  const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
  return userWithoutPassword;
};

export const getPaginationParams = (page?: string, limit?: string) => {
  const pageNum = parseInt(page || '1', 10);
  const limitNum = parseInt(limit || '10', 10);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10,
    skip,
  };
};

export const calculatePagination = (total: number, page: number, limit: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

