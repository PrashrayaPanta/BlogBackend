const express = require("express");


const isAuthenticated = require("../middleware/isAuth");


const categoryRoute = express.Router();


const categoryCtrl = require("../controller/Category.js")






categoryRoute.post("/category", isAuthenticated,  categoryCtrl.createCategory);


categoryRoute.get("/",  isAuthenticated, categoryCtrl.getAllCategory);


categoryRoute.get("/:id", isAuthenticated,  categoryCtrl.getCertainCategory);



categoryRoute.put("/:id", isAuthenticated, categoryCtrl.EditCertainCategory);


categoryRoute.delete("/:id", isAuthenticated, categoryCtrl.deleteCategory);




// Route to get category ID by name
// categoryRoute.get("/getCategoryId/:categoryName", categoryCtrl.getCategoryId);


module.exports = categoryRoute;

