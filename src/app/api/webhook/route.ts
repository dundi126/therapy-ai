import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { streamVideo } from "@/lib/stream-video";
import {
    CallEndedEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Webhook URL for Stream Video must be publicly reachable.
 * - Local dev: use a tunnel (e.g. ngrok, cloudflared) and set Stream dashboard URL to https://YOUR_TUNNEL_URL/api/webhook
 * - Production: use your deployed base URL, e.g. https://your-app.com/api/webhook
 */

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

/** GET: allows Stream dashboard "test" or browser visit to confirm the endpoint is reachable. */
export async function GET() {
    return NextResponse.json({
        ok: true,
        message: "Stream webhook endpoint. Use POST for events.",
        path: "/api/webhook",
    });
}

export async function POST(request: Request) {
    const signature = request.headers.get("x-signature");
    const apiKey = request.headers.get("x-api-key");

    if (!signature || !apiKey) { 
        return NextResponse.json({
            error:"Missing signature or API key "
        },
            { status: 400 }
        )
    }

    const body = await request.text();

    if(!verifySignatureWithSDK(body,signature)){
        return NextResponse.json({
            error:"Invalid signature"
        },
            { status: 401 }
        )
    }

    let payload: unknown;
    
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({
            error:"Invalid JSON "
        },
            { status: 400 }
        )
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId =
            event.call?.custom?.meetingId ??
            (typeof event.call_cid === "string" ? event.call_cid.split(":")[1] : undefined);

        if (!meetingId) {
            return NextResponse.json(
                { error: "Missing meetingId" },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY?.trim()) {
            console.error("[webhook] OPENAI_API_KEY is not set; agent cannot join the call.");
            return NextResponse.json(
                { error: "Server misconfiguration: OPENAI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    eq(meetings.status, "upcoming"),
                )
            )
        
        
        if (!existingMeeting) {
            return NextResponse.json({
                error: "Meeting not found"
            },
                { status: 404 }
            )
        }

        await db.update(meetings)
            .set({ status: "active", startedAt: new Date() })
            .where(eq(meetings.id, existingMeeting.id))
        
        
        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId))
        
        if (!existingAgent) {
            return NextResponse.json({
                error: "Agent not found"
            },
                { status: 404 }
            )
        }

        const call = streamVideo.video.call("default", meetingId);
        const agentId = existingAgent.id;
        const instructions = existingAgent.instructions;

        console.log("[webhook] call.session_started – connecting agent", {
            meetingId,
            agentId,
            agentName: existingAgent.name,
        });

        try {
            const realTimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEY!,
                agentUserId: agentId,
                model: "gpt-4o-realtime-preview",
            });
            realTimeClient.updateSession({ instructions });
            console.log("[webhook] agent connected and session updated", { meetingId, agentId });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const stack = err instanceof Error ? err.stack : undefined;
            console.error("[webhook] connectOpenAi failed:", message, stack ?? "");
            return NextResponse.json(
                { error: "Failed to connect agent to call", details: message },
                { status: 500 }
            );
        }
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json({
                error: "Missing meetingId"
            },
                { status: 400 }
            )
        }

        const call = streamVideo.video.call("default", meetingId)
        await call.end()
    } else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({
                error: "Missing meetingId"
            },
                { status: 400 }
            )
        }

        await db.update(meetings)
            .set({
                status: 'processing',
                endedAt: new Date()
            })
            .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")))
    } else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];
        
        if (!meetingId) {
            return NextResponse.json({
                error: "Missing meetingId"
            },
                { status: 400 }
            )
        }

        const [updatedMeeting] = await db.update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url,
            })
            .where(eq(meetings.id, meetingId))
            .returning()
        
        if (!updatedMeeting) {
            return NextResponse.json({
                error: "Meeting not found"
            },
                { status: 404 }
            )
        }

        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl!,
            }
        })


    } else if (eventType === "call.recording_ready") { 
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];
        
        if (!meetingId) {
            return NextResponse.json({
                error: "Missing meetingId"
            },
                { status: 400 }
            )
        }

        const [updatedMeeting] = await db.update(meetings)
            .set({
            recordingUrl: event.call_recording.url,
        })
            .where(eq(meetings.id, meetingId))
            .returning()
        
        if (!updatedMeeting) {
            return NextResponse.json({
                error: "Meeting not found"
            },
                { status: 404 }
            )
        }
    }
        


    return NextResponse.json({status:"ok"})
 }