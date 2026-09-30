import { EventEmitter } from 'events';

class RestaurantEventHub extends EventEmitter {
  private static instance: RestaurantEventHub;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): RestaurantEventHub {
    if (!RestaurantEventHub.instance) {
      RestaurantEventHub.instance = new RestaurantEventHub();
    }
    return RestaurantEventHub.instance;
  }

  public emitPortalEvent(eventType: string, payload: unknown) {
    this.emit('portal-event', {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    });
  }
}

export const eventHub = RestaurantEventHub.getInstance();
