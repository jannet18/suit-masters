import { UserType } from "@kinde-oss/kinde-typescript-sdk";
type AuthEnv = {
    Variables: {
        user: UserType;
    };
};
export declare const getUser: import("hono").MiddlewareHandler<AuthEnv, string, {}, Response>;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map