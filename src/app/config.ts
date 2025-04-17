export const config = {
    fallBackend: process.env.FALL_BACKEND || "",
    apiAuthName: process.env.API_AUTH_NAME || "",
    apiAuthPwd: process.env.API_AUTH_PWD || "",
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
    lexOfficeApiKey: process.env.LEXOFFICE_API_KEY || "",
    geoapifyApiKey: process.env.GEOAPIFY_API_KEY || "",
    mapboxApiKey: process.env.MAPBOX_API_KEY || "",
    bingApiKey: process.env.BING_API_KEY || ""
};