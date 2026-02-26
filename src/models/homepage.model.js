const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema({
    image: { type: String, required: true },
    caption: { type: String, default: "" },
});

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String, default: "" },
});

const homepageSchema = new mongoose.Schema(
    {
        bannerText: {
            type: String,
            default: "25% Off on Every orders! USE SWAD25 CODE",
        },
        posters: {
            type: [posterSchema],
            default: [],
        },
        testimonials: {
            type: [testimonialSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Homepage", homepageSchema);
