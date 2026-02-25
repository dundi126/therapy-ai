import 'server-only'

import { StreamClient } from '@stream-io/node-sdk'

export const streamVideo = new StreamClient(
    process.env.NEXT_PUBLIC_VIDEO_STREAM_API_KEY!,
    process.env.NEXT_PUBLIC_VIDEO_STREAM_SECRET_KEY!,
)