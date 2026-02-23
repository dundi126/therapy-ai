import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { CommandSelect } from "@/components/command-select";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import Image from "next/image";


export const AgentIdFilter = () => {
    const [filters, setFilters] = useMeetingsFilters()
    const trpc = useTRPC()
    const [agentSearch, setAgentSearch] = useState("")
    
    const { data } = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch
        })
    )


    return (
        <CommandSelect
            className="h-9"
            placeholder="Agent"
            options={(data?.items ?? []).map((agent) => ({
                id: agent.id,
                value: agent.id,
                children: (
                    <div className="flex items-center gap-x-2">
                        <Image src="/avatar.png" width={20} height={20} alt="Default Avatar" className="size-4 rounded-full" />
                        {agent.name}
                    </div>
                )
            }))}
            onSelect={(value) => setFilters({ agentId: value })}
            onSearch={setAgentSearch}
            value={filters.agentId ?? ""}
        />
    )
}