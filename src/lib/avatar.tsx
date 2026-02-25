import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";

interface Props{
    seed: string,
    variant: "botttsNeutral" | "initials"
}


export const generateAvatarUri = ({ seed, variant }: Props) => {
    let avatart;

    if (variant === 'botttsNeutral') {
        avatart = createAvatar(botttsNeutral, {seed})
    } else {
        avatart = createAvatar(initials,{seed, fontWeight:500, fontSize:42})
    }

    return avatart.toDataUri()
}