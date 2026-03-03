// models/Records.js


import mongoose from "mongoose";

const VEHICLES = ["Car & Jeep", "LCV", "Bus or Truck", "3axcle", "HCM/EME/MAV", "Oversized Vehicles"];
const JOURNEYS = ["Single", "Return"];
const STATUS = ["active","inactive"];

const recordsSchema = new mongoose.Schema({
  vehicle: { type: String, enum: VEHICLES, required: true },
  journey: { type: String, enum: JOURNEYS, required: true },
  vehicleNum: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  astatus: { type: String, enum: STATUS, required: true, default: 'active', index: true },
  ticketNum: { type: String, required: true, trim: true, index: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

recordsSchema.index({ date: -1 });

export default mongoose.model("Records", recordsSchema);
