 import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema"; // your drizzle schema
import { polar, checkout, portal } from "@polar-sh/better-auth";
import  { polarClient } from "./polar";

export const auth = betterAuth({

    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true, // Optional: Automatically create a customer in Polar on sign-up
            use: [
                checkout({
                    authenticatedUsersOnly: true, // Optional: Only allow authenticated users to access the checkout
                    successUrl: "/upgrade", // Optional: Redirect URL after successful checkout
                }),
                portal()
            ],
        }),
        ],

        socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 

},
    
    emailAndPassword: {
        enabled: true,
    },

    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
        ...schema
    },
    }),

});