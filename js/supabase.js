// Initialize Supabase Client
const supabaseUrl = "https://utpiqcvwwypxqmeeqere.supabase.co";
const supabaseKey = "sb_publishable_UHh-NROwE8idyhPSR_CKKg_6tmUMCd8";

// window.supabase is provided by the CDN script
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase Client Initialized:", supabaseClient);

// Cache session globally for the app initialization to access
window.supabaseSession = null;

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Supabase Auth State Change:", event, session);
    window.supabaseSession = session;
    
    if (window.app) {
        if (session && session.user) {
            window.app.handleSupabaseUserLoggedIn(session.user);
        } else {
            window.app.handleSupabaseUserLoggedOut();
        }
    }
});
