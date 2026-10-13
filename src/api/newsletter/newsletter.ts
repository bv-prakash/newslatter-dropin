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

const CUSTOMER_SUBSCRIPTION = `
  query customerNewsletterSubscription {
    customer {
      is_subscribed
    }
  }
`;

interface CustomerSubscriptionResponse {
  customer: { is_subscribed: boolean } | null;
}

export const getCustomerSubscription = async (): Promise<boolean> => {
  const response = await fetchGraphQl<CustomerSubscriptionResponse>(
    CUSTOMER_SUBSCRIPTION
  );

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const customer = response.data && response.data.customer;

  if (!customer) {
    throw new Error('Unable to load the newsletter subscription.');
  }

  return customer.is_subscribed;
};

const UPDATE_CUSTOMER_SUBSCRIPTION = `
  mutation updateNewsletterSubscription($input: CustomerUpdateInput!) {
    updateCustomerV2(input: $input) {
      customer {
        is_subscribed
      }
    }
  }
`;

interface UpdateCustomerSubscriptionResponse {
  updateCustomerV2: {
    customer: { is_subscribed: boolean } | null;
  } | null;
}

export const updateCustomerSubscription = async (
  isSubscribed: boolean
): Promise<boolean> => {
  const response = await fetchGraphQl<UpdateCustomerSubscriptionResponse>(
    UPDATE_CUSTOMER_SUBSCRIPTION,
    { variables: { input: { is_subscribed: isSubscribed } } }
  );

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const updated =
    response.data &&
    response.data.updateCustomerV2 &&
    response.data.updateCustomerV2.customer;

  if (!updated) {
    throw new Error('Unable to update the newsletter subscription.');
  }

  return updated.is_subscribed;
};
