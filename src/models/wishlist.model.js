import mongoose from "mongoose";


const wishlistSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true

            }
            ,
            addedAt: {
                type: Date,
                default: Date.now
            },
        }
    ]


},
    { timeStamps: true }
)

export default mongoose.model("wishlist", wishlistSchema);
