/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { fetchGraphQl } from '@/newsletter/api/fetch-graphql';

export type NewsletterSubscriptionStatus =
  | 'NOT_ACTIVE'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED'
  | 'UNCONFIRMED';

export interface NewsletterSubscription {
  status: NewsletterSubscriptionStatus;
}

const SUBSCRIBE_EMAIL_TO_NEWSLETTER = `
  mutation subscribeEmailToNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) {
      status
    }
  }
`;

interface SubscribeEmailToNewsletterResponse {
  subscribeEmailToNewsletter: NewsletterSubscription | null;
}

export const subscribeToNewsletter = async (
  email: string
): Promise<NewsletterSubscription> => {
  const response = await fetchGraphQl<SubscribeEmailToNewsletterResponse>(
    SUBSCRIBE_EMAIL_TO_NEWSLETTER,
    { variables: { email } }
  );

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const subscription =
    response.data && response.data.subscribeEmailToNewsletter;

  if (!subscription) {
    throw new Error('Unable to subscribe to the newsletter.');
  }

  return subscription;
};
