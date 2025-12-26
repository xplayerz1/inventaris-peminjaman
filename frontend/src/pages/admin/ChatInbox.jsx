import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Send, MessageSquare } from 'lucide-react';

const GET_ALL_CONVERSATIONS = gql`
  query GetAllConversations {
    allConversations {
      id
      user_id
      user_name
      last_message
      last_message_at
      unread_count_admin
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
    }
  }
`;

const MARK_AS_READ = gql`
  mutation MarkAsRead($conversation_id: Int!) {
    markAsRead(conversation_id: $conversation_id)
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

export default function ChatInbox() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data, refetch } = useQuery(GET_ALL_CONVERSATIONS, {
    pollInterval: 3000, // Poll every 3 seconds for better real-time experience
  });
  const [sendMessageMutation, { loading }] = useMutation(SEND_MESSAGE);
  const [markAsRead] = useMutation(MARK_AS_READ);

  useSubscription(MESSAGE_RECEIVED, {
    variables: { conversation_id: selectedConversation ? parseInt(selectedConversation.id) : 0 },
    skip: !selectedConversation,
    onData: ({ data: subscriptionData }) => {
      // Immediately refetch when new message received
      refetch();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [selectedConversation?.messages]);

  // Update selected conversation when data refreshes
  useEffect(() => {
    if (selectedConversation && data?.allConversations) {
      const updated = data.allConversations.find(c => c.id === selectedConversation.id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(selectedConversation.messages)) {
        setSelectedConversation(updated);
      }
    }
  }, [data]);

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    
    // Mark as read when admin opens conversation
    if (conv.unread_count_admin > 0) {
      try {
        await markAsRead({
          variables: { conversation_id: parseInt(conv.id) }
        });
        refetch(); // Refetch to update unread count in sidebar
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation({
        variables: {
          input: {
            conversation_id: parseInt(selectedConversation.id),
            message: message.trim(),
          },
        },
      });
      setMessage('');
      await refetch(); // Wait for refetch to complete
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Chat Inbox</h2>
        <p className="text-sm text-muted-foreground">
          Manage conversations with users
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[600px]">
        <Card className="col-span-1">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {data?.allConversations?.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{conv.user_name}</p>
                    {conv.unread_count_admin > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {conv.unread_count_admin}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                  )}
                </div>
              ))}
              {(!data?.allConversations || data.allConversations.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle className="text-lg">{selectedConversation.user_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_role === 'admin'
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
