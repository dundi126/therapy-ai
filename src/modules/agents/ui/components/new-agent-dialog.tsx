import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";

interface prop{
    open: boolean,
    onOpenChange: (open:boolean) => void,
    onAgentCreated?: (agentId: string) => void
}


export const NewAgentDialog = ({
    open,
    onOpenChange,
    onAgentCreated
}: prop) => {

    return (
        <ResponsiveDialog
            title="New Agent"
            description="Create a new agent"
            open={open}
            onOpenChange={onOpenChange}
        >
            <AgentForm
                onSuccess={(createdAgent) => {
                    if (createdAgent?.id) onAgentCreated?.(createdAgent.id);
                    onOpenChange(false);
                }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )
}