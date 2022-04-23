const Dish = require("../models/dish")

const createError = require("http-errors")

const { dishSchema } = require("../validators/schema-validator")

const mongoose = require("mongoose")

const imageTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif"]

exports.getDishPhoto = (req, res) => {
  const dish = req.dish

  if (dish.photo.data) {
    res.set("Content-Type", dish.photo.contentType)
    res.send(dish.photo.data)
  } else {
    return res.status(204).json({ message: "No data found" })
  }
}

exports.createDish = async (req, res, next) => {
  const { name, description, price, category, photo } = req.body

  console.log(req.body)

  let dish

  try {
    const result = await dishSchema.validateAsync({ name, description, price, category })

    dish = new Dish({ name, description, price, category })
    dish.addedBy = "mpk"

    savePhoto(dish, photo)

    const newDish = await dish.save()
    newDish.photo = undefined

    res.status(201).json(newDish)
  } catch (error) {
    console.log("🚀 ~ file: dish.js ~ line 42 ~ exports.createDish= ~ error", error)
    if (error.isJoi === true) {
      error.status = 422
    }

    if (error.message.includes("E11000")) {
      // @ts-ignore
      return next(createError.Conflict(`The dish ${dish.name} already exists`))
    }
    next(error)
  }
}

exports.fetchDishById = (req, res) => {
  req.dish.photo = undefined
  res.status(200).json(req.dish)
}

exports.fetchDish = async (req, res, next, id) => {
  try {
    const dish = await Dish.findById(id)

    if (!dish) return next(createError(404, "Dish not found"))

    req.dish = dish
    next()
  } catch (error) {
    console.log("🚀 ~ file: dish.js ~ line 69 ~ exports.fetchDish= ~ error", error)
    // @ts-ignore
    if (error instanceof mongoose.CastError) return next(createError(400, "Invalid dish id"))
    next(error)
  }
}

exports.fetchDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find().select("-photo").populate("category", "_id, name")

    if (dishes.length === 0) return next(createError(400, "No dishes found"))
    res.status(200).json(dishes)
    next()
  } catch (error) {
    console.log("🚀 ~ file: dish.js ~ line 84 ~ exports.fetchDishes= ~ error", error)
    next(error)
  }
}

function savePhoto(dish, photo) {
  // TODO: Handle empty object scenario using lodash

  if (photo != null && imageTypes.includes(photo.type)) {
    // @ts-ignore
    dish.photo.data = new Buffer.from(photo.data, "base64")
    dish.photo.contentType = photo.type
  }
}
