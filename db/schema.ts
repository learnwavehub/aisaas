
import { relations } from "drizzle-orm";
import {  pgTable,text, varchar,timestamp, jsonb, integer } from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
id:varchar("id").primaryKey(),
email: varchar("email"),
name: varchar("name"),
count:integer("count").default(0),
createdAt:timestamp("created_at").defaultNow(),


});

//images table
export const imagesTable = pgTable("images", {
    id: varchar("id").primaryKey(),
    userId: varchar("user_id").references(() => usersTable.id,{onDelete:"cascade"}),
    prompt: varchar("prompt").notNull(),
    imageUrls:jsonb("image_urls").notNull().$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
});
//chat messages table
export const chatTable = pgTable("chats", {
    id: varchar("id").primaryKey(),
    userId: varchar("user_id").references(() => usersTable.id,{onDelete:"cascade"}),
    prompt: varchar("prompt").notNull(),
    response: varchar("response").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
//code table can be added similarly
export const codeTable = pgTable("codes", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => usersTable.id,{onDelete:"cascade"}),
  prompt: text("prompt").notNull(),  // Using text for potentially long code prompts
  response: text("response").notNull(),  // Using text for potentially long code responses
  createdAt: timestamp("created_at").defaultNow(),
});
//define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
    images: many(imagesTable),
    chats: many(chatTable),
}));


//define images relations 
export const imagesRelations = relations(imagesTable, ({ one }) => ({
    user: one(usersTable, {
         fields: [imagesTable.userId],
         references: [usersTable.id] 
        }),
}));
//define chat relations 
export const chatRelations = relations(chatTable, ({ one }) => ({
    user: one(usersTable, {
         fields: [chatTable.userId],
         references: [usersTable.id] 
        }),
}));
//define code relations 
export const codeRelations = relations(codeTable, ({ one }) => ({
    user: one(usersTable, {
         fields: [codeTable.userId],
         references: [usersTable.id] 
        }),
}));


//type inference for typescript
export type insertUser =typeof usersTable.$inferInsert;
export type selectUser =typeof usersTable.$inferInsert;
export type insertImage =typeof imagesTable.$inferInsert;
export type selectImage =typeof imagesTable.$inferSelect;
export type insertChat =typeof chatTable.$inferInsert;
export type selectChat =typeof chatTable.$inferSelect;
export type insertCode =typeof codeTable.$inferInsert;
export type selectCode =typeof codeTable.$inferSelect;