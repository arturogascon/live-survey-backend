import mongoose, { Schema, Document, Types } from "mongoose";

export type Option = {
  text: string;
  votes: number;
};

export interface IVoteLog {
  cookieId?: string;
  created: Date;
}

export interface IPoll extends Document {
  question: string;
  options: Types.DocumentArray<Option>;
  votesLog?: Array<IVoteLog>;
  totalVotes: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
}

const OptionSchema = new Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const VoteLogSchema = new Schema(
  {
    cookieId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
  }
);

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: [OptionSchema],
    totalVotes: { type: Number, default: 0 },
    votesLog: [VoteLogSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Poll = mongoose.model<IPoll>("Poll", PollSchema);

export default Poll;
