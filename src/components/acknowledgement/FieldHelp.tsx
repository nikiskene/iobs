import { useState } from 'react';
import ReadingDialog from './ReadingDialog';
import { nominationGuidance, arabicPrincipleGuidance, type NominationField } from '../../content/nominationGuidance';
export default function FieldHelp({ field, locale = 'en' }: { field: NominationField; locale?: string }) {
  const [open, setOpen] = useState(false);
  const guidance = locale === 'ar' ? arabicPrincipleGuidance[field] || nominationGuidance[field] : nominationGuidance[field];
  return <><button type="button" className="nomination-info" aria-label={`${locale === 'ar' ? 'ماذا تكتب' : 'What to write'}: ${guidance.title}`} aria-haspopup="dialog" onClick={() => setOpen(true)}><span aria-hidden="true">i</span></button>
    {open && <ReadingDialog title={guidance.title} eyebrow={locale === 'ar' ? 'كتابة الترشيح' : 'Writing your nomination'} closeLabel={locale === 'ar' ? 'إغلاق النافذة' : 'Close window'} compact onClose={() => setOpen(false)}>
      <p>{guidance.introduction}</p><ol className="nomination-writing-steps">{guidance.steps.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ol>
      <p className="nomination-writing-note">{guidance.note}</p>
    </ReadingDialog>}
  </>;
}
