import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Field } from './Field';
import { TextInput } from './TextInput';
import EstimateCard from './EstimateCard';
import {
  CustomExpeditionDestination,
  CustomExpeditionTopic,
  OrganizationType,
  destinationOptions,
  organizationOptions,
  topicOptions,
} from './constants';

export default function InquiryForm() {
  const [inquiryId, setInquiryId] = useState<string>(() => {
    return localStorage.getItem('custom_expedition_inquiry_id') || crypto.randomUUID();
  });

  const [organizationType, setOrganizationType] = useState<OrganizationType | ''>('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState<CustomExpeditionTopic | ''>('');
  const [otherTopic, setOtherTopic] = useState('');
  const [decisionQuestion, setDecisionQuestion] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [destination, setDestination] = useState<CustomExpeditionDestination | ''>('');
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [preferredTiming, setPreferredTiming] = useState('');
  const [successDefinition, setSuccessDefinition] = useState('');
  const [hasCreatedDraft, setHasCreatedDraft] = useState(
    Boolean(localStorage.getItem('custom_expedition_inquiry_id'))
  );
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const dailyRate = useMemo(() => {
    return (
      organizationOptions.find((option) => option.value === organizationType)
        ?.pricePerDay || 0
    );
  }, [organizationType]);

  const estimatedPrice = useMemo(() => {
    const days = Number(durationDays);
    if (!dailyRate || !days) return null;
    return dailyRate * days;
  }, [dailyRate, durationDays]);

  const canShowEstimate =
    Boolean(organizationType) &&
    Boolean(destination) &&
    Boolean(groupSize) &&
    Boolean(durationDays) &&
    Number(durationDays) > 0;

  const payload = useMemo(() => {
    const context = [
      decisionQuestion
        ? `Decision to clarify:\n${decisionQuestion}`
        : '',
      successDefinition
        ? `What would make this expedition a success:\n${successDefinition}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      id: inquiryId,
      organization_type: organizationType || null,
      organization_name: organizationName || null,
      contact_name: contactName || null,
      email: email || null,
      phone: phone || null,
      topic: topic || null,
      other_topic: otherTopic || null,
      group_size: groupSize ? Number(groupSize) : null,
      preferred_timing: preferredTiming || null,
      destination: destination || null,
      suggested_location: suggestedLocation || null,
      duration_days: durationDays ? Number(durationDays) : null,
      context: context || null,
      estimated_price_usd: estimatedPrice,
      status: 'draft' as const,
    };
  }, [
    inquiryId,
    organizationType,
    organizationName,
    contactName,
    email,
    phone,
    topic,
    otherTopic,
    groupSize,
    preferredTiming,
    destination,
    suggestedLocation,
    durationDays,
    decisionQuestion,
    successDefinition,
    estimatedPrice,
  ]);

  useEffect(() => {
    const hasAnyInput =
      organizationType ||
      organizationName ||
      contactName ||
      email ||
      phone ||
      topic ||
      otherTopic ||
      groupSize ||
      preferredTiming ||
      destination ||
      suggestedLocation ||
      durationDays ||
      decisionQuestion ||
      successDefinition;

    if (!hasAnyInput || submitted) return;

    const timer = window.setTimeout(async () => {
      setSaving(true);
      setError('');

      try {
        if (!hasCreatedDraft) {
          const { error: insertError } = await supabase
            .from('custom_expedition_inquiries')
            .insert(payload);

          if (insertError) throw insertError;

          localStorage.setItem('custom_expedition_inquiry_id', inquiryId);
          setHasCreatedDraft(true);
        } else {
          const { error: updateError } = await supabase
            .from('custom_expedition_inquiries')
            .update(payload)
            .eq('id', inquiryId)
            .eq('status', 'draft');

          if (updateError) throw updateError;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not autosave inquiry.');
      } finally {
        setSaving(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [payload, hasCreatedDraft, inquiryId, submitted]);

  const handleSubmit = async () => {
    setError('');

    if (
      !organizationType ||
      !organizationName ||
      !contactName ||
      !email ||
      !topic ||
      !groupSize ||
      !destination ||
      !durationDays
    ) {
      setError('Please complete the required fields before submitting.');
      return;
    }

    try {
      const submitPayload = {
        ...payload,
        status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
      };

      if (!hasCreatedDraft) {
        const { error: insertError } = await supabase
          .from('custom_expedition_inquiries')
          .insert(submitPayload);

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('custom_expedition_inquiries')
          .update(submitPayload)
          .eq('id', inquiryId);

        if (updateError) throw updateError;
      }

      localStorage.removeItem('custom_expedition_inquiry_id');
      setInquiryId(crypto.randomUUID());
      setHasCreatedDraft(false);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit inquiry.');
    }
  };

  if (submitted) {
    return (
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
            Submitted
          </p>

          <h2 className="mt-5 text-4xl font-bold">
            Your custom expedition brief has been received.
          </h2>

          <p className="mt-5 text-zinc-400">
            We will review the context and come back with the next useful step.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
              Design Brief
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Let&apos;s design your expedition.
            </h2>
          </div>

          <p className="text-xs text-zinc-600">
            {saving ? 'Saving draft...' : hasCreatedDraft ? 'Draft saved' : ''}
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <Field label="Who is this for?">
            <div className="grid gap-3 md:grid-cols-3">
              {organizationOptions.map((option) => {
                const Icon = option.icon;
                const active = organizationType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOrganizationType(option.value)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      active
                        ? 'border-sky-400 bg-sky-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <p className="mt-4 font-semibold">{option.label}</p>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="Organization name *"
              value={organizationName}
              onChange={setOrganizationName}
            />
            <TextInput
              label="Contact person *"
              value={contactName}
              onChange={setContactName}
            />
            <TextInput
              label="Email *"
              value={email}
              onChange={setEmail}
              type="email"
            />
            <TextInput
              label="Phone"
              value={phone}
              onChange={setPhone}
            />
          </div>

          <Field label="What is the main theme?">
            <div className="grid gap-3 sm:grid-cols-3">
              {topicOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTopic(option.value)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    topic === option.value
                      ? 'border-sky-400 bg-sky-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {topic === 'other' && (
              <input
                value={otherTopic}
                onChange={(event) => setOtherTopic(event.target.value)}
                placeholder="What topic?"
                className="mt-3 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}
          </Field>

          <Field label="What decision should your organization be better able to make after this expedition?">
            <textarea
              value={decisionQuestion}
              onChange={(event) => setDecisionQuestion(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="How many participants? *"
              value={groupSize}
              onChange={setGroupSize}
              type="number"
            />
            <TextInput
              label="How many days? *"
              value={durationDays}
              onChange={setDurationDays}
              type="number"
            />
          </div>

          <Field label="Where should it happen?">
            <div className="grid gap-3 md:grid-cols-3">
              {destinationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDestination(option.value)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    destination === option.value
                      ? 'border-sky-400 bg-sky-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <MapPin className="mb-3 h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>

            {destination === 'suggest_different_location' && (
              <input
                value={suggestedLocation}
                onChange={(event) => setSuggestedLocation(event.target.value)}
                placeholder="Which location should we consider?"
                className="mt-3 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}
          </Field>

          <TextInput
            label="When do you plan to have the expedition?"
            value={preferredTiming}
            onChange={setPreferredTiming}
          />

          <Field label="What would make this expedition a success?">
            <textarea
              value={successDefinition}
              onChange={(event) => setSuccessDefinition(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </Field>

          {canShowEstimate && estimatedPrice && (
            <EstimateCard
              estimatedPrice={estimatedPrice}
              durationDays={durationDays}
              dailyRate={dailyRate}
            />
          )}

          {Number(groupSize) > 10 && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              For more than 10 participants, we recommend a custom quote.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-6 py-3 font-medium text-white hover:bg-sky-400"
          >
            Submit brief <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}