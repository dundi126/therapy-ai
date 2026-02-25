import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { agentInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentProps{
    onSuccess?: () => void,
    onCancel?: () => void,
    initialValues ?: AgentGetOne
}


export const AgentForm = ({
    onSuccess,
    onCancel,
    initialValues
}: AgentProps) => {
    const trpc = useTRPC()
    // const router = useRouter()
    const queryClient = useQueryClient()

    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: async () => { 
                await queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions({})
                )
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
        
    )

    const updateAgent = useMutation(
        trpc.agents.update.mutationOptions({
            onSuccess: async () => { 
                await queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions({})
                )
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.agents.getOne.queryOptions({id:initialValues.id})
                    )
                }
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
        
    )

    const form = useForm<z.infer<typeof agentInsertSchema>>({
        resolver: zodResolver(agentInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            instructions: initialValues?.instructions ?? ""
        }
    })

    const isEdit = !!initialValues?.id
    const isPending = createAgent.isPending || updateAgent.isPending

    const onSubmit = (values: z.infer<typeof agentInsertSchema>) => {
        if (isEdit) {
            updateAgent.mutate({...values, id: initialValues.id})
        } else {
            createAgent.mutate(values)
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar seed={form.watch("name") || initialValues?.name || "Agent"} variant="botttsNeutral" className="size-9 shrink-0" />
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g, Therapy Agent"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
 
                        )}
                ></FormField>
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="You are a simple therapy agent who helps other with providing motivation or giving a therapy session on how to avoid addiction." />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )}
                />
                <div className="flex justify-between gap-x-2">
                    {
                        onCancel && (
                            <Button variant="ghost" disabled={isPending} type="button" onClick={() => onCancel()}>
                                Cancel
                            </Button>
                        )
                    }
                    <Button disabled={isPending} type="submit">
                        { isEdit ? "Update" : "Create" }
                    </Button>
                </div>

            </form>

        </Form>
    )
}