import { createFileRoute } from "@tanstack/react-router";
import { MessagingUI } from "@/components/app/Messaging";
import { getConversations } from "@/data/messages";

export const Route = createFileRoute("/app/advertiser/messages")({
  component: MessagesPage,
  loader: () => getConversations(),
});

function MessagesPage() {
  return <MessagingUI conversations={Route.useLoaderData()} />;
}
