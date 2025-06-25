import { model, Schema } from "mongoose";

const promotionSchema = new Schema(
  {
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

const Promotion = model("Promotion", promotionSchema);

export default Promotion;
