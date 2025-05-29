import { client, setTokens } from "../../auth";
import { subjects } from "../../../auth/subjects";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new Response("Missing authorization code", { status: 400 });
    }

    try {
        const tokens = await client.exchange(code, `${url.protocol}//${url.host}/api/callback`);

        if (tokens.err) {
            console.error("Token exchange error:", tokens.err);
            return new Response("Authentication failed", { status: 400 });
        }

        const verified = await client.verify(subjects, tokens.tokens.access);

        if (verified.err) {
            console.error("Token verification error:", verified.err);
            return new Response("Authentication failed", { status: 400 });
        }

        await setTokens(tokens.tokens.access, tokens.tokens.refresh);

        return redirect("/");
    } catch (error) {
        console.error("Callback error:", error);
        return new Response("Authentication failed", { status: 500 });
    }
}
