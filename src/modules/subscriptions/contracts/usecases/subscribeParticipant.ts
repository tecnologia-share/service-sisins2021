interface ExamAnswer {
  questionId: string;
  response: number;
}

export interface SubscribeParticipant {
  execute: (
    params: SubscribeParticipant.Input
  ) => Promise<SubscribeParticipant.Output>;
}

export namespace SubscribeParticipant {
  export type Input = {
    userId: string;
    courseId: string;
    reason: string;
    examAnswers?: ExamAnswer[];
    videoLink: string;
  };
  export type Output = {
    id: string;
    participantId: string;
    courseId: string;
    reason: string;
    status: string;
    videoLink: string | null;
    droppedOut: Date | null;
    created_at: Date;
  };
}
