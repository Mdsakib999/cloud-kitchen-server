import { BlogModel } from "../models/blog.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);

        const blogs = await BlogModel.find()
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await BlogModel.countDocuments();

        res.status(200).json({
            blogs,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getBlogById = async (req, res) => {
    try {
        const blog = await BlogModel.findById(req.params.id);
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const CreateBlog = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        let tags = req.body.tags;

        // Convert tags to array if it's a stringified JSON
        tags = typeof tags === "string" ? JSON.parse(tags) : tags;

        if (!title || !content || !category || !tags || !Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "All fields are required, including at least one tag"
            });
        }

        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, "blog_pics");
        }

        // Create a new blog
        const newBlog = await BlogModel.create({
            title,
            content,
            category,
            tags,
            image: imageUrl,
        });

        res.status(201).json({
            status: "success",
            message: "Blog created successfully",
            data: newBlog
        });

    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({
            status: "failed",
            message: "An error occurred while creating the blog",
            error: error.message
        });
    }
};


export const UpdateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, content, category, tags, removeImage } = req.body;

        try {
            if (typeof tags === "string") {
                tags = JSON.parse(tags);
            }
        } catch (err) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid format for tags. It should be an array or JSON stringified array.",
            });
        }

        const existingBlog = await BlogModel.findById(id);
        if (!existingBlog) {
            return res.status(404).json({
                status: "failed",
                message: "Blog not found.",
            });
        }

        const updateFields = {};

        if (title) updateFields.title = title;
        if (content) updateFields.content = content;
        if (category) updateFields.category = category;
        if (tags && Array.isArray(tags)) updateFields.tags = tags;

        // Handle image removal
        if (removeImage === "true" && existingBlog.image) {
            await deleteFromCloudinary(existingBlog.image);
            updateFields.image = "";
        }

        // Handle new image upload
        if (req.file) {
            if (existingBlog.image) {
                await deleteFromCloudinary(existingBlog.image);
            }
            updateFields.image = await uploadToCloudinary(req.file.buffer, "blog_pics");
        }

        const updatedBlog = await BlogModel.findByIdAndUpdate(id, updateFields, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            message: "Blog updated successfully.",
            data: updatedBlog,
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({
            status: "failed",
            message: "Error updating blog.",
            error: error.message,
        });
    }
};


export const DeleteBlog = async (req, res) => {
    try {
        const blog = await BlogModel.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Delete image from Cloudinary
        if (blog.image) {
            await deleteFromCloudinary(blog.image);
        }

        // Delete the blog from DB
        await BlogModel.findByIdAndDelete(req.params.id);


        res.status(200).json({ message: "Blog and associated image deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the blog", error: error.message });
    }
};