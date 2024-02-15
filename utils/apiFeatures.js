class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludesFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludesFields.forEach(field => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne)\b/g,
      match => `$${match}`,
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  search(modelName) {
    if (this.queryStr.keyword) {
      const query = {};
      if (modelName === 'Product') {
        query.$or = [
          {
            title: { $regex: this.queryStr.keyword, $options: 'i' },
          },
          {
            description: {
              $regex: this.queryStr.keyword,
              $options: 'i',
            },
          },
        ];
      } else {
        query.$or = [
          {
            name: { $regex: this.queryStr.keyword, $options: 'i' },
          },
          {
            description: {
              $regex: this.queryStr.keyword,
              $options: 'i',
            },
          },
        ];
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-sold');
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 50;
    const skip = (page - 1) * limit;

    const pagination = {};
    pagination.limit = limit;
    pagination.currentPage = page;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
