import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GeneratedAvatarProps {
    seed: string;
    className?: string;
    /** @deprecated Use variant instead */
    varient?: "botttsNeutral" | "initials";
    variant?: "botttsNeutral" | "initials";
}

export const GeneratedAvatar = ({ seed, className, varient, variant: variantProp }: GeneratedAvatarProps) => {
    const variant = variantProp ?? varient ?? "initials";
    const safeSeed = seed?.trim() || "?";
    let avatar;

    if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, { seed: safeSeed });
    } else {
        avatar = createAvatar(initials, {
            seed: safeSeed,
            fontWeight: 500,
            fontSize: 42,
        });
    }

    const dataUri = avatar.toDataUri();

    return (
        <Avatar className={cn(className)}>
            <AvatarImage src={dataUri} alt="Avatar" />
            <AvatarFallback>
                {safeSeed.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};
