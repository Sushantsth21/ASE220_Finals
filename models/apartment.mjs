import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  unit_number: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  distance_from_college: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    required: true,
    set: (data) => data.split(",").map((item) => item.trim()),
  },
  amenities: {
    type: [String],
    required: true,
    set: (data) => data.split(",").map((item) => item.trim()),
  },
  pricing: {
    type: Number,
    required: true,
  },
  contact_info: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  review_count: {
    type: Number,
    required: true,
    default: 0,
  },
  availability: {
    type: Boolean,
    required: true,
    get: (availability) => availability === "Yes",
  },
  description: {
    type: String,
    required: true,
  },
});

const Apartment = mongoose.model("Apartment", apartmentSchema);

export default Apartment;
