import { NextRequest, NextResponse } from "next/server";
import { analyzeRepo } from "@/lib/analyzer";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json(
            { error: "Missing 'url' query parameter" },
            { status: 400 }
        );
    }

    try {
        const data = await analyzeRepo(url);
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Analysis failed:", error);

        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        const status = errorMessage.includes("Rate limit") ? 429 :
                       errorMessage.includes("not found") ? 404 : 500;

        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}
