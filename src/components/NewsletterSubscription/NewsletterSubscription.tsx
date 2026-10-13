/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { FunctionComponent } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { Button } from '@adobe-commerce/elsie/components';
import { classes } from '@adobe-commerce/elsie/lib';
import '@/newsletter/components/NewsletterSubscription/NewsletterSubscription.css';

export interface NewsletterSubscriptionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  minified: boolean;
  title: string;
  statusText: string;
  editLabel: string;
  newsletterUrl: string;
  checkboxLabel: string;
  saveLabel: string;
  subscribed: boolean;
  loading?: boolean;
  error?: string;
  success?: string;
  onSubscribedChange: (subscribed: boolean) => void;
  onSave: (event: Event) => void;
}

export const NewsletterSubscription: FunctionComponent<
  NewsletterSubscriptionProps
> = ({
  className,
  minified,
  title,
  statusText,
  editLabel,
  newsletterUrl,
  checkboxLabel,
  saveLabel,
  subscribed,
  loading,
  error,
  success,
  onSubscribedChange,
  onSave,
  ...props
}) => {
  const message = (
    <p
      role="status"
      aria-live="polite"
      className={classes([
        'newsletter-subscription__message',
        ['newsletter-subscription__message--error', Boolean(error)],
        ['newsletter-subscription__message--success', Boolean(success)],
      ])}
    >
      {error || success}
    </p>
  );

  if (minified) {
    return (
      <section
        {...props}
        className={classes([
          'newsletter-subscription',
          'newsletter-subscription--minified',
          className,
        ])}
        aria-label={title}
      >
        <div className="newsletter-subscription__summary">
          <h2 className="newsletter-subscription__title">{title}</h2>
          <p className="newsletter-subscription__status">{statusText}</p>
        </div>
        <Button
          href={newsletterUrl}
          variant="tertiary"
          className="newsletter-subscription__edit"
        >
          {editLabel}
        </Button>
        {message}
      </section>
    );
  }

  return (
    <form
      {...props}
      className={classes([
        'newsletter-subscription',
        'newsletter-subscription--options',
        className,
      ])}
      aria-label={title}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave(event);
      }}
    >
      <h2 className="newsletter-subscription__title">{title}</h2>
      <label className="newsletter-subscription__choice">
        <input
          className="newsletter-subscription__input"
          type="checkbox"
          name="general-subscription"
          checked={subscribed}
          disabled={loading}
          onChange={(event) => {
            const input = event.currentTarget as HTMLInputElement;
            onSubscribedChange(input.checked);
          }}
        />
        <span className="newsletter-subscription__box" aria-hidden="true" />
        <span className="newsletter-subscription__choice-label">
          {checkboxLabel}
        </span>
      </label>
      <Button
        type="submit"
        variant="primary"
        className="newsletter-subscription__save"
        disabled={loading}
      >
        {saveLabel}
      </Button>
      {message}
    </form>
  );
};
