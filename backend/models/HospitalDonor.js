import mongoose from 'mongoose';

const hospitalDonorSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    name: String,
    phoneNumber: String,
    email: String,

    bloodGroup: {
      type: String,
      required: true,
    },

    city: String,

    totalDonations: {
      type: Number,
      default: 1,
    },

    lastDonationDate: {
      type: Date,
      default: Date.now,
    },

    canContact: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ SAFE INDEX (NO UNIQUE, NO CONFLICT)
hospitalDonorSchema.index({ hospitalId: 1, createdAt: -1 });

const HospitalDonor = mongoose.model('HospitalDonor', hospitalDonorSchema);

export default HospitalDonor;