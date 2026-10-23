const bookingUrl = 'https://nikiskenecal.netlify.app/book/iobs';
export default function SchedulePage() {
  return <main><section className="ibs-page-hero"><p className="ibs-eyebrow">Institute of Beautiful Success</p><div><h1>Let’s make time.</h1><p>Choose a time for our conversation.</p></div></section><section className="ibs-section"><iframe src={bookingUrl} title="Book a conversation with IOBS" style={{ width: '100%', height: 'max(850px, 85vh)', border: 0, background: '#fff', borderRadius: 12 }} /><p className="mt-4">Having trouble booking? <a className="underline" href={bookingUrl} target="_blank" rel="noopener noreferrer">Open the booking page</a>.</p></section></main>;
}
