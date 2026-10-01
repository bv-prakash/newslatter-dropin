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
import { Button, Input } from '@adobe-commerce/elsie/components';
import { classes } from '@adobe-commerce/elsie/lib';
import '@/newsletter/components/NewsletterForm/NewsletterForm.css';

export interface NewsletterFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'loading'> {
  title?: string;
  description?: string;
  email: string;
  emailLabel: string;
  submitLabel: string;
  loading?: boolean;
  error?: string;
  success?: string;
  onEmailChange: (email: string) => void;
  onSubmit: (event: Event) => void;
}

export const NewsletterForm: FunctionComponent<NewsletterFormProps> = ({
  className,
  title,
  description,
  email,
  emailLabel,
  submitLabel,
  loading,
  error,
  success,
  onEmailChange,
  onSubmit,
  ...props
}) => {
  const handleSubmit = (event: Event) => {
    event.preventDefault();
    onSubmit(event);
  };

  const handleInput = (event: Event) => {
    onEmailChange((event.target as HTMLInputElement).value);
  };

  return (
    <form
      {...props}
      className={classes(['newsletter-newsletter-form', className])}
      aria-label={title}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="newsletter-newsletter-form__intro">
        <h2 id="newsletter-form-title" className="newsletter-newsletter-form__title">
          {title}
        </h2>
        <p className="newsletter-newsletter-form__description">{description}</p>
      </div>

      <div className="newsletter-newsletter-form__controls">
        <div className="newsletter-newsletter-form__email">
          <Input
            name="email"
            type="email"
            floatingLabel={emailLabel}
            placeholder=" "
            value={email}
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            required
            disabled={loading}
            error={Boolean(error)}
            success={Boolean(success)}
            aria-invalid={Boolean(error)}
            aria-describedby="newsletter-form-status"
            onInput={handleInput}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="medium"
          className="newsletter-newsletter-form__submit"
          disabled={loading}
        >
          {submitLabel}
        </Button>
      </div>

      <p
        id="newsletter-form-status"
        role="status"
        aria-live="polite"
        className={classes([
          'newsletter-newsletter-form__message',
          ['newsletter-newsletter-form__message--error', Boolean(error)],
          ['newsletter-newsletter-form__message--success', Boolean(success)],
        ])}
      >
        {error || success}
      </p>
    </form>
  );
};
