import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Report Model ──────────────────────────────────────────────────────────────

export interface IReport extends Document {
  userId: string
  siteUrl: string
  dateRange: { start: string; end: string }
  gscData: Record<string, unknown>
  analysis: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true, index: true },
    siteUrl: { type: String, required: true },
    dateRange: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    gscData: { type: Schema.Types.Mixed, required: true },
    analysis: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)

// ─── Chat Session Model ────────────────────────────────────────────────────────

export interface IChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface IChatSession extends Document {
  userId: string
  reportId: string
  siteUrl: string
  messages: IChatMessage[]
  createdAt: Date
  updatedAt: Date
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    reportId: { type: String, required: true },
    siteUrl: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

// ─── User Preferences Model ────────────────────────────────────────────────────

export interface IUserPrefs extends Document {
  userId: string
  defaultDateRange: number
  favoritesSites: string[]
  emailNotifications: boolean
}

const UserPrefsSchema = new Schema<IUserPrefs>({
  userId: { type: String, required: true, unique: true },
  defaultDateRange: { type: Number, default: 28 },
  favoritesSites: [String],
  emailNotifications: { type: Boolean, default: false },
})

// ─── Model exports ─────────────────────────────────────────────────────────────

function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema)
}

export const Report = () => getModel<IReport>('Report', ReportSchema)
export const ChatSession = () => getModel<IChatSession>('ChatSession', ChatSessionSchema)
export const UserPrefs = () => getModel<IUserPrefs>('UserPrefs', UserPrefsSchema)
