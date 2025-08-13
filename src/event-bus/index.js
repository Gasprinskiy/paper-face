class EventBus {
  constructor() {
    this.eventsMap = new Map(); // key: string, value: Map<number, function>
  }

  subscribe(event) {
    const eventsByKey = this.eventsMap.get(event.key);
    const count = eventsByKey ? eventsByKey.size + 1 : 1;

    const newEvents = eventsByKey || new Map();
    newEvents.set(count, event.callBack);

    this.eventsMap.set(event.key, newEvents);

    return () => {
      const unCount = count - 1;
      if (unCount <= 0) {
        this.eventsMap.delete(event.key);
        return;
      }
      newEvents.delete(count);
    };
  }

  dispatch(dispatchEvent) {
    console.log('dispatchEvent: ', dispatchEvent);

    const events = this.eventsMap.get(dispatchEvent.key);
    console.log('this.eventsMap: ', this.eventsMap);

    if (!events) {
      return;
    }

    console.log('events', events);


    events.forEach((callBack) => {
      callBack(dispatchEvent.arg);
    });
  }
}

const AppEventBus = new EventBus()

export default AppEventBus;
