import { Schema, model, Document } from 'mongoose';

export enum DealStatus {
  DRAFT     = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPIRED   = 'EXPIRED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED      = 'FIXED',
}

export interface IDealDocument extends Document {
  _id: any;
  title:          string;
  description:    string | null;
  dealerId:       string;
  dealerName:     string;
  vehicleId:      string | null;
  vehicleMake:    string | null;
  vehicleModel:   string | null;
  vehicleYear:    number | null;
  discountType:   DiscountType;
  discountValue:  number;
  originalPrice:  number;
  offerPrice:     number;
  startDate:      Date;
  endDate:        Date;
  status:         DealStatus;
  isFeatured:     boolean;
  bannerImageUrl: string | null;
  createdAt:      Date;
  updatedAt:      Date;
  deletedAt:      Date | null;
  // instance helpers
  updateStatusIfExpired(): void;
}

const DealSchema = new Schema<IDealDocument>(
  {
    title: {
      type: String, required: true, trim: true,
      minlength: 3, maxlength: 100, index: true,
    },
    description:    { type: String, trim: true, maxlength: 1000, default: null },
    dealerId:       { type: String, required: true, index: true },
    dealerName:     { type: String, required: true, trim: true },
    vehicleId:      { type: String, index: true, default: null },
    vehicleMake:    { type: String, trim: true, default: null },
    vehicleModel:   { type: String, trim: true, default: null },
    vehicleYear:    { type: Number, min: 1900, max: 2100, default: null },
    discountType:   { type: String, enum: Object.values(DiscountType), required: true },
    discountValue:  { type: Number, required: true, min: 0 },
    originalPrice:  { type: Number, required: true, min: 0 },
    offerPrice:     { type: Number, required: true, min: 0 },
    startDate:      { type: Date, required: true, index: true },
    endDate:        { type: Date, required: true, index: true },
    status:         { type: String, enum: Object.values(DealStatus), default: DealStatus.DRAFT, required: true, index: true },
    isFeatured:     { type: Boolean, default: false, index: true },
    bannerImageUrl: { type: String, trim: true, default: null },
    deletedAt:      { type: Date, default: null, index: true },
  },
  { timestamps: true, collection: 'deals', versionKey: false },
);

// Compound indexes
DealSchema.index({ dealerId: 1, status: 1, deletedAt: 1 });
DealSchema.index({ status: 1, isFeatured: 1, deletedAt: 1 });
DealSchema.index({ vehicleId: 1, status: 1, deletedAt: 1 });
DealSchema.index({ startDate: 1, endDate: 1, status: 1, deletedAt: 1 });
DealSchema.index({ title: 'text', description: 'text' });

// Instance method — auto-expire if past end date
DealSchema.methods.updateStatusIfExpired = function (): void {
  if (this.status === DealStatus.PUBLISHED && new Date() > this.endDate) {
    this.status = DealStatus.EXPIRED;
  }
};

// Pre-save hook
DealSchema.pre('save', function (next) {
  this.updateStatusIfExpired();
  next();
});

export const DealModel = model<IDealDocument>('Deal', DealSchema);
