import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  phone: {
    type: String,
    required: function () {
      return this.provider === "password";
    },
  },
  address: {
    type: String,
    required: function () {
      return this.provider === "password";
    },
  },
  provider: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default:
      "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  totalSpent: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("deleteOne", { document: true }, async function (next) {
  const userId = this._id;
  // 6853eb95de87ffbb65f9620e
  // await Order.deleteMany({ userId });
  // await Comment.deleteMany({ userId });
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
