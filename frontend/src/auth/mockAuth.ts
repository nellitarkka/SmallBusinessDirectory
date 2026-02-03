export type UserRole = "customer" | "vendor" | "admin";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
}

export const mockUsers: MockUser[] = [
  {
    email: "admin@localvendorhub.com",
    password: "admin123",
    role: "admin",
  },
  // later you could add sample vendor / customer users here if you want
];
