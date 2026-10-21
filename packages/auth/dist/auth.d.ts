export declare const auth: import("better-auth").Auth<{
    baseURL: string;
    secret: string;
    trustedOrigins: string[];
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    advanced: {
        database: {
            generateId: false;
        };
    };
    emailAndPassword: {
        enabled: true;
        sendResetPassword: ({ user, token }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }) => Promise<void>;
    };
    user: {
        fields: {
            image: string;
        };
        additionalFields: {
            roles: {
                type: "string";
                defaultValue: string;
                input: false;
            };
            phone: {
                type: "string";
                required: false;
            };
            address: {
                type: "string";
                required: false;
            };
        };
    };
    plugins: [{
        id: "bearer";
        version: string;
        hooks: {
            before: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    context: {
                        headers: Headers;
                    };
                } | undefined>>;
            }[];
            after: {
                matcher(context: import("better-auth").HookEndpointContext): true;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
        };
        options: import("better-auth/plugins").BearerOptions | undefined;
    }];
}>;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
//# sourceMappingURL=auth.d.ts.map