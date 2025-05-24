const mongoose = require("mongoose");

const schema = mongoose.Schema;

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },

   posts:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }

   ]
  },

  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
