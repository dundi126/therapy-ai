"use client"

import { z } from "zod";
import zodResolver from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { Input } from "@base-ui/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card"

export const SignInView = () => {
    console.log("SignInView rendered");
    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form></form>


                    <div className="bg-radial from-green-600 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                        <img src="/logo.svg" alt="logo" className="h-[92px] w-[92px]" />
                        <p className="text-2xl font-semibold text-white">Therapy.Ai</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}