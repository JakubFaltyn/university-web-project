import { TRPCExample } from "@/components/trpc-example";

export default function TRPCTestPage() {
    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">tRPC Test Page</h1>
            <p className="mb-4 text-gray-600">This page demonstrates the tRPC API working with your MongoDB data.</p>
            <TRPCExample />
        </div>
    );
}
