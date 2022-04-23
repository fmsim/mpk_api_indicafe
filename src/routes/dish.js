const express = require("express")
const router = express.Router()

const { createDish, fetchDishes, fetchDish, fetchDishById, getDishPhoto } = require("../controllers/dish")

router.post("/dishes", createDish)

router.get("/dishes", fetchDishes)

router.param("id", fetchDish)

router.get("/dishes/:id", fetchDishById)

router.get("/dishes/:id/photo", getDishPhoto)

module.exports = router
