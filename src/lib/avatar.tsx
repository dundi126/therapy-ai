import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";

interface Props{
    seed: string,
    variant: "botttsNeutral" | "initials"
}


export const generateAvatarUri = ({ seed, variant }: Props) => {
    const safeSeed = seed?.trim() || "?";
    let avatar;

    if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, { seed: safeSeed });
    } else {
        avatar = createAvatar(initials, { seed: safeSeed, fontWeight: 500, fontSize: 42 });
    }

    return avatar.toDataUri();
};