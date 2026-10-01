/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

/** https://preactjs.com/guide/v10/preact-testing-library/ */

import { fireEvent, render } from '@adobe-commerce/elsie/lib/tests';
import { events } from '@adobe-commerce/event-bus';

import { NewsletterContainer } from '@/newsletter/containers/NewsletterContainer';
import { subscribeToNewsletter } from '@/newsletter/api/newsletter';

jest.mock('@/newsletter/api/newsletter', () => ({
  subscribeToNewsletter: jest.fn(),
}));

const subscribeMock = subscribeToNewsletter as jest.Mock;

const typeEmail = (input: HTMLElement, value: string) => {
  fireEvent.input(input, { target: { value } });
};

describe('Newsletter/Containers/NewsletterContainer', () => {
  beforeEach(() => {
    subscribeMock.mockReset();
  });

  test('renders the default signup copy', () => {
    const { container, getByRole, getByText } = render(
      <NewsletterContainer className="extra" />
    );

    expect(container.querySelector('.extra')).toBeTruthy();
    expect(getByRole('form', { name: 'Subscribe to our newsletter' })).toBeTruthy();
    expect(
      getByText('Be the first to hear about new products, offers, and stories.')
    ).toBeTruthy();
    expect(getByRole('button', { name: 'Subscribe' })).toBeTruthy();
  });

  test('renders a custom title and description', () => {
    const { getByRole, getByText } = render(
      <NewsletterContainer title="Join us" description="Weekly notes." />
    );

    expect(getByRole('form', { name: 'Join us' })).toBeTruthy();
    expect(getByText('Weekly notes.')).toBeTruthy();
  });

  test('rejects an invalid email and clears the message when edited', () => {
    const { getByLabelText, getByRole, queryByText } = render(<NewsletterContainer />);
    const input = getByLabelText('Email address');

    typeEmail(input, 'not-an-email');
    fireEvent.submit(getByRole('form'));

    expect(getByRole('status').textContent).toBe('Enter a valid email address.');
    expect(subscribeMock).not.toHaveBeenCalled();

    typeEmail(input, 'reader@example.com');

    expect(queryByText('Enter a valid email address.')).toBeNull();
  });

  test('subscribes a trimmed address and notifies listeners', async () => {
    const onSubscribe = jest.fn();
    const emit = jest.spyOn(events, 'emit');
    let resolveSubscription: (value: { status: 'SUBSCRIBED' }) => void = () => undefined;

    subscribeMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubscription = resolve;
        })
    );

    const { findByText, getByLabelText, getByRole } = render(
      <NewsletterContainer onSubscribe={onSubscribe} />
    );

    typeEmail(getByLabelText('Email address'), '  reader@example.com  ');
    fireEvent.submit(getByRole('form'));

    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    expect(getByRole('button').textContent).toContain('Subscribing...');
    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledWith('reader@example.com');

    fireEvent.submit(getByRole('form'));
    expect(subscribeMock).toHaveBeenCalledTimes(1);

    resolveSubscription({ status: 'SUBSCRIBED' });

    expect(await findByText('Thanks for subscribing.')).toBeTruthy();
    expect((getByLabelText('Email address') as HTMLInputElement).value).toBe('');
    expect(onSubscribe).toHaveBeenCalledWith('reader@example.com');
    expect(emit).toHaveBeenCalledWith('newsletter/subscribed', {
      email: 'reader@example.com',
      status: 'SUBSCRIBED',
    });

    emit.mockRestore();
  });

  test('treats an unconfirmed subscription as success', async () => {
    subscribeMock.mockResolvedValue({ status: 'UNCONFIRMED' });

    const { getByLabelText, getByRole, findByText } = render(<NewsletterContainer />);

    typeEmail(getByLabelText('Email address'), 'reader@example.com');
    fireEvent.submit(getByRole('form'));

    expect(await findByText('Thanks for subscribing.')).toBeTruthy();
  });

  test('shows a generic error when the subscription is not active', async () => {
    subscribeMock.mockResolvedValue({ status: 'NOT_ACTIVE' });

    const { getByLabelText, getByRole, findByText } = render(<NewsletterContainer />);

    typeEmail(getByLabelText('Email address'), 'reader@example.com');
    fireEvent.submit(getByRole('form'));

    expect(
      await findByText("We couldn't subscribe you. Please try again.")
    ).toBeTruthy();
  });

  test('shows the API error message', async () => {
    subscribeMock.mockRejectedValue(
      new Error('This email address is already subscribed.')
    );

    const { getByLabelText, getByRole, findByText } = render(<NewsletterContainer />);

    typeEmail(getByLabelText('Email address'), 'reader@example.com');
    fireEvent.submit(getByRole('form'));

    expect(
      await findByText('This email address is already subscribed.')
    ).toBeTruthy();
  });

  test('shows a generic error when the API error has no message', async () => {
    subscribeMock.mockRejectedValue(new Error(''));

    const { getByLabelText, getByRole, findByText } = render(<NewsletterContainer />);

    typeEmail(getByLabelText('Email address'), 'reader@example.com');
    fireEvent.submit(getByRole('form'));

    expect(
      await findByText("We couldn't subscribe you. Please try again.")
    ).toBeTruthy();
  });

  test('shows a generic error when the failure is not an Error', async () => {
    subscribeMock.mockRejectedValue('nope');

    const { getByLabelText, getByRole, findByText } = render(<NewsletterContainer />);

    typeEmail(getByLabelText('Email address'), 'reader@example.com');
    fireEvent.submit(getByRole('form'));

    expect(
      await findByText("We couldn't subscribe you. Please try again.")
    ).toBeTruthy();
  });
});
