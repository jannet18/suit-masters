export declare const authRoute: import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, {
    "/login": {
        $get: {
            input: {};
            output: undefined;
            outputFormat: "redirect";
            status: 302;
        };
    };
} & {
    "/register": {
        $get: {
            input: {};
            output: undefined;
            outputFormat: "redirect";
            status: 302;
        };
    };
} & {
    "/kinde_callback": {
        $get: {
            input: {};
            output: undefined;
            outputFormat: "redirect";
            status: 302;
        };
    };
} & {
    "/logout": {
        $get: {
            input: {};
            output: undefined;
            outputFormat: "redirect";
            status: 302;
        };
    };
} & {
    "/me": {
        $get: {
            input: {};
            output: {
                user: {
                    picture: null | string;
                    family_name: string;
                    given_name: string;
                    email: string;
                    id: string;
                    phone: string;
                };
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/", "/me">;
//# sourceMappingURL=verify.d.ts.map