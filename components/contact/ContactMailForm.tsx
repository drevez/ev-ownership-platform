'use client'

import { useState, type FormEvent } from 'react'

import { useTranslations } from '@/hooks/useTranslations'

const CONTACT_EMAIL = 'hello@motorzero.pt'

function clean(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

export function ContactMailForm() {
  const t = useTranslations()
  const [topic, setTopic] = useState(t.contactsPage.form.topicOptions[0].value)
  const [name, setName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const selectedTopic =
      t.contactsPage.form.topicOptions.find((option) => option.value === topic)
        ?.label ?? topic

    const subject = `${t.contactsPage.form.emailSubjectPrefix}: ${selectedTopic}`
    const body = [
      `${t.contactsPage.form.topicLabel}: ${selectedTopic}`,
      `${t.contactsPage.form.nameLabel}: ${clean(name, 120) || '-'}`,
      `${t.contactsPage.form.replyToLabel}: ${clean(replyTo, 160) || '-'}`,
      `${t.contactsPage.form.pageUrlLabel}: ${clean(pageUrl, 240) || '-'}`,
      '',
      t.contactsPage.form.messageLabel,
      clean(message, 3000),
    ].join('\n')

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-topic" className="text-sm font-semibold text-slate-700">
          {t.contactsPage.form.topicLabel}
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          {t.contactsPage.form.topicOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="contact-name"
          label={t.contactsPage.form.nameLabel}
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <Field
          id="contact-reply-to"
          label={t.contactsPage.form.replyToLabel}
          value={replyTo}
          onChange={setReplyTo}
          autoComplete="email"
          type="email"
        />
      </div>

      <Field
        id="contact-page-url"
        label={t.contactsPage.form.pageUrlLabel}
        value={pageUrl}
        onChange={setPageUrl}
        placeholder={t.contactsPage.form.pageUrlPlaceholder}
        type="url"
      />

      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">
          {t.contactsPage.form.messageLabel}
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          required
          maxLength={3000}
          placeholder={t.contactsPage.form.messagePlaceholder}
          className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          {t.contactsPage.form.privacyNote}
        </p>
        <button
          type="submit"
          className="inline-flex justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {t.contactsPage.form.submit}
        </button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={240}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  )
}
