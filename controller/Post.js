const asyncHandler = require("express-async-handler");

const mongoose = require("mongoose");

const Post = require("../model/Post");

const User = require("../model/User");

const File = require("../model/File");


const Category = require("../model/Category")

const postCtrl = {


  createPost: asyncHandler(async (req, res) => {
    console.log("I am inside createPost");

    const userFound = await User.findById(req.user);

    const { title, description, categoryName } = req.body;


    console.log(title, description, categoryName);

    if (!title || !description || req.files.length === 0 || !categoryName) {
      return res
        .status(400)
        .json({ status: "Failed", message: "All Fields should have certain value" });
    }

    // Find the category by name
    const category = await Category.findOne({ categoryName });

    // console.log(category);
    
    if (!category) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Category not found" });
    }

    // Upload each image public_id and URL in db
    const images = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new File({
          url: file.path,
          public_id: file.filename,
        });

        await newFile.save();

        return {
          url: newFile.url,
          public_id: newFile.public_id,
        };
      })
    );

    // Create the post
    let post = await Post.create({
      title,
      description,
      author: req.user,
      images,
      category: category._id,
    });

    // Populate the author and category fields
    post = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("category", "categoryName");

    // Add the post ID to the category's posts array
    category.posts.push(post._id);
    await category.save();

    // Add the post ID to the user's posts array
    userFound?.posts.push(post._id);
    await userFound.save();

    return res.status(201).json({ message: "Post created successfully", post });
  }),

  deletePost: asyncHandler(async (req, res) => {

      const { id } = req.params;

      // Find the post and verify the user owns it
      const post = await Post.findOne({ _id: id, author: req.user });

      if (!post) {
        return res.status(404).json({
          status: "Failed",
          message: "you don't have permission to delete this post",
        });
      }

      // Delete the post

      // {new:true} doesnt show any effect on delete
      const afterDeletion = await Post.findByIdAndDelete(id);

      console.log(afterDeletion);

      // Remove the post from user's posts array
      await User.findByIdAndUpdate(
        req.user,
        { $pull: { posts: id } },
        { new: true }
      );

      res.json({
        status: "Success",
        message: "Post deleted successfully",
        deletedPost: afterDeletion,
      });
    
  }),

  getAllPost: asyncHandler(async (req, res) => {
    const posts = await Post.find().populate("author", "username");

    res.status(201).json({  posts });

    //
  }),

  getCertainPost: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id).populate("author", "username").populate("category", "categoryName");

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post not found",
      });
    }

    res.json({
      status: "Success",
      post,
    });
  }),

  LatestPosts: asyncHandler(async (req, res) => {
    const posts = await Post.find()
      .limit(2)
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("author", "username");

    // Extract only username not only field
    // .limit(5)
    // .populate("author", "username");

    // console.log(posts);

    res.status(201).json({
      status: "success",
      posts,
    });
  }),



  //! Search Post

  searchPost: asyncHandler(async (req, res) => {
    const { query } = req;

    //! Populating the username and email only 
    const posts = await Post.find(query).populate("author", "username email");

    res.status(200).json({
      status: "Success",
      message: "Search results",
      count: posts.length,
      posts,
    });
  }),



  //! Update the post


  updateCertainPost: asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { title, description } = req.body;

    // Find the post and verify the user owns it
    const post = await Post.findOne({ _id: id, author: req.user });

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: " you don't have permission to update this post",
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    res.json({
      status: "Success",
      message: "Post updated successfully",
      updatedPost,
    });

  }),

  // //! Get Category ID of a Certain Post
  getCategoryOfPost: asyncHandler(async (req, res) => {
    const { id } = req.params; // Post ID

    // Find the post and populate the category field
    const post = await Post.findById(id).populate("category", "name");

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post not found",
      });
    }

    // Return the category ID and name
    res.status(200).json({
      status: "Success",
      categoryId: post.category._id,
      categoryName: post.category.name,
    });
  }),

  getPostsByCategory: asyncHandler(async (req, res) => {
    const { categoryName } = req.params;

    // Find the category by name
    const category = await Category.findOne({ categoryName }); // Correct field name
    if (!category) {
      return res.status(404).json({
        status: "Failed",
        message: "Category not found",
      });
    }

    // Find posts belonging to the category
    const posts = await Post.find({ category: category._id }).populate("author", "username");

    res.status(200).json({
      status: "Success",
      count: posts.length,
      posts,
    });
  })

};



 



module.exports = postCtrl;
