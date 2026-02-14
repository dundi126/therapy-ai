import { AgentsView } from '@/modules/agents/ui/views/agents-views'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { LoadingState } from '@/components/loading-state'
import React, { Suspense } from 'react'
import { ErrorState } from '@/components/error-state'
import { ErrorBoundary } from 'react-error-boundary'
import { AgentsListHeader } from '@/modules/agents/ui/components/agents-list-header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const page = async () => {
    

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect('/sign/in')
    }

    const queryClient = getQueryClient(); 
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());



  return (
      <>
        <AgentsListHeader/>
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={<LoadingState title="Loading Agents" description="This may take few seconds..." />}>
                <ErrorBoundary
                    fallback={<ErrorState title="Error loading agents" description="Please try again later." />}>
                        <AgentsView />
                </ErrorBoundary>
            </Suspense>
            </HydrationBoundary>
    </>
  )
}

export default page

