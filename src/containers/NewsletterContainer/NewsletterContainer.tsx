/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

import { useEffect, useRef, useState } from 'preact/hooks';
import { HTMLAttributes } from 'preact/compat';
import { events } from '@adobe-commerce/event-bus';
import { useText } from '@adobe-commerce/elsie/i18n';
import { Container, classes } from '@adobe-commerce/elsie/lib';
import {
  getCustomerSubscription,
  subscribeToNewsletter,
  updateCustomerSubscription,
} from '@/newsletter/api/newsletter';
import { NewsletterForm } from '@/newsletter/components/NewsletterForm';
import { NewsletterSubscription } from '@/newsletter/components/NewsletterSubscription';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const resolveNewsletterUrl = (
  newsletterUrl: string | undefined,
  pathname: string
) => {
  if (newsletterUrl) {
    return newsletterUrl;
  }

  const segments = pathname.split('/').filter(Boolean);
  const accountIndex = segments.indexOf('account');
  const prefix =
    accountIndex > 0 ? `/${segments.slice(0, accountIndex).join('/')}` : '';

  return `${prefix}/account/newsletter`;
};

export type MinifiedView = boolean | 'true' | 'false';

export interface NewsletterContainerProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  placeholder?: string;
  minified?: MinifiedView;
  newsletterUrl?: string;
  onSubscribe?: (email: string) => void;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';
type PreferenceStatus = 'idle' | 'loading' | 'saving' | 'success' | 'error';

const resolveMinified = (value: MinifiedView | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  return value === true || value === 'true';
};

const messageFrom = (caught: unknown, fallback: string) => {
  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return fallback;
};

export const NewsletterContainer: Container<NewsletterContainerProps> = ({
  className,
  title,
  description,
  placeholder,
  minified,
  newsletterUrl,
  onSubscribe,
  ...props
}) => {
  const labels = useText({
    title: 'Newsletter.Form.title',
    description: 'Newsletter.Form.description',
    emailLabel: 'Newsletter.Form.emailLabel',
    emailPlaceholder: 'Newsletter.Form.emailPlaceholder',
    submit: 'Newsletter.Form.submit',
    submitting: 'Newsletter.Form.submitting',
    invalidEmail: 'Newsletter.Form.invalidEmail',
    success: 'Newsletter.Form.success',
    error: 'Newsletter.Form.error',
    minifiedTitle: 'Newsletter.Minified.title',
    subscribed: 'Newsletter.Minified.subscribed',
    unsubscribed: 'Newsletter.Minified.unsubscribed',
    edit: 'Newsletter.Minified.edit',
    subscriptionTitle: 'Newsletter.Subscription.title',
    general: 'Newsletter.Subscription.general',
    save: 'Newsletter.Subscription.save',
    saving: 'Newsletter.Subscription.saving',
    saved: 'Newsletter.Subscription.saved',
    saveError: 'Newsletter.Subscription.error',
    loading: 'Newsletter.Status.loading',
    loadError: 'Newsletter.Status.loadError',
  });

  const view = resolveMinified(minified);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [preferenceStatus, setPreferenceStatus] = useState<PreferenceStatus>(
    view === undefined ? 'idle' : 'loading'
  );
  const [preferenceMessage, setPreferenceMessage] = useState('');
  const pending = useRef(false);

  useEffect(() => {
    if (view === undefined) {
      return undefined;
    }

    let active = true;
    setPreferenceStatus('loading');

    getCustomerSubscription()
      .then((value) => {
        if (!active) {
          return;
        }

        setSubscribed(value);
        setPreferenceStatus('idle');
      })
      .catch((caught) => {
        if (!active) {
          return;
        }

        setPreferenceMessage(messageFrom(caught, labels.loadError));
        setPreferenceStatus('error');
      });

    return () => {
      active = false;
    };
  }, [view, labels.loadError]);

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
      setStatus('error');
      setMessage(messageFrom(caught, labels.error));
    } finally {
      pending.current = false;
    }
  };

  const handleSubscribedChange = (next: boolean) => {
    setSubscribed(next);

    if (preferenceStatus !== 'success' && preferenceStatus !== 'error') {
      return;
    }

    setPreferenceStatus('idle');
    setPreferenceMessage('');
  };

  const handleSave = async (event: Event) => {
    event.preventDefault();

    if (pending.current) {
      return;
    }

    pending.current = true;
    setPreferenceStatus('saving');
    setPreferenceMessage('');

    try {
      const next = await updateCustomerSubscription(subscribed);
      setSubscribed(next);
      setPreferenceStatus('success');
      setPreferenceMessage(labels.saved);
      events.emit('newsletter/updated', { subscribed: next });
    } catch (caught) {
      setPreferenceStatus('error');
      setPreferenceMessage(messageFrom(caught, labels.saveError));
    } finally {
      pending.current = false;
    }
  };

  const viewName =
    view === undefined ? 'form' : view ? 'minified' : 'options';

  if (view === undefined) {
    return (
      <div
        {...props}
        className={classes([className])}
        data-newsletter-view={viewName}
      >
        <NewsletterForm
          title={title || labels.title}
          description={description || labels.description}
          email={email}
          emailLabel={labels.emailLabel}
          emailPlaceholder={placeholder || labels.emailPlaceholder}
          submitLabel={status === 'loading' ? labels.submitting : labels.submit}
          loading={status === 'loading'}
          error={status === 'error' ? message : undefined}
          success={status === 'success' ? message : undefined}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  const statusText =
    preferenceStatus === 'loading'
      ? labels.loading
      : subscribed
        ? labels.subscribed
        : labels.unsubscribed;

  return (
    <div
      {...props}
      className={classes([className])}
      data-newsletter-view={viewName}
    >
      <NewsletterSubscription
        minified={view}
        title={view ? labels.minifiedTitle : labels.subscriptionTitle}
        statusText={statusText}
        editLabel={labels.edit}
        newsletterUrl={resolveNewsletterUrl(
          newsletterUrl,
          window.location.pathname
        )}
        checkboxLabel={labels.general}
        saveLabel={
          preferenceStatus === 'saving' ? labels.saving : labels.save
        }
        subscribed={subscribed}
        loading={preferenceStatus === 'loading' || preferenceStatus === 'saving'}
        error={preferenceStatus === 'error' ? preferenceMessage : undefined}
        success={preferenceStatus === 'success' ? preferenceMessage : undefined}
        onSubscribedChange={handleSubscribedChange}
        onSave={handleSave}
      />
    </div>
  );
};
