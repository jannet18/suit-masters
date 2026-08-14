import { SessionManager, type GeneratePortalUrlParams } from "@kinde-oss/kinde-typescript-sdk";
import { type Context } from "hono";
export declare const kindeClient: {
    handleRedirectToApp: (sessionManager: SessionManager, callbackURL: URL) => Promise<void>;
    isAuthenticated: (sessionManager: SessionManager) => Promise<boolean>;
    getUserProfile: (sessionManager: SessionManager) => Promise<import("@kinde-oss/kinde-typescript-sdk").UserType>;
    createOrg: (sessionManager: SessionManager, options?: import("@kinde-oss/kinde-typescript-sdk").CreateOrgURLOptions) => Promise<URL>;
    getToken: (sessionManager: SessionManager) => Promise<string>;
    refreshTokens: (sessionManager: SessionManager, commitToSession?: boolean) => Promise<import("@kinde-oss/kinde-typescript-sdk").OAuth2CodeExchangeResponse>;
    register: (sessionManager: SessionManager, options?: import("@kinde-oss/kinde-typescript-sdk").RegisterURLOptions) => Promise<URL>;
    getUser: (sessionManager: SessionManager) => Promise<import("@kinde-oss/kinde-typescript-sdk").UserType>;
    logout: (sessionManager: SessionManager) => Promise<URL>;
    login: (sessionManager: SessionManager, options?: import("@kinde-oss/kinde-typescript-sdk").LoginURLOptions) => Promise<URL>;
    portal: (sessionManager: SessionManager, options: GeneratePortalUrlParams) => Promise<{
        url: URL;
    }>;
    getUserOrganizations: (sessionManager: SessionManager) => Promise<{
        orgCodes: string[];
    }>;
    getOrganization: (sessionManager: SessionManager) => Promise<{
        orgCode: string | null;
    }>;
    getBooleanFlag: (sessionManager: SessionManager, code: string, defaultValue?: boolean) => Promise<boolean>;
    getIntegerFlag: (sessionManager: SessionManager, code: string, defaultValue?: number) => Promise<number>;
    getPermissions: (sessionManager: SessionManager) => Promise<{
        permissions: string[];
        orgCode: string | null;
    }>;
    getPermission: (sessionManager: SessionManager, name: string) => Promise<{
        orgCode: string | null;
        isGranted: boolean;
    }>;
    getClaimValue: (sessionManager: SessionManager, claim: string, type?: import("@kinde-oss/kinde-typescript-sdk").ClaimTokenType) => Promise<unknown | null>;
    getStringFlag: (sessionManager: SessionManager, code: string, defaultValue?: string) => Promise<string>;
    getClaim: (sessionManager: SessionManager, claim: string, type?: import("@kinde-oss/kinde-typescript-sdk").ClaimTokenType) => Promise<{
        name: string;
        value: unknown | null;
    }>;
    getFlag: (sessionManager: SessionManager, code: string, defaultValue?: import("@kinde-oss/kinde-typescript-sdk").FlagType[keyof import("@kinde-oss/kinde-typescript-sdk").FlagType], type?: keyof import("@kinde-oss/kinde-typescript-sdk").FlagType) => Promise<import("@kinde-oss/kinde-typescript-sdk").GetFlagType>;
};
export declare const sessionManager: (c: Context) => SessionManager;
//# sourceMappingURL=sessionManager.d.ts.map