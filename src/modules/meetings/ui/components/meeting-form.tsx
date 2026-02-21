import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { meetingsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeetingProps{
    onSuccess?: (id?: string) => void,
    onCancel?: () => void,
    initialValues ?: MeetingGetOne
}


export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues
}: MeetingProps) => {
    const trpc = useTRPC()
    // const router = useRouter()
    const queryClient = useQueryClient()

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => { 
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                )
                onSuccess?.(data.id)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
        
    )

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async () => { 
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                )
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({id:initialValues.id})
                    )
                }
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
        
    )

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? ""
        }
    })

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            updateMeeting.mutate({...values, id: initialValues.id})
        } else {
            createMeeting.mutate(values)
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g, Therapy Consultations"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
 
                        )}
                ></FormField>

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