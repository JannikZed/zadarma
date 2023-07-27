declare const api: (obj: {
    baseURL?: string | undefined;
    api_method?: string | undefined;
    params?: {} | undefined;
    http_method?: string | undefined;
    api_user_key?: string | undefined;
    api_secret_key?: string | undefined;
    timeout?: number | undefined;
}) => Promise<unknown>;
export { api };
