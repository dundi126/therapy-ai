"use client"

import { z } from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { Input } from "@base-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "react-hook-form";
import Link from "next/link";
import {FaGoogle, FaGithub} from "react-icons/fa"


const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {message: "Password is required"}),
})

export const SignInView = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },

    })

    const onsubmit = async (data: z.infer<typeof formSchema>) => { 
        setError(null);
        setIsLoading(true);

        authClient.signIn.email(
            {
                email: data.email,
                password: data.password,
                callbackURL: "/"
            },
            {
                onSuccess: () => {
                    setIsLoading(false);
                    router.push("/")
                    
                },
                onError: ({ error }) => {
                    setError(error.message);
                }
            }
        )
    }

    const onsocial = (provider: "google" | "github") => {
        setError(null);
        setIsLoading(true);
        authClient.signIn.social({
            provider: provider,
            callbackURL: '/'
        }, {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: ({ error }) => { 
                setError(error.message);
                setIsLoading(false);
            }
        })
    }


    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onsubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Login to your account
                                    </p>
                                </div>
                                <div className="grid gap-3 ">
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="example@email.com"
                                                    {...field}
                                                    className="p-1 border border-2 rounded"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid gap-3">
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    {...field}
                                                    className="p-1 border border-2 rounded "
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )} />
                                </div>

                                {!!error && (
                                    <Alert className="bg-destructive/10 border-none">
                                        <OctagonAlertIcon className="h-4 w-4 !text-destructive"/>
                                        <AlertTitle>{error}</AlertTitle>
                                     </Alert>
                                )}

                                <Button disabled={isLoading} type="submit" className="w-full">
                                    Sign In
                                </Button>

                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or continue with
                                    </span>
                                </div>
 
                                <div className="grid grid-cols-2 gap-4">
                                    <Button 
                                        onClick={() => {
                                            onsocial("google")
                                        }}
                                    
                                        variant="outline" type="button" className="w-full">
                                        <FaGoogle/>
                                    </Button>
                                    <Button onClick={() => {
                                        onsocial("github")
                                    }} variant="outline" type="button" className="w-full">
                                        <FaGithub/>
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account? { " "}<Link href="/sign-up" className="underline underline-offset-2">Sign up</Link>
                                </div>
                            </div>   
                        </form>
                    </Form>


                    <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                        <img src="/logo.svg" alt="logo" className="h-[92px] w-[92px]" />
                        <p className="text-2xl font-semibold text-white">Therapy.Ai</p>
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clikcing continue, you agree to out <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </div>
        </div>
    )
}