import mongoose from 'mongoose';

interface IOTP {
  email: string;
  otp: string;
  expires: Date;
}

const otpSchema = new mongoose.Schema<IOTP>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    expires: 300 // Document will be automatically deleted after 5 minutes
  }
});

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP; 