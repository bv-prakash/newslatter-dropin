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
import {
  getCustomerSubscription,
  subscribeToNewsletter,
  updateCustomerSubscription,
} from '@/newsletter/api/newsletter';

jest.mock('@/newsletter/api/newsletter', () => ({
  subscribeToNewsletter: jest.fn(),
  getCustomerSubscription: jest.fn(),
  updateCustomerSubscription: jest.fn(),
}));

const subscribeMock = subscribeToNewsletter as jest.Mock;
const getSubscriptionMock = getCustomerSubscription as jest.Mock;
const updateSubscriptionMock = updateCustomerSubscription as jest.Mock;

const typeEmail = (input: HTMLElement, value: string) => {
  fireEvent.input(input, { target: { value } });
};

describe('Newsletter/Containers/NewsletterContainer', () => {
  beforeEach(() => {
    subscribeMock.mockReset();
    getSubscriptionMock.mockReset();
    updateSubscriptionMock.mockReset();
    getSubscriptionMock.mockResolvedValue(false);
  });

  test('renders the default signup copy', () => {
    const { container, getByLabelText, getByRole, getByText } = render(
      <NewsletterContainer className="extra" />
    );

    expect(container.querySelector('.extra')).toBeTruthy();
    expect(getByRole('form', { name: 'Subscribe to our newsletter' })).toBeTruthy();
    expect(
      getByText('Be the first to hear about new products, offers, and stories.')
    ).toBeTruthy();
    expect(getByRole('button', { name: 'Subscribe' })).toBeTruthy();
    expect((getByLabelText('Email address') as HTMLInputElement).placeholder).toBe(
      'Enter your email address'
    );
  });

  test('renders a custom title, description, and placeholder', () => {
    const { getByLabelText, getByRole, getByText } = render(
      <NewsletterContainer
        title="Join us"
        description="Weekly notes."
        placeholder="you@example.com"
      />
    );

    expect(getByRole('form', { name: 'Join us' })).toBeTruthy();
    expect(getByText('Weekly notes.')).toBeTruthy();
    expect((getByLabelText('Email address') as HTMLInputElement).placeholder).toBe(
      'you@example.com'
    );
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

  test('shows the subscription and an edit link when minified view is true', async () => {
    getSubscriptionMock.mockResolvedValue(true);

    const { findByRole, findByText, getByText } = render(
      <NewsletterContainer minified className="extra" />
    );

    expect(getByText('Loading subscription...')).toBeTruthy();
    expect(await findByText('Subscribed to the general newsletter.')).toBeTruthy();
    expect(
      (await findByRole('link', { name: 'Edit' })).getAttribute('href')
    ).toBe('/account/newsletter');
    expect(document.querySelector('[data-newsletter-view="minified"]')?.className).toContain(
      'extra'
    );
  });

  test('opens the newsletter page under the current account root', async () => {
    getSubscriptionMock.mockResolvedValue(true);
    window.history.pushState({}, '', '/root/account/orders');

    const { findByRole } = render(<NewsletterContainer minified />);

    expect(
      (await findByRole('link', { name: 'Edit' })).getAttribute('href')
    ).toBe('/root/account/newsletter');

    window.history.pushState({}, '', '/');
  });

  test('uses a custom newsletter page for the edit link', async () => {
    getSubscriptionMock.mockResolvedValue(false);

    const { findByRole, findByText } = render(
      <NewsletterContainer minified="true" newsletterUrl="/customer/newsletter" />
    );

    expect(await findByText('Not subscribed.')).toBeTruthy();
    expect(
      (await findByRole('link', { name: 'Edit' })).getAttribute('href')
    ).toBe('/customer/newsletter');
  });

  test('shows the general subscription checkbox when minified view is false', async () => {
    getSubscriptionMock.mockResolvedValue(false);
    updateSubscriptionMock.mockResolvedValue(true);
    const emit = jest.spyOn(events, 'emit');

    const { container, findByRole, findByText, getByText, queryByText } = render(
      <NewsletterContainer minified={false} />
    );

    expect(await findByRole('form', { name: 'Subscription option' })).toBeTruthy();
    expect(getByText('General Subscription')).toBeTruthy();

    const checkbox = container.querySelector(
      'input[name="general-subscription"]'
    ) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(queryByText('Subscription saved.')).toBeNull();

    fireEvent.click(getByText('SAVE').closest('button') as HTMLButtonElement);

    expect(await findByText('Subscription saved.')).toBeTruthy();
    expect(updateSubscriptionMock).toHaveBeenCalledWith(true);
    expect(emit).toHaveBeenCalledWith('newsletter/updated', { subscribed: true });

    fireEvent.click(checkbox);
    expect(queryByText('Subscription saved.')).toBeNull();

    emit.mockRestore();
  });

  test('accepts the string false for minified view', async () => {
    const { findByRole } = render(<NewsletterContainer minified="false" />);

    expect(await findByRole('form', { name: 'Subscription option' })).toBeTruthy();
  });

  test('shows the API message when the subscription cannot be loaded', async () => {
    getSubscriptionMock.mockRejectedValue(new Error('The current customer isn\'t authorized.'));

    const { findByText } = render(<NewsletterContainer minified />);

    expect(
      await findByText("The current customer isn't authorized.")
    ).toBeTruthy();
  });

  test('shows a generic message when loading fails without an error message', async () => {
    getSubscriptionMock.mockRejectedValue(new Error(''));

    const { findByText } = render(<NewsletterContainer minified={false} />);

    expect(
      await findByText("We couldn't load your subscription. Please try again.")
    ).toBeTruthy();
  });

  test('shows a generic message when loading fails with a non-Error', async () => {
    getSubscriptionMock.mockRejectedValue('nope');

    const { findByText } = render(<NewsletterContainer minified />);

    expect(
      await findByText("We couldn't load your subscription. Please try again.")
    ).toBeTruthy();
  });

  test('ignores a subscription response that arrives after unmount', async () => {
    let resolveSubscription: (value: boolean) => void = () => undefined;
    getSubscriptionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubscription = resolve;
        })
    );

    const { unmount } = render(<NewsletterContainer minified />);
    unmount();
    resolveSubscription(true);
    await Promise.resolve();
  });

  test('ignores a subscription failure that arrives after unmount', async () => {
    let rejectSubscription: (reason: Error) => void = () => undefined;
    getSubscriptionMock.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectSubscription = reject;
        })
    );

    const { unmount } = render(<NewsletterContainer minified />);
    unmount();
    rejectSubscription(new Error('late'));
    await Promise.resolve();
  });

  test('shows the API message when saving the checkbox fails', async () => {
    updateSubscriptionMock.mockRejectedValue(new Error('Unable to update.'));

    const { container, findByRole, findByText, getByText, queryByText } = render(
      <NewsletterContainer minified={false} />
    );

    expect(await findByRole('form', { name: 'Subscription option' })).toBeTruthy();

    const checkbox = container.querySelector(
      'input[name="general-subscription"]'
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
    fireEvent.click(getByText('SAVE').closest('button') as HTMLButtonElement);

    expect(await findByText('Unable to update.')).toBeTruthy();

    fireEvent.click(checkbox);
    expect(queryByText('Unable to update.')).toBeNull();
  });

  test('ignores a second save while the first request is still running', async () => {
    let resolveUpdate: (value: boolean) => void = () => undefined;
    updateSubscriptionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        })
    );

    const { container, findByRole, findByText, getByRole, getByText, queryByText } = render(
      <NewsletterContainer minified={false} />
    );

    const form = await findByRole('form', { name: 'Subscription option' });
    expect(await findByRole('button', { name: 'SAVE' })).toBeTruthy();

    const checkbox = container.querySelector(
      'input[name="general-subscription"]'
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(updateSubscriptionMock).toHaveBeenCalledTimes(1);
    expect(getByText('Saving...')).toBeTruthy();
    expect((getByRole('button', { name: 'Saving...' }) as HTMLButtonElement).disabled).toBe(
      true
    );

    resolveUpdate(true);
    expect(await findByText('Subscription saved.')).toBeTruthy();
    expect(queryByText('Saving...')).toBeNull();
  });
});
