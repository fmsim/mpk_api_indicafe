const Category = require("../models/category")
const createError = require("http-errors")
const { categorySchema } = require("../validators/schema-validator")
const mongoose = require("mongoose")

exports.getCategory = (req, res) => {
  res.status(200).json(req.category)
}

exports.getCategoryId = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id)
    if (!category) return next(createError(404, "Category not found"))

    req.category = category
    next()
  } catch (error) {
    console.log("🚀 ~ file: category.js ~ line 18 ~ exports.getCategoryId= ~ error", error)
    // @ts-ignore
    if (error instanceof mongoose.CastError) {
      return next(createError(400, "Invalid Category id"))
    }

    next(error)
  }
}

exports.fetchAllCategories = async (req, res, next) => {
  try {
    const result = await Category.find({})
    if (result.length === 0) {
      return next(createError(404, "No categories found"))
    }

    res.status(200).json(result)
  } catch (error) {
    console.log("🚀 ~ file: category.js ~ line 37 ~ exports.fetchAllCategories= ~ error", error)
    next(error)
  }
}

exports.createCategory = async (req, res, next) => {
  console.log("🚀 ~ file: category.js ~ line 43 ~ exports.createCategory= ~ req", req)

  try {
    const result = await categorySchema.validateAsync(req.body)

    const category = new Category(result)

    category.addedBy = "mpk"

    await category.save()

    res.status(201).json(category)
  } catch (error) {
    console.log("🚀 ~ file: category.js ~ line 56 ~ exports.createCategory= ~ error", error)

    if (error.isJoi === true) error.status = 422

    if (error.message.includes("E11000")) {
      // @ts-ignore
      return next(createError.Conflict(`Category name ${req.body.name} already exists`))
    }

    next(createError(error))
  }
}
