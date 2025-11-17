import { getDb } from "./index";

export type UserRoleCode = 0 | 1 | 2; // 0 = Super Admin, 1 = Admin, 2 = Consumer

export const UserRoles = {
  SUPER_ADMIN: 0 as UserRoleCode,
  ADMIN: 1 as UserRoleCode,
  CONSUMER: 2 as UserRoleCode
};

export interface User {
  _id?: any; 
  name: string;
  email: string;
  mobile: string;
  gender?: string; // "male", "female", "other"
  address?: string;
  role: UserRoleCode;
  passwordHash: string; // store hash, never plain password
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

const COLLECTION_NAME = "users";

export async function findUserByEmail(email: string): Promise<User | null> {
  const needle = email.trim().toLowerCase();
  const db = getDb();
  const user = await db.collection<User>(COLLECTION_NAME).findOne({ 
    email: needle 
  });
  return user;
}

export async function findUserByMobile(mobile: string): Promise<User | null> {
  const needle = mobile.trim();
  if (!needle) return null;
  const db = getDb();
  const user = await db.collection<User>(COLLECTION_NAME).findOne({ 
    mobile: needle 
  });
  return user;
}

export async function assertUserUnique(email: string, mobile: string): Promise<void> {
  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    throw new Error("Email already in use");
  }
  if (mobile && mobile.trim()) {
    const existingByMobile = await findUserByMobile(mobile);
    if (existingByMobile) {
      throw new Error("Mobile already in use");
    }
  }
}

export async function addUser(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  await assertUserUnique(user.email, user.mobile);
  const now = new Date().toISOString();
  const newUser: Omit<User, "_id"> = {
    ...user,
    createdAt: now,
    updatedAt: now
  };
  
  const db = getDb();
  const result = await db.collection<User>(COLLECTION_NAME).insertOne(newUser as any);
  
  // Return the inserted document with _id
  const insertedUser = await db.collection<User>(COLLECTION_NAME).findOne({ _id: result.insertedId });
  if (!insertedUser) {
    throw new Error("Failed to retrieve created user");
  }
  
  return insertedUser;
}


