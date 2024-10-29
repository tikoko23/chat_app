import { getCookies } from "https://deno.land/std@0.224.0/http/cookie.ts";
import { DB, UserQueryResult } from "./db.ts";
import { generateSalt, hashString } from "./crypt.ts";
import { User, Optional, Nullable, ResponseUser } from "./types.d.ts";
import { generateAccessToken } from "./api/user/get-access-token.ts";

export function getTokenFromRequest(req: Request, cookie: boolean = false): Nullable<string> {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== null)
        return authHeader;

    if (cookie) {
        const cookies = getCookies(req.headers);

        if (cookies["auth_token"])
            return cookies["auth_token"];
    }

    return null;
}

export async function isValidUser(username: string, password: string): Promise<boolean> {
    const user = fetchUser("name", username);

    if (user === null)
        return false;

    const hashed = await getHashedPassword(password, user.passwordSalt);

    return hashed === user.password;
}

export function getHashedPassword(password: string, salt: string): Promise<string> {
    return hashString(getHashSource(password, salt));
}

export function getHashSource(password: string, salt: string): string {
    return `${password}@${salt}`;
}

export function fetchUser(how: "token" | "name", getter: string): Nullable<User>;
export function fetchUser(how: "id", getter: number): Nullable<User>;
export function fetchUser(how: "token" | "name" | "id", getter: string | number): Nullable<User> {
    let query: string = "";

    switch (how) {
        case "token":
            query = "SELECT * FROM users WHERE token = ?";
            break;
        case "name":
            query = "SELECT * FROM users WHERE name = ?";
            break;
        case "id":
            query = "SELECT * FROM users WHERE id = ?";
            break;
    }

    const result = DB.queryEntries<UserQueryResult>(query, [ getter ]);

    if (!result || result.length === 0)
        return null;

    return parseUserFromResult(result[0]);
}

export function parseUserFromResult(result: UserQueryResult): User {
    return {
        id: Number(result.id),
        name: result.name,
        displayName: result.displayName,
        email: result.email,
        createdAt: result.createdAt,
        password: result.password,
        passwordSalt: result.passwordSalt,
        token: result.token
    };
}

export function deleteUser(user: User): void {
    const data = DB.query("SELECT * FROM users WHERE id = ?", [ user.id ]);

    if (!data || data.length === 0)
        return;

    DB.query("DELETE FROM users WHERE id = ?", [ user.id ]);
}

export async function createUser(
    username: string,
    password: string,
    displayName: Optional<string> = username,
    email: Optional<string> = null
): Promise<User | null> {

    if (fetchUser("name", username) !== null)
        return null;

    const salt = generateSalt();
    const hashed = await getHashedPassword(password, salt);
    const token = await generateAccessToken(username, password, true);

    DB.query(
        "INSERT INTO users (name, displayName, email, password, passwordSalt, token, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
        [
            username,
            displayName,
            email,
            hashed,
            salt,
            token
        ]
    );

    return fetchUser("name", username) as User;
}

export function userToResponse(user: User): ResponseUser {
    return {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        createdAt: user.createdAt
    };
}