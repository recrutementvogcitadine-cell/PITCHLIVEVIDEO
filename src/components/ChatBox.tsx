import React from "react";

interface ChatMessage {
  id: number;
  author: string;
  text: string;
}

const exampleMessages: ChatMessage[] = [
  { id: 1, author: "Alice", text: "Super vidéo !" },
  { id: 2, author: "Bob", text: "Bravo au créateur." },
  { id: 3, author: "Charlie", text: "Comment as-tu fait ça ?" },
];

export default function ChatBox() {
  return (
    <div className="bg-white/80 rounded-lg p-3 max-h-40 overflow-y-auto shadow mt-2">
      <div className="flex flex-col gap-1">
        {exampleMessages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-gray-800">{msg.author}:</span> <span className="text-gray-700">{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
