type EventHandler = (payload: any) => void;

interface RealtimeOptions {
  enable: boolean;
}

export class CommunicationRealtimeService {
  private handlers: Record<string, EventHandler[]> = {};
  private connected = false;
  private options: RealtimeOptions;

  constructor(options: RealtimeOptions) {
    this.options = options;
  }

  public connect() {
    if (!this.options.enable) return;
    this.connected = true;
  }

  public disconnect() {
    this.connected = false;
  }

  public on(event: 'message' | 'typing' | 'read' | 'presence', handler: EventHandler) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }

  public emit(event: 'message' | 'typing' | 'read' | 'presence', payload: any) {
    (this.handlers[event] || []).forEach(h => h(payload));
  }
}

export const communicationRealtimeService = new CommunicationRealtimeService({ enable: false });

