"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { MeetingIdViewHeader } from "../components/meeting-id-view-header"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/hooks/use-confirm"
import { UpdateMeetingDialog } from "../components/update-meeting-dialog"
import { useState } from "react"
import { UpcomingState } from "../components/upcoming-state"
import { ActiveState } from "../components/active-state"
import { CancelledState } from "../components/cancel-state"
import { ProcessingState } from "../components/processing-state"

interface Props{
    meetingId: string
}

export const MeetingIdView = ({ meetingId }: Props) => {

    const trpc = useTRPC()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are yoou sure?",
        "The following aciton will remove this meeting"
    )
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }))

    const [updateMeetingDialogOpen,setUpdatemeetingDialogOpen] = useState(false)
    
    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                router.push('/meetings')
             },
        })
    )

    const handleRemovemeeitng = async () => {
        const ok = await confirmRemove();

        if (!ok) return
        
        await removeMeeting.mutateAsync({id: meetingId})
    }

    const isActive = data.status === "active"
    const isUpcoming = data.status === "upcoming"
    const isCanelled = data.status === "cancelled"
    const isCompleted = data.status === "completed"
    const isProcessing = data.status === "processing"

    
    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdatemeetingDialogOpen}
                initialValues={data}
                
            />
            <div className="flex-1 py-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdatemeetingDialogOpen(true)}
                    onRemove={handleRemovemeeitng}

                />
                {isCanelled && (
                    <CancelledState/>
                )}
                {isActive && (
                    <ActiveState
                        meetingId={ meetingId}
                    />
                )}
                {isUpcoming && (
                    <UpcomingState
                        meetingId={meetingId}
                        onCancelMeeting={() => { }}
                        isCancelling={false}
                    />
                )}
                {isCompleted && (
                    <div>Completed</div>
                )}
                {isProcessing && (
                    <ProcessingState/>
                )}
                
            </div>
        </>
    )
}


export const MeetingsIdViewLoading = () => {
    return (
        <LoadingState
            title="Loading meetings"
            description="Please wait while your meetings is loading..."
        />
    )
}

export const MeetingsIdViewError = () => {
    return(
        <ErrorState
            title="Error Loading meetings"
            description="Something went wrong.Please try again later."
        />
    )
}