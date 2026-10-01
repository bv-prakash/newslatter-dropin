/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { useRef, useState } from 'preact/hooks';
import { HTMLAttributes } from 'preact/compat';
import { events } from '@adobe-commerce/event-bus';
import { useText } from '@adobe-commerce/elsie/i18n';
import { Container, classes } from '@adobe-commerce/elsie/lib';
import { subscribeToNewsletter } from '@/newsletter/api/newsletter';
import { NewsletterForm } from '@/newsletter/components/NewsletterForm';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NewsletterContainerProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onSubscribe?: (email: string) => void;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export const NewsletterContainer: Container<NewsletterContainerProps> = ({
  className,
  title,
  description,
  onSubscribe,
  ...props
}) => {
  const labels = useText({
    title: 'Newsletter.Form.title',
    description: 'Newsletter.Form.description',
    emailLabel: 'Newsletter.Form.emailLabel',
    submit: 'Newsletter.Form.submit',
    submitting: 'Newsletter.Form.submitting',
    invalidEmail: 'Newsletter.Form.invalidEmail',
    success: 'Newsletter.Form.success',
    error: 'Newsletter.Form.error',
  });

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');
  const pending = useRef(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (status === 'idle') {
      return;
    }

    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (pending.current) {
      return;
    }

    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setStatus('error');
      setMessage(labels.invalidEmail);
      return;
    }

    pending.current = true;
    setStatus('loading');
    setMessage('');

    try {
      const result = await subscribeToNewsletter(value);

      if (result.status === 'SUBSCRIBED' || result.status === 'UNCONFIRMED') {
        setStatus('success');
        setMessage(labels.success);
        setEmail('');
        events.emit('newsletter/subscribed', {
          email: value,
          status: result.status,
        });
        onSubscribe?.(value);
        return;
      }

      setStatus('error');
      setMessage(labels.error);
    } catch (caught) {
      const apiMessage = caught instanceof Error ? caught.message : '';
      setStatus('error');
      setMessage(apiMessage || labels.error);
    } finally {
      pending.current = false;
    }
  };

  return (
    <div {...props} className={classes([className])}>
      <NewsletterForm
        title={title || labels.title}
        description={description || labels.description}
        email={email}
        emailLabel={labels.emailLabel}
        submitLabel={status === 'loading' ? labels.submitting : labels.submit}
        loading={status === 'loading'}
        error={status === 'error' ? message : undefined}
        success={status === 'success' ? message : undefined}
        onEmailChange={handleEmailChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
