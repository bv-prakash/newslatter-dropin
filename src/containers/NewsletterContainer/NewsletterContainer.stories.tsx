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
  NewsletterContainer as component,
  NewsletterContainerProps,
} from '@/newsletter/containers/NewsletterContainer';

const meta: Meta<NewsletterContainerProps> = {
  title: 'Containers/NewsletterContainer',
  component,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<NewsletterContainerProps>;

/**
 * ```ts
 * import { NewsletterContainer } from '@/newsletter/containers/NewsletterContainer';
 * ```
 */
/**
 * Email field and Subscribe button. Leave Minified view unset.
 */
export const NewsletterContainer: Story = {};

/**
 * Minified view true. Edit opens the newsletter page.
 */
export const Minified: Story = {
  args: {
    minified: true,
  },
};

/**
 * Minified view false. Checkbox and SAVE update the customer subscription.
 */
export const SubscriptionOption: Story = {
  args: {
    minified: false,
  },
};
