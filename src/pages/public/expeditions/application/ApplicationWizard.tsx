import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { Expedition } from '../../../../lib/types';
import ApplicationStepBasics from './ApplicationStepBasics';
import ApplicationStepMotivation from './ApplicationStepMotivation';
import ApplicationStepContribution from './ApplicationStepContribution';
import ApplicationStepCuriosity from './ApplicationStepCuriosity';
import ApplicationStepCommitment from './ApplicationStepCommitment';
import ApplicationSuccess from './ApplicationSuccess';
import ProgressBar from './ProgressBar';

export type ApplicationData = {
  name: string;
  email: string;
  company: string;
  position: string;
  linkedin_url: string;
  motivation: string;
  contribution: string;
  curiosity_question: string;
  commitment_accepted: boolean;
};

const initialData: ApplicationData = {
  name: '',
  email: '',
  company: '',
  position: '',
  linkedin_url: '',
  motivation: '',
  contribution: '',
  curiosity_question: '',
  commitment_accepted: false,
};

export default function ApplicationWizard({
  expedition,
}: {
  expedition: Expedition;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplicationData>(initialData);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const update = (patch: Partial<ApplicationData>) => {
    setData((current) => ({ ...current, ...patch }));
    setError('');
  };

  const next = () => {
    const validationError = validateStep(step, data);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, 5));
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = async () => {
    const validationError = validateStep(5, data);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    setError('');

    const { error: insertError } = await supabase
      .from('expedition_inquiries')
      .insert({
        expedition_id: expedition.id,
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company.trim(),
        position: data.position.trim(),
        linkedin_url: data.linkedin_url.trim() || null,
        motivation: data.motivation.trim(),
        contribution: data.contribution.trim(),
        curiosity_question: data.curiosity_question.trim(),
        commitment_accepted: data.commitment_accepted,
      });

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    setSuccess(true);
    setSending(false);
  };

  if (success) return <ApplicationSuccess />;

  return (
    <aside className="rounded-3xl border border-white/5 bg-white/[0.03] p-7">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">
          Apply to Join
        </p>

        <h2 className="mt-3 text-2xl font-bold">
          {expedition.apply_button_label || 'Apply to Join'}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Every application is reviewed personally.
        </p>
      </div>

      <ProgressBar step={step} total={5} />

      <div className="mt-6">
        {step === 1 && <ApplicationStepBasics data={data} update={update} />}
        {step === 2 && <ApplicationStepMotivation data={data} update={update} />}
        {step === 3 && <ApplicationStepContribution data={data} update={update} />}
        {step === 4 && <ApplicationStepCuriosity data={data} update={update} />}
        {step === 5 && <ApplicationStepCommitment data={data} update={update} />}
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="rounded-md border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Back
          </button>
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={next}
            className="flex-1 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="flex-1 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Apply to Join'}
          </button>
        )}
      </div>
    </aside>
  );
}

function validateStep(step: number, data: ApplicationData) {
  if (step === 1) {
    if (!data.name.trim()) return 'Please enter your full name.';
    if (!data.email.trim()) return 'Please enter your email.';
    if (!data.company.trim()) return 'Please enter your company.';
    if (!data.position.trim()) return 'Please enter your position.';
  }

  if (step === 2 && data.motivation.trim().length < 20) {
    return 'Please tell us a little more about why this matters now.';
  }

  if (step === 3 && data.contribution.trim().length < 20) {
    return 'Please tell us what perspective or question you would bring.';
  }

  if (step === 4 && data.curiosity_question.trim().length < 20) {
    return 'Please tell us who you would want to meet and what you would ask.';
  }

  if (step === 5 && !data.commitment_accepted) {
    return 'Please confirm the commitment before applying.';
  }

  return '';
}