/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

/** https://preactjs.com/guide/v10/preact-testing-library/ */

import axe from 'axe-core';
import { fireEvent, render } from '@adobe-commerce/elsie/lib/tests';

import { NewsletterSubscription } from '@/newsletter/components/NewsletterSubscription';

const baseProps = {
  title: 'Newsletter',
  statusText: 'Subscribed to the general newsletter.',
  editLabel: 'Edit',
  newsletterUrl: '/newsletter',
  checkboxLabel: 'General Subscription',
  saveLabel: 'SAVE',
  subscribed: true,
  onSubscribedChange: jest.fn(),
  onSave: jest.fn(),
};

describe('Newsletter/Components/NewsletterSubscription', () => {
  beforeEach(() => {
    baseProps.onSubscribedChange.mockReset();
    baseProps.onSave.mockReset();
  });

  test('shows the subscription summary and an edit link', () => {
    const { getByRole, queryByRole } = render(
      <NewsletterSubscription {...baseProps} minified className="extra" />
    );

    expect(getByRole('region', { name: 'Newsletter' }).className).toContain(
      'extra'
    );
    expect(getByRole('heading', { name: 'Newsletter' })).toBeTruthy();
    expect(getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe(
      '/newsletter'
    );
    expect(queryByRole('button', { name: 'SAVE' })).toBeNull();
  });

  test('checks and saves the general subscription', () => {
    const { container, getByRole } = render(
      <NewsletterSubscription
        {...baseProps}
        minified={false}
        title="Subscription option"
        subscribed={false}
        statusText="Not subscribed."
      />
    );

    expect(getByRole('form', { name: 'Subscription option' })).toBeTruthy();
    expect(container.querySelector('.dropin-checkbox__box')).toBeNull();
    expect(container.querySelector('[role="checkbox"]')).toBeNull();

    const checkbox = getByRole('checkbox', {
      name: 'General Subscription',
    }) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(baseProps.onSubscribedChange).toHaveBeenCalledWith(true);

    fireEvent.submit(getByRole('form'));
    expect(baseProps.onSave).toHaveBeenCalledTimes(1);
    expect(baseProps.onSave.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  test('names the checkbox from its visible label', async () => {
    const { container } = render(
      <NewsletterSubscription {...baseProps} minified={false} />
    );

    const results = await axe.run(container, {
      runOnly: ['label-content-name-mismatch'],
    });

    expect(results.violations).toEqual([]);
    expect(results.incomplete).toEqual([]);
  });

  test('shows an error message', () => {
    const { getByRole } = render(
      <NewsletterSubscription
        {...baseProps}
        minified={false}
        error="We couldn't update your subscription. Please try again."
      />
    );

    expect(getByRole('status').textContent).toBe(
      "We couldn't update your subscription. Please try again."
    );
    expect(getByRole('status').className).toContain(
      'newsletter-subscription__message--error'
    );
  });

  test('shows a success message', () => {
    const { getByRole } = render(
      <NewsletterSubscription
        {...baseProps}
        minified
        success="Subscription saved."
      />
    );

    expect(getByRole('status').textContent).toBe('Subscription saved.');
    expect(getByRole('status').className).toContain(
      'newsletter-subscription__message--success'
    );
  });

  test('hides the status message until there is feedback', () => {
    const { getByRole } = render(
      <NewsletterSubscription {...baseProps} minified={false} />
    );

    expect(getByRole('status').textContent).toBe('');
  });
});
