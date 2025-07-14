export interface SessionStore {
  set(sessionId: string, data: any, ttl: number): Promise<void>;
  get(sessionId: string): Promise<string | null>;
  delete(sessionId: string): Promise<void>;
}
