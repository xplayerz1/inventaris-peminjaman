import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Send, MessageSquare } from 'lucide-react';

const GET_MY_CONVERSATION = gql`
  query GetMyConversation {
    myConversation {
      id
      messages {
        id
        sender_role
        sender_name
        message
        created_at
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      message
      created_at
    }
  }
`;

const MESSAGE_RECEIVED = gql`
  subscription MessageReceived($conversation_id: Int!) {
    messageReceived(conversation_id: $conversation_id) {
      id
      sender_role
      sender_name
      message
      created_at
    }
  }
`;

export default function Chat() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { data, refetch } = useQuery(GET_MY_CONVERSATION);
  const [sendMessage, { loading }] = useMutation(SEND_MESSAGE);

  const conversationId = data?.myConversation?.id;

  useSubscription(MESSAGE_RECEIVED, {
    variables: { conversation_id: conversationId ? parseInt(conversationId) : 0 },
    skip: !conversationId,
    onData: () => refetch(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [data?.myConversation?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        variables: {
          input: {
            conversation_id: conversationId ? parseInt(conversationId) : null,
            message: message.trim(),
          },
        },
      });
      setMessage('');
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Chat with Admin</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions or get help
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg">Support Chat</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {data?.myConversation?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSend} className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
