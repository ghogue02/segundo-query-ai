'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ConversationMessage {
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface SubmissionData {
  user_id: number;
  first_name: string;
  last_name: string;
  task_id: number;
  task_title: string;
  submission?: {
    content: string;
    created_at: string;
  };
  thread?: {
    thread_id: number;
    messages: ConversationMessage[];
  };
}

interface TaskSubmissionModalProps {
  taskId: number;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskSubmissionModal({
  taskId,
  userId,
  isOpen,
  onClose,
}: TaskSubmissionModalProps) {
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !taskId || !userId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/task/${taskId}/submission/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch submission data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [taskId, userId, isOpen]);

  if (!isOpen) return null;

  const hasSubmission = Boolean(data?.submission);
  const hasThread = Boolean(data?.thread && data.thread.messages.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {data ? `${data.first_name} ${data.last_name}` : 'Loading...'}
              </span>
              {data && (
                <Badge variant="secondary" className="text-xs">
                  ID: {data.user_id}
                </Badge>
              )}
            </div>
            {data && (
              <div className="text-sm font-normal text-gray-600 flex items-center gap-2">
                <FileText className="size-4" />
                {data.task_title}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading submission data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Show message if no data */}
            {!hasSubmission && !hasThread && (
              <div className="py-12 text-center text-gray-500">
                <MessageSquare className="size-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No submission or thread found</p>
                <p className="text-sm mt-1">
                  This builder may have marked the task complete without a submission.
                </p>
              </div>
            )}

            {/* Show tabs if has data */}
            {(hasSubmission || hasThread) && (
              <Tabs defaultValue={hasSubmission ? 'submission' : 'thread'} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full justify-start">
                  {hasSubmission && (
                    <TabsTrigger value="submission" className="flex items-center gap-2">
                      <FileText className="size-4" />
                      Submission
                    </TabsTrigger>
                  )}
                  {hasThread && (
                    <TabsTrigger value="thread" className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Conversation ({data.thread?.messages.length || 0})
                    </TabsTrigger>
                  )}
                </TabsList>

                {hasSubmission && (
                  <TabsContent value="submission" className="flex-1 overflow-y-auto mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="size-4" />
                        <span>
                          Submitted on{' '}
                          {new Date(data.submission!.created_at).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <Separator />

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="whitespace-pre-wrap break-words text-gray-800">
                          {data.submission!.content}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {hasThread && (
                  <TabsContent value="thread" className="flex-1 overflow-y-auto mt-4">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-500">
                        Thread ID: {data.thread!.thread_id}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {data.thread!.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={message.role === 'user' ? 'secondary' : 'outline'}
                                  className={`text-xs ${
                                    message.role === 'user'
                                      ? 'bg-blue-700 text-white border-blue-800'
                                      : 'bg-white'
                                  }`}
                                >
                                  {message.role === 'user' ? 'Builder' : 'AI Assistant'}
                                </Badge>
                                <span
                                  className={`text-xs ${
                                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
