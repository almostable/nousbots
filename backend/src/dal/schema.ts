import { InferSelectModel } from 'drizzle-orm'
import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { Curriculum } from '../shared/contract'
import { CompletedMap } from '../shared/type'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  gender: text('gender').notNull(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
})

export const bots = pgTable('bots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url').notNull(),
  audience: text('audience').notNull(),
  isVerified: boolean('is_verified').default(false),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentVersionId: uuid('current_version_id').references(
    (): AnyPgColumn => botVersions.id
  ),
  isPublished: boolean('is_published').default(false),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

export const botVersions = pgTable('bot_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  botId: uuid('bot_id')
    .notNull()
    .references(() => bots.id, { onDelete: 'cascade' }),
  persona: text('persona').notNull(),
  welcomeMessage: text('welcome_message').notNull(),
  curriculum: jsonb('curriculum').$type<Curriculum>().notNull(),
  isVectorized: boolean('is_vectorized').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  botId: uuid('bot_id')
    .notNull()
    .references(() => bots.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  lastMessageAt: timestamp('last_message_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
})

export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  botId: uuid('bot_id')
    .notNull()
    .references(() => bots.id),
  botVersionId: uuid('bot_version_id')
    .notNull()
    .references(() => botVersions.id),
  currentModuleIdx: integer('current_module_idx').notNull(),
  currentStepIdx: integer('current_step_idx').notNull(),
  completedMap: jsonb('completed_map').$type<CompletedMap>(),
  isFinished: boolean('is_finished').notNull().default(false),
})

export type User = InferSelectModel<typeof users>
export type Bot = InferSelectModel<typeof bots>
export type BotVersion = InferSelectModel<typeof botVersions>
export type Chat = InferSelectModel<typeof chats>
export type UserProgress = InferSelectModel<typeof userProgress>
