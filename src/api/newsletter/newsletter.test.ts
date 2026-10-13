/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { fetchGraphQl } from '@/newsletter/api/fetch-graphql';
import {
  getCustomerSubscription,
  subscribeToNewsletter,
  updateCustomerSubscription,
} from '@/newsletter/api/newsletter';

jest.mock('@/newsletter/api/fetch-graphql', () => ({
  fetchGraphQl: jest.fn(),
}));

const fetchGraphQlMock = fetchGraphQl as jest.Mock;

describe('Newsletter/api/newsletter', () => {
  beforeEach(() => {
    fetchGraphQlMock.mockReset();
  });

  test('subscribes an email address', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: {
        subscribeEmailToNewsletter: { status: 'SUBSCRIBED' },
      },
    });

    await expect(subscribeToNewsletter('reader@example.com')).resolves.toEqual({
      status: 'SUBSCRIBED',
    });

    expect(fetchGraphQlMock).toHaveBeenCalledWith(
      expect.stringContaining('subscribeEmailToNewsletter'),
      { variables: { email: 'reader@example.com' } }
    );
  });

  test('throws the GraphQL error message', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: null,
      errors: [
        {
          message: 'This email address is already subscribed.',
          extensions: { category: 'graphql-already-exists' },
        },
      ],
    });

    await expect(subscribeToNewsletter('reader@example.com')).rejects.toThrow(
      'This email address is already subscribed.'
    );
  });

  test('throws when the response has no data', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: null,
    });

    await expect(subscribeToNewsletter('reader@example.com')).rejects.toThrow(
      'Unable to subscribe to the newsletter.'
    );
  });

  test('throws when the subscription payload is empty', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: { subscribeEmailToNewsletter: null },
    });

    await expect(subscribeToNewsletter('reader@example.com')).rejects.toThrow(
      'Unable to subscribe to the newsletter.'
    );
  });
});

describe('Newsletter/api/getCustomerSubscription', () => {
  beforeEach(() => {
    fetchGraphQlMock.mockReset();
  });

  test('returns whether the customer is subscribed', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: { customer: { is_subscribed: true } },
    });

    await expect(getCustomerSubscription()).resolves.toBe(true);
  });

  test('returns false when the customer is not subscribed', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: { customer: { is_subscribed: false } },
    });

    await expect(getCustomerSubscription()).resolves.toBe(false);
  });

  test('throws the GraphQL error message', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: null,
      errors: [
        {
          message: "The current customer isn't authorized.",
          extensions: { category: 'graphql-authorization' },
        },
      ],
    });

    await expect(getCustomerSubscription()).rejects.toThrow(
      "The current customer isn't authorized."
    );
  });

  test('throws when the response has no data', async () => {
    fetchGraphQlMock.mockResolvedValue({ data: null });

    await expect(getCustomerSubscription()).rejects.toThrow(
      'Unable to load the newsletter subscription.'
    );
  });

  test('throws when the customer payload is empty', async () => {
    fetchGraphQlMock.mockResolvedValue({ data: { customer: null } });

    await expect(getCustomerSubscription()).rejects.toThrow(
      'Unable to load the newsletter subscription.'
    );
  });
});

describe('Newsletter/api/updateCustomerSubscription', () => {
  beforeEach(() => {
    fetchGraphQlMock.mockReset();
  });

  test('updates the customer subscription', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: {
        updateCustomerV2: { customer: { is_subscribed: false } },
      },
    });

    await expect(updateCustomerSubscription(false)).resolves.toBe(false);
    expect(fetchGraphQlMock).toHaveBeenCalledWith(
      expect.stringContaining('updateCustomerV2(input: $input)'),
      { variables: { input: { is_subscribed: false } } }
    );
  });

  test('throws the GraphQL error message', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: null,
      errors: [
        {
          message: 'Unable to update.',
          extensions: { category: 'graphql-input' },
        },
      ],
    });

    await expect(updateCustomerSubscription(true)).rejects.toThrow(
      'Unable to update.'
    );
  });

  test('throws when the response has no data', async () => {
    fetchGraphQlMock.mockResolvedValue({ data: null });

    await expect(updateCustomerSubscription(true)).rejects.toThrow(
      'Unable to update the newsletter subscription.'
    );
  });

  test('throws when the update payload is empty', async () => {
    fetchGraphQlMock.mockResolvedValue({ data: { updateCustomerV2: null } });

    await expect(updateCustomerSubscription(true)).rejects.toThrow(
      'Unable to update the newsletter subscription.'
    );
  });

  test('throws when the updated customer is empty', async () => {
    fetchGraphQlMock.mockResolvedValue({
      data: { updateCustomerV2: { customer: null } },
    });

    await expect(updateCustomerSubscription(true)).rejects.toThrow(
      'Unable to update the newsletter subscription.'
    );
  });
});
