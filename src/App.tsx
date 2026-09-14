import { FormEvent, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clock,
  Minus,
  MousePointerClick,
  Percent,
  Plus,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

const FORM_ENDPOINT = 'FORM_ENDPOINT';
const PARTNER_PORTAL_URL = 'https://nkdl0k.refersion.com/affiliate/registration?oid=124874';

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Blog / site', 'Other'];

type Channel = { platform: string; handle: string };

const terms = [
  ['1. The Program', 'The Careverse Creator Program allows approved creators to promote Careverse and earn commissions on qualifying referrals made through their unique tracking link.'],
  ['2. Eligibility & Approval', 'You must be at least 18 years old. We review all applications and reserve the right to accept or reject any applicant at our sole discretion. We may remove you from the program at any time, with or without notice.'],
  ['3. Approved Promotion & Compliance', 'You must only use content and messaging we approve. You must clearly and conspicuously disclose your relationship with Careverse in every post containing our link (example: #ad, “Creator partnership”, or “I may earn a commission”). You may not make false, misleading, or unsubstantiated claims about Careverse, our products, or potential earnings. You may not bid on our trademarks or brand names in paid advertising without written permission.'],
  ['4. Commissions & Payments', 'Commissions are paid only on valid, tracked referrals that meet our criteria. We reserve the right to reverse or withhold commissions for refunds, chargebacks, fraudulent activity, or violations of these terms. Payment terms and thresholds are managed through the partner portal. Payout threshold: $100. Payout schedule: Net 30 after the referred customer completes their first payment. Commission exclusions: refunds, chargebacks, fraudulent referrals.'],
  ['5. Intellectual Property', 'You may only use the marketing materials, logos, and assets we specifically provide. You may not modify them without permission.'],
  ['6. Termination', 'We may terminate your participation at any time. Upon termination, you must immediately stop promoting Careverse and remove all our links and materials.'],
  ['7. No Employment Relationship', 'You are an independent contractor. Nothing in these terms creates an employment, partnership, or agency relationship.'],
  ['8. Changes to Terms', 'We may update these terms at any time. Continued participation after changes constitutes acceptance of the new terms.'],
  ['9. Governing Law', 'These terms are governed by the laws of the District of Columbia.'],
];

function scrollToForm() {
  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
}

function App() {
  const [channels, setChannels] = useState<Channel[]>([{ platform: '', handle: '' }]);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [openTerm, setOpenTerm] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateChannel(index: number, key: keyof Channel, value: string) {
    setChannels((current) => current.map((channel, channelIndex) => channelIndex === index ? { ...channel, [key]: value } : channel));
  }

  function addChannel() {
    setChannels((current) => [...current, { platform: '', handle: '' }]);
  }

  function removeChannel(index: number) {
    setChannels((current) => current.filter((_, channelIndex) => channelIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get('first_name') ?? '').trim();
    const lastName = String(data.get('last_name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const why = String(data.get('why') ?? '').trim();
    const address1 = String(data.get('address1') ?? '').trim();
    const city = String(data.get('city') ?? '').trim();
    const state = String(data.get('state') ?? '').trim();
    const zip = String(data.get('zip') ?? '').trim();
    const country = String(data.get('country') ?? '').trim();
    const validChannels = channels.filter((channel) => channel.platform && channel.handle.trim());

    if (!firstName || !lastName || !email || !why || !address1 || !city || !state || !zip || !country || validChannels.length === 0) {
      setError('Please complete the required fields and add at least one social channel.');
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      website: String(data.get('website') ?? '').trim(),
      address1,
      address2: String(data.get('address2') ?? '').trim(),
      city,
      state,
      zip,
      country,
      channels: validChannels,
      channels_text: validChannels.map((channel) => `${channel.platform}: ${channel.handle.trim()}`).join(' | '),
      why,
      plan: String(data.get('plan') ?? '').trim(),
      already_applied: String(data.get('already_applied') ?? 'No'),
      source: 'apply',
    };

    setIsSubmitting(true);
    try {
      if (FORM_ENDPOINT !== 'FORM_ENDPOINT') {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Unable to submit');
      }
      setSubmitted(true);
    } catch {
      setError('We couldn’t send your application right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <div className="bg-wash" aria-hidden="true" />
      <nav className="nav container">
        <a className="brand" href="#top" aria-label="Careverse home">
          <img className="brand-logo" src="/image.png" alt="Careverse logo" />
        </a>
      </nav>

      <section className="hero container" id="top">
        <div className="hero-copy">
          <div className="eyebrow">Creator Program</div>
          <h1>Earn by helping people find <span className="red">care</span></h1>
          <p className="hero-lede">Welcome to the Careverse creator program. Careverse connects your doctors, family care, gyms, spas, pet care, kids&apos; health, and more, all in one place.</p>
          <p className="hero-description">We&apos;re looking for creators who are passionate beauty, fitness, wellness, family care, and pet care. Talk about the benefits of Careverse, drive traffic to our platform, and earn commissions on every referral that converts.</p>
          <div className="proof-chips">
            <span className="proof-chip"><span className="proof-check"><Check size={11} /></span>No follower minimum</span>
            <span className="proof-chip"><span className="proof-check"><Check size={11} /></span>25% commission</span>
            <span className="proof-chip"><span className="proof-check"><Check size={11} /></span>90-day window</span>
          </div>
          <button className="button hero-cta" onClick={scrollToForm}>Apply to join <ArrowDown size={18} /></button>
        </div>
      </section>

      <section className="application-section" id="apply">
        <div className="container application-grid">
          <aside className="form-aside">
            <div className="section-kicker">Your next step</div>
            <h2>Let&apos;s make care more human.</h2>
            <p>Tell us a little about yourself and how you&apos;d like to share Careverse. We&apos;re excited to meet the people who will help shape the future of care.</p>
            <div className="aside-stat"><span>01</span><p>Complete your application</p></div>
            <div className="aside-stat"><span>02</span><p>Get approved by our team</p></div>
            <div className="aside-stat"><span>03</span><p>Start sharing and earning</p></div>
            <div className="info-cards">
              <InfoCard icon={<Percent />} title="Commission" text="You earn 25% on the first successful paid subscription or service fee through your link." />
              <InfoCard icon={<Clock />} title="Window" text="If they click your link, you still earn when they convert within 90 days." />
              <InfoCard icon={<MousePointerClick />} title="Attribution" text="Last click wins." />
              <InfoCard icon={<Wallet />} title="Payout" text="Net 30 after the customer&apos;s first payment, once your balance reaches $100. No commission on refunds, chargebacks, or fraud." />
            </div>
          </aside>

          {submitted ? (
            <div className="success-card">
              <div className="success-icon"><Check size={28} /></div>
              <div className="section-kicker">You&apos;re on your way</div>
              <h2>Application received.</h2>
              <p>We&apos;ll email you when you&apos;re approved. Keep an eye on your inbox for next steps from the Careverse team.</p>
              <a className="button secondary-button" href={PARTNER_PORTAL_URL} target="_blank" rel="noreferrer">Continue on the partner portal <ArrowRight size={16} /></a>
            </div>
          ) : (
            <form className="application-form" onSubmit={handleSubmit} noValidate>
              <div className="form-heading"><span>Creator application</span><small><span className="required-dot">*</span> Required fields</small></div>
              <div className="form-block">
                <div className="block-heading"><span className="number">01</span><div><h3>Identity</h3><p>The basics are a great place to start.</p></div></div>
                <div className="field-grid">
                  <Field label="First name" name="first_name" required />
                  <Field label="Last name" name="last_name" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Password" name="password" type="password" required />
                  <Field label="Confirm password" name="confirm_password" type="password" required />
                  <Field label="Website or profile URL" name="website" optional />
                </div>
              </div>

              <div className="form-block">
                <div className="block-heading"><span className="number">02</span><div><h3>Address</h3><p>Where should we send things if needed?</p></div></div>
                <div className="field-grid">
                  <Field label="Address line 1" name="address1" required wide />
                  <Field label="Address line 2" name="address2" optional wide />
                  <Field label="City" name="city" required />
                  <Field label="State / region" name="state" required />
                  <Field label="ZIP / postal code" name="zip" required />
                  <Field label="Country" name="country" required />
                </div>
              </div>

              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Your channels</h3><p>Add at least one place where you connect with your audience.</p></div></div>
                <div className="channels-list">
                  {channels.map((channel, index) => <div className="channel-row" key={index}>
                    <label><span>Platform <b>*</b></span><select required value={channel.platform} onChange={(event) => updateChannel(index, 'platform', event.target.value)}><option value="">Select a platform</option>{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
                    <label className="handle-field"><span>Handle or URL <b>*</b></span><input required value={channel.handle} onChange={(event) => updateChannel(index, 'handle', event.target.value)} placeholder="@yourhandle or URL" /></label>
                    {index > 0 && <button type="button" className="icon-button" aria-label="Remove channel" onClick={() => removeChannel(index)}><Trash2 size={17} /></button>}
                  </div>)}
                </div>
                <button type="button" className="text-button" onClick={addChannel}><Plus size={16} /> Add another channel</button>
              </div>

              <div className="form-block">
                <div className="block-heading"><span className="number">04</span><div><h3>Your story</h3><p>Help us understand what makes your perspective special.</p></div></div>
                <label className="textarea-label"><span>Why are you interested in joining Careverse? <b>*</b></span><textarea name="why" required placeholder="Tell us what draws you to the mission..." /></label>
                <label className="textarea-label"><span>How do you plan to share Careverse? <em>Optional</em></span><textarea name="plan" placeholder="A quick idea is perfect..." /></label>
                <label className="select-label"><span>Have you already applied? <em>Optional</em></span><select name="already_applied" defaultValue="No"><option>Yes</option><option>No</option></select></label>
              </div>

              <div className="form-block agreements-block">
                <div className="block-heading"><span className="number">05</span><div><h3>One last thing</h3><p>Our community is built on trust and transparency.</p></div></div>
                <Checkbox name="age" text="I am at least 18 years old" />
                <Checkbox name="terms" text={<>I agree to the <button type="button" className="inline-button" onClick={() => setIsTermsOpen(true)}>Program Terms</button></>} />
                <Checkbox name="disclosure" text={<>I will disclose the partnership in every post (<strong>#ad</strong> or “I may earn a commission”)</>} />
                <Checkbox name="claims" text="I will not make medical claims, guarantees, or misleading statements about Careverse" />
                <p className="privacy-note">We use the information you provide to review your application, communicate about the program, send tracking links and assets, and process commissions. We share it with our affiliate platform to operate the program. We do not sell personal information.</p>
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
              <button className="button submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending application...' : 'Submit application'} {!isSubmitting && <ArrowRight size={18} />}</button>
              <a className="portal-link" href={PARTNER_PORTAL_URL} target="_blank" rel="noreferrer">Continue on the partner portal <ArrowRight size={15} /></a>
            </form>
          )}
        </div>
      </section>

      <footer className="footer container"><a className="brand" href="#top"><img className="brand-logo footer-logo" src="/image.png" alt="Careverse logo" /></a><span>Care, connected.</span></footer>

      {isTermsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsTermsOpen(false); }}><section className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title"><button className="modal-close" onClick={() => setIsTermsOpen(false)} aria-label="Close terms"><X /></button><div className="section-kicker">The fine print, made clear</div><h2 id="terms-title">Program Terms</h2><p className="terms-intro">These Terms govern your participation in the Careverse Creator Program operated by Care Access PBC (&quot;Careverse&quot;, &quot;we&quot;, &quot;us&quot;). By applying to or participating in the Program, you agree to these Terms.</p><div className="terms-list">{terms.map(([title, text], index) => <div className={`term-row ${openTerm === index ? 'open' : ''}`} key={title}><button onClick={() => setOpenTerm(openTerm === index ? null : index)} aria-expanded={openTerm === index}><span>{title}</span>{openTerm === index ? <Minus size={17} /> : <Plus size={17} />}</button>{openTerm === index && <p>{text}</p>}</div>)}</div></section></div>}
    </main>
  );
}

function Field({ label, name, type = 'text', required = false, optional = false, wide = false }: { label: string; name: string; type?: string; required?: boolean; optional?: boolean; wide?: boolean }) {
  return <label className={wide ? 'wide-field' : ''}><span>{label} {required && <b>*</b>} {optional && <em>Optional</em>}</span><input name={name} type={type} required={required} /></label>;
}

function Checkbox({ name, text }: { name: string; text: React.ReactNode }) {
  return <label className="checkbox-row"><input type="checkbox" name={name} required /><span className="checkbox-custom"><Check size={13} /></span><span>{text}</span></label>;
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="info-card"><span className="info-icon">{icon}</span><strong>{title}</strong><p>{text}</p></div>;
}

export default App;
