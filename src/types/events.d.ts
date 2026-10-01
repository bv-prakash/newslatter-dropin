import '@adobe-commerce/event-bus';

declare module '@adobe-commerce/event-bus' {
  interface Events {
    'newsletter/subscribed': {
      email: string;
      status: 'NOT_ACTIVE' | 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'UNCONFIRMED';
    };
  }
}
