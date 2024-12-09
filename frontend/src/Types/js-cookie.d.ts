declare module 'js-cookie' {
    interface CookiesStatic {
        get(name: string): string | undefined;
        set(name: string, value: string, options?: Cookies.CookieAttributes): void;
        remove(name: string, options?: Cookies.CookieAttributes): void;
    }

    const Cookies: CookiesStatic;
    export default Cookies;
}
