import { AgentsView } from '@/modules/agents/ui/views/agents-views'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { LoadingState } from '@/components/loading-state'
import React, { Suspense } from 'react'
import { ErrorState } from '@/components/error-state'
import { ErrorBoundary } from 'react-error-boundary'

const page = async () => {

    const queryClient = getQueryClient(); 
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

    // if (isLoading) {
    //     return <LoadingState title="Loading Agents" description="This may take few seconds..."/>
    // }

    // if (isError) { 
    //     return <ErrorState title="Error loading agents" description="Please try again later."/>
    // }


  return (
      <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense
              fallback={<LoadingState title="Loading Agents" description="This may take few seconds..." />}>
              <ErrorBoundary
                  fallback={<ErrorState title="Error loading agents" description="Please try again later." />}>
                    <AgentsView />
              </ErrorBoundary>
          </Suspense>
    </HydrationBoundary>
  )
}

export default page

