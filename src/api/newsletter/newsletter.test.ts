/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { fetchGraphQl } from '@/newsletter/api/fetch-graphql';
import { subscribeToNewsletter } from '@/newsletter/api/newsletter';

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
