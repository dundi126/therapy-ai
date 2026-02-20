"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import {  useSuspenseQuery } from "@tanstack/react-query"

const MeetingsView = () => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))
  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}
 
export default MeetingsView


export const MeetingsViewLoading = () => {
    return (
        <LoadingState
            title="Loading meetings"
            description="Please wait while your meetings is loading..."
        />
    )
}

export const MeetingsViewError = () => {
    return(
        <ErrorState
            title="Error Loading meetings"
            description="Something went wrong"
        />
    )
}