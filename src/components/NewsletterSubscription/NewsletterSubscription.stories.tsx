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
  NewsletterSubscription as component,
  NewsletterSubscriptionProps,
} from '@/newsletter/components/NewsletterSubscription';

const meta: Meta<NewsletterSubscriptionProps> = {
  title: 'Components/NewsletterSubscription',
  component,
  args: {
    title: 'Subscription option',
    statusText: 'Not subscribed.',
    editLabel: 'Edit',
    newsletterUrl: '/newsletter',
    checkboxLabel: 'General Subscription',
    saveLabel: 'SAVE',
    subscribed: true,
    onSubscribedChange: () => undefined,
    onSave: (event) => event.preventDefault(),
  },
};

export default meta;

type Story = StoryObj<NewsletterSubscriptionProps>;

/**
 * Minified view. Edit opens the newsletter page.
 */
export const Minified: Story = {
  args: {
    minified: true,
    title: 'Newsletter',
    statusText: 'Subscribed to the general newsletter.',
  },
};

/**
 * Checkbox used when Minified view is false.
 */
export const SubscriptionOption: Story = {
  args: {
    minified: false,
  },
};
