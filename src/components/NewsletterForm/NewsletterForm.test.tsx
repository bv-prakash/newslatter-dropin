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

import { NewsletterForm } from '@/newsletter/components/NewsletterForm';

const baseProps = {
  email: '',
  emailLabel: 'Email address',
  submitLabel: 'Subscribe',
  onEmailChange: jest.fn(),
  onSubmit: jest.fn(),
};

describe('Newsletter/Components/NewsletterForm', () => {
  beforeEach(() => {
    baseProps.onEmailChange.mockReset();
    baseProps.onSubmit.mockReset();
  });

  test('renders the signup copy, email field, and button', () => {
    const { container, getByLabelText, getByRole } = render(
      <NewsletterForm
        {...baseProps}
        className="extra"
        title="Subscribe to our newsletter"
        description="Be the first to hear about new products."
        email="reader@example.com"
      />
    );

    const form = container.querySelector('form');

    expect(form?.className).toContain('newsletter-newsletter-form');
    expect(form?.className).toContain('extra');
    expect(getByRole('heading', { name: 'Subscribe to our newsletter' })).toBeTruthy();
    expect(container.textContent).toContain('Be the first to hear about new products.');
    expect((getByLabelText('Email address') as HTMLInputElement).value).toBe(
      'reader@example.com'
    );
    expect(getByRole('button', { name: 'Subscribe' })).toBeTruthy();
  });

  test('updates the email address and submits the form', () => {
    const { getByLabelText, getByRole } = render(
      <NewsletterForm {...baseProps} title="Newsletter" />
    );

    fireEvent.input(getByLabelText('Email address'), {
      target: { value: 'reader@example.com' },
    });

    expect(baseProps.onEmailChange).toHaveBeenCalledWith('reader@example.com');

    fireEvent.submit(getByRole('form'));

    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(baseProps.onSubmit.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  test('shows an error message', () => {
    const { getByRole } = render(
      <NewsletterForm {...baseProps} error="Enter a valid email address." />
    );

    expect(getByRole('status').textContent).toBe('Enter a valid email address.');
    expect(getByRole('status').className).toContain(
      'newsletter-newsletter-form__message--error'
    );
  });

  test('shows a success message', () => {
    const { getByRole } = render(
      <NewsletterForm {...baseProps} success="Thanks for subscribing." />
    );

    expect(getByRole('status').textContent).toBe('Thanks for subscribing.');
    expect(getByRole('status').className).toContain(
      'newsletter-newsletter-form__message--success'
    );
  });

  test('hides the status message until there is feedback', () => {
    const { getByRole } = render(<NewsletterForm {...baseProps} />);

    expect(getByRole('status').textContent).toBe('');
  });

  test('disables the field and button while submitting', () => {
    const { getByLabelText, getByRole } = render(
      <NewsletterForm {...baseProps} loading submitLabel="Subscribing..." />
    );

    expect((getByLabelText('Email address') as HTMLInputElement).disabled).toBe(
      true
    );
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    expect(getByRole('button').textContent).toContain('Subscribing...');
  });
});
