/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

// https://storybook.js.org/docs/7.0/preact/writing-stories/introduction
import type { Meta, StoryObj } from '@storybook/preact';
import {
  NewsletterForm as component,
  NewsletterFormProps,
} from '@/newsletter/components/NewsletterForm';

/**
 * Email field and subscribe button for the newsletter signup.
 */
const meta: Meta<NewsletterFormProps> = {
  title: 'Components/NewsletterForm',
  component,
  args: {
    title: 'Subscribe to our newsletter',
    description: 'Be the first to hear about new products, offers, and stories.',
    email: '',
    emailLabel: 'Email address',
    submitLabel: 'Subscribe',
    onEmailChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
};

export default meta;

type Story = StoryObj<NewsletterFormProps>;

/**
 * Empty signup form.
 */
export const NewsletterForm: Story = {};

/**
 * Validation message under the field.
 */
export const Error: Story = {
  args: {
    email: 'not-an-email',
    error: 'Enter a valid email address.',
  },
};

/**
 * Confirmation after a successful subscription.
 */
export const Success: Story = {
  args: {
    success: 'Thanks for subscribing.',
  },
};

/**
 * Field and button locked while the request is in flight.
 */
export const Loading: Story = {
  args: {
    email: 'reader@example.com',
    loading: true,
    submitLabel: 'Subscribing...',
  },
};
