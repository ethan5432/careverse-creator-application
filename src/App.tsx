import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Minus, Plus, Trash2, X } from 'lucide-react';

const FORM_ENDPOINT = 'FORM_ENDPOINT';

type PartnerType = 'creator' | 'business' | 'network' | '';

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Blog / site', 'Other'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Other'];
const acquisitionChannels = ['Organic social', 'Your website', 'Email', 'Paid advertising', 'Direct sales', 'Client / member distribution', 'Other'];
const adPlatforms = ['Meta', 'Google', 'TikTok', 'YouTube', 'Other'];

type SocialAccount = { platform: string; handle: string; followers: string };
type RadioOption = { value: string; label: string };

const bookOfBusinessOptions: RadioOption[] = [
  { value: 'under-25', label: 'Under 25' },
  { value: '25-99', label: '25–99' },
  { value: '100-499', label: '100–499' },
  { value: '500-999', label: '500–999' },
  { value: '1000+', label: '1,000+' },
];

const businessVolumeOptions: RadioOption[] = [
  { value: 'under-10', label: 'Under 10' },
  { value: '10-49', label: '10–49' },
  { value: '50-99', label: '50–99' },
  { value: '100-499', label: '100–499' },
  { value: '500+', label: '500+' },
];

const networkSizeOptions: RadioOption[] = bookOfBusinessOptions;
const networkVolumeOptions: RadioOption[] = [
  { value: 'under-25', label: 'Under 25' },
  { value: '25-99', label: '25–99' },
  { value: '100-499', label: '100–499' },
  { value: '500-999', label: '500–999' },
  { value: '1000+', label: '1,000+' },
];

const terms = [
  ['1. The Program', 'The Careverse Partner Program allows approved partners to promote Careverse and earn commissions on qualifying referrals made through their unique tracking link.'],
  ['2. Eligibility & Approval', 'You must be at least 18 years old. We review all applications and reserve the right to accept or reject any applicant at our sole discretion. We may remove you from the program at any time, with or without notice.'],
  ['3. Approved Promotion & Compliance', 'You must only use content and messaging we approve. You must clearly and conspicuously disclose your relationship with Careverse where required by applicable law and platform guidelines. You may not make false, misleading, or unsubstantiated claims about Careverse, our products, or potential earnings. You may not bid on our trademarks or brand names in paid advertising without written permission.'],
  ['4. Commissions & Payments', 'Commissions are paid only on valid, tracked referrals that meet our criteria. Commission rates and payment terms are communicated in your partner agreement upon approval. We reserve the right to reverse or withhold commissions for refunds, chargebacks, fraudulent activity, or violations of these terms.'],
  ['5. Intellectual Property', 'You may only use the marketing materials, logos, and assets we specifically provide. You may not modify them without permission.'],
  ['6. Termination', 'We may terminate your participation at any time. Upon termination, you must immediately stop promoting Careverse and remove all our links and materials.'],
  ['7. No Employment Relationship', 'You are an independent contractor. Nothing in these terms creates an employment, partnership, or agency relationship.'],
  ['8. Changes to Terms', 'We may update these terms at any time. Continued participation after changes constitutes acceptance of the new terms.'],
  ['9. Governing Law', 'These terms are governed by the laws of the District of Columbia.'],
];

function App() {
  const [partnerType, setPartnerType] = useState<PartnerType>('');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([{ platform: '', handle: '', followers: '' }]);
  const [acquisition, setAcquisition] = useState<string[]>([]);
  const [purchasesAds, setPurchasesAds] = useState('');
  const [adPlatformSelections, setAdPlatformSelections] = useState<string[]>([]);
  const [hasAuthority, setHasAuthority] = useState('');
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [openTerm, setOpenTerm] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateSocialAccount(index: number, key: keyof SocialAccount, value: string) {
    setSocialAccounts((current) => current.map((account, i) => i === index ? { ...account, [key]: value } : account));
  }

  function addSocialAccount() {
    setSocialAccounts((current) => [...current, { platform: '', handle: '', followers: '' }]);
  }

  function removeSocialAccount(index: number) {
    setSocialAccounts((current) => current.filter((_, i) => i !== index));
  }

  function toggleAcquisition(value: string) {
    setAcquisition((current) => current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  function toggleAdPlatform(value: string) {
    setAdPlatformSelections((current) => current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get('first_name') ?? '').trim();
    const lastName = String(data.get('last_name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const country = String(data.get('country') ?? '').trim();

    if (!partnerType || !firstName || !lastName || !email || !country) {
      setError('Please complete the required fields.');
      return;
    }

    if (partnerType === 'creator') {
      const validAccounts = socialAccounts.filter((a) => a.platform && a.handle.trim());
      if (validAccounts.length === 0) {
        setError('Please add at least one social account.');
        return;
      }
    }

    if (partnerType === 'business' || partnerType === 'network') {
      const legalName = String(data.get(partnerType === 'business' ? 'legal_business_name' : 'network_name') ?? '').trim();
      if (!legalName) {
        setError('Please complete the required fields.');
        return;
      }
    }

    if (hasAuthority === 'no') {
      const dmName = String(data.get('dm_name') ?? '').trim();
      const dmEmail = String(data.get('dm_email') ?? '').trim();
      if (!dmName || !dmEmail) {
        setError('Please provide the decision-maker\'s information.');
        return;
      }
    }

    const payload = {
      partner_type: partnerType,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: String(data.get('phone') ?? '').trim(),
      country,
      state: String(data.get('state') ?? '').trim(),
      source: 'partner-application',
      ...buildTypeSpecificPayload(partnerType, data, socialAccounts),
      expected_performance: String(data.get('expected_performance') ?? '').trim(),
      acquisition_channels: acquisition,
      purchases_ads: purchasesAds,
      ad_platforms: purchasesAds === 'yes' ? adPlatformSelections : [],
      has_authority: hasAuthority,
      decision_maker: hasAuthority === 'no' ? {
        name: String(data.get('dm_name') ?? '').trim(),
        role: String(data.get('dm_role') ?? '').trim(),
        email: String(data.get('dm_email') ?? '').trim(),
      } : null,
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
      setError('We couldn\u2019t send your application right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function buildTypeSpecificPayload(type: PartnerType, data: FormData, accounts: SocialAccount[]) {
    if (type === 'creator') {
      return {
        creator_name: String(data.get('creator_name') ?? '').trim(),
        website: String(data.get('website') ?? '').trim(),
        social_accounts: accounts.filter((a) => a.platform && a.handle.trim()),
      };
    }
    if (type === 'business') {
      return {
        legal_business_name: String(data.get('legal_business_name') ?? '').trim(),
        brand_name: String(data.get('brand_name') ?? '').trim(),
        business_website: String(data.get('business_website') ?? '').trim(),
        business_description: String(data.get('business_description') ?? '').trim(),
        book_of_business: String(data.get('book_of_business') ?? '').trim(),
        expected_volume: String(data.get('expected_volume') ?? '').trim(),
      };
    }
    if (type === 'network') {
      return {
        network_name: String(data.get('network_name') ?? '').trim(),
        network_website: String(data.get('network_website') ?? '').trim(),
        network_type: String(data.get('network_type') ?? '').trim(),
        network_size: String(data.get('network_size') ?? '').trim(),
        expected_volume: String(data.get('expected_volume') ?? '').trim(),
      };
    }
    return {};
  }

  if (submitted) {
    return (
      <main className="site-shell">
        <nav className="nav container">
          <a className="brand" href="#top" aria-label="Careverse home">
            <img className="brand-logo" src="/careverse_wordmark.svg" alt="Careverse logo" />
          </a>
        </nav>
        <section className="application-section" id="top">
          <div className="container form-wrap">
            <div className="success-card">
              <div className="success-icon"><Check size={28} /></div>
              <h2>Application received.</h2>
              <p>We\u2019ll review your application and reach out by email. If approved, you\u2019ll receive an invitation to activate your partner account and set your password.</p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="site-shell">
      <nav className="nav container">
        <a className="brand" href="#top" aria-label="Careverse home">
          <img className="brand-logo" src="/careverse_wordmark.svg" alt="Careverse logo" />
        </a>
      </nav>

      <section className="application-section" id="top">
        <div className="container form-wrap">
          <div className="page-header">
            <h1>Careverse Partner Application</h1>
            <p className="page-subtitle">Tell us about yourself and your partnership.</p>
          </div>

          <form className="application-form" onSubmit={handleSubmit} noValidate>
            <div className="form-heading"><span>Partner application</span><small><span className="required-dot">*</span> Required fields</small></div>

            {/* 01 — Partner type */}
            <div className="form-block">
              <div className="block-heading"><span className="number">01</span><div><h3>Partner type</h3><p className="block-support">How would you like to partner with Careverse?</p></div></div>
              <p className="field-support">Choose the partner type that best describes how you will work with Careverse.</p>
              <div className="radio-cards">
                <label className={`radio-card ${partnerType === 'creator' ? 'selected' : ''}`}>
                  <input type="radio" name="partner_type" value="creator" required checked={partnerType === 'creator'} onChange={() => setPartnerType('creator')} />
                  <span className="radio-dot" /><span className="radio-label">Creator</span>
                </label>
                <label className={`radio-card ${partnerType === 'business' ? 'selected' : ''}`}>
                  <input type="radio" name="partner_type" value="business" required checked={partnerType === 'business'} onChange={() => setPartnerType('business')} />
                  <span className="radio-dot" /><span className="radio-label">Business / Agency</span>
                </label>
                <label className={`radio-card ${partnerType === 'network' ? 'selected' : ''}`}>
                  <input type="radio" name="partner_type" value="network" required checked={partnerType === 'network'} onChange={() => setPartnerType('network')} />
                  <span className="radio-dot" /><span className="radio-label">Network</span>
                </label>
              </div>
            </div>

            {/* 02 — Your information */}
            <div className="form-block">
              <div className="block-heading"><span className="number">02</span><div><h3>Your information</h3></div></div>
              <div className="field-grid">
                <Field label="First name" name="first_name" required />
                <Field label="Last name" name="last_name" required />
                <Field label="Email address" name="email" type="email" required />
                <Field label="Phone number" name="phone" optional />
                <SelectField label="Country" name="country" required options={countries} placeholder="Select a country" />
                <Field label="State / region" name="state" optional />
              </div>
              <p className="field-note">Your partner account will be created after approval. You\u2019ll receive an email to set your password and access the partner portal.</p>
            </div>

            {/* 03 — Dynamic section */}
            {partnerType === 'creator' && (
              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Creator details</h3></div></div>
                <div className="field-grid">
                  <Field label="Creator / public name" name="creator_name" required />
                  <Field label="Website or profile URL" name="website" optional />
                </div>
                <div className="subsection-label">Your social accounts</div>
                <p className="field-support">Add at least one social account. <b>*</b></p>
                <div className="channels-list">
                  {socialAccounts.map((account, index) => (
                    <div className="channel-row" key={index}>
                      <label><span>Platform <b>*</b></span><select required value={account.platform} onChange={(e) => updateSocialAccount(index, 'platform', e.target.value)}><option value="">Select a platform</option>{platforms.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
                      <label className="handle-field"><span>Handle or profile URL <b>*</b></span><input required value={account.handle} onChange={(e) => updateSocialAccount(index, 'handle', e.target.value)} placeholder="@yourhandle or URL" /></label>
                      <label className="followers-field"><span>Approx. followers <b>*</b></span><input required value={account.followers} onChange={(e) => updateSocialAccount(index, 'followers', e.target.value)} placeholder="e.g. 15,000" /></label>
                      {index > 0 && <button type="button" className="icon-button" aria-label="Remove account" onClick={() => removeSocialAccount(index)}><Trash2 size={17} /></button>}
                    </div>
                  ))}
                </div>
                <button type="button" className="text-button" onClick={addSocialAccount}><Plus size={16} /> Add another account</button>
              </div>
            )}

            {partnerType === 'business' && (
              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Business details</h3></div></div>
                <div className="field-grid">
                  <Field label="Legal business name" name="legal_business_name" required />
                  <Field label="Brand / company name" name="brand_name" optional />
                  <Field label="Website" name="business_website" type="url" required />
                  <Field label="What does your business primarily do?" name="business_description" required />
                </div>
                <div className="subsection-label">Your book of business</div>
                <RadioGroup label="Approximately how large is your current book of business?" name="book_of_business" required options={bookOfBusinessOptions} />
                <div className="subsection-label">Expected Careverse volume</div>
                <RadioGroup label="How many paid Careverse memberships do you realistically expect to drive per month?" name="expected_volume" required options={businessVolumeOptions} />
                <p className="field-support">This is an estimate of the membership volume you believe your business could generate for Careverse.</p>
              </div>
            )}

            {partnerType === 'network' && (
              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Network details</h3></div></div>
                <div className="field-grid">
                  <Field label="Network name" name="network_name" required />
                  <Field label="Website" name="network_website" type="url" required />
                  <Field label="What type of network do you operate?" name="network_type" required wide />
                </div>
                <div className="subsection-label">Network size</div>
                <RadioGroup label="Approximately how many active partners are in your network?" name="network_size" required options={networkSizeOptions} />
                <div className="subsection-label">Expected Careverse volume</div>
                <RadioGroup label="How many paid Careverse memberships do you realistically expect to drive per month?" name="expected_volume" required options={networkVolumeOptions} />
                <p className="field-support">This is an estimate of the membership volume you believe your network could generate for Careverse.</p>
              </div>
            )}

            {/* 04 — Your expectations */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">04</span><div><h3>Your expectations</h3></div></div>
                <label className="textarea-label">
                  <span>How do you expect to perform with Careverse? {partnerType === 'creator' ? <em>Optional</em> : <b>*</b>}</span>
                  <textarea name="expected_performance" placeholder="Tell us briefly why you believe your expected volume is realistic." required={partnerType !== 'creator'} />
                </label>
              </div>
            )}

            {/* 05 — Customer acquisition */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">05</span><div><h3>Customer acquisition</h3></div></div>
                <p className="field-support">How will customers reach Careverse through your partnership? <b>*</b></p>
                <div className="checkbox-grid">
                  {acquisitionChannels.map((channel) => (
                    <CheckboxPill key={channel} label={channel} checked={acquisition.includes(channel)} onChange={() => toggleAcquisition(channel)} />
                  ))}
                </div>
              </div>
            )}

            {/* 06 — Paid advertising */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading-no-num"><div><h3>Paid advertising</h3></div></div>
                <p className="field-support">Do you purchase advertising specifically to generate customers or conversions? <b>*</b></p>
                <div className="inline-radios">
                  <label className={`inline-radio ${purchasesAds === 'yes' ? 'selected' : ''}`}><input type="radio" name="purchases_ads" value="yes" checked={purchasesAds === 'yes'} onChange={() => setPurchasesAds('yes')} /><span className="radio-dot" /><span>Yes</span></label>
                  <label className={`inline-radio ${purchasesAds === 'no' ? 'selected' : ''}`}><input type="radio" name="purchases_ads" value="no" checked={purchasesAds === 'no'} onChange={() => setPurchasesAds('no')} /><span className="radio-dot" /><span>No</span></label>
                </div>
                {purchasesAds === 'yes' && (
                  <div className="conditional-block">
                    <p className="field-support">Where do you typically purchase advertising?</p>
                    <div className="checkbox-grid">
                      {adPlatforms.map((platform) => (
                        <CheckboxPill key={platform} label={platform} checked={adPlatformSelections.includes(platform)} onChange={() => toggleAdPlatform(platform)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 07 — Partnership authority */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">06</span><div><h3>Partnership authority</h3></div></div>
                <p className="field-support">Are you authorized to approve and enter into this partnership? <b>*</b></p>
                <div className="inline-radios">
                  <label className={`inline-radio ${hasAuthority === 'yes' ? 'selected' : ''}`}><input type="radio" name="has_authority" value="yes" checked={hasAuthority === 'yes'} onChange={() => setHasAuthority('yes')} /><span className="radio-dot" /><span>Yes — I can make this decision</span></label>
                  <label className={`inline-radio ${hasAuthority === 'no' ? 'selected' : ''}`}><input type="radio" name="has_authority" value="no" checked={hasAuthority === 'no'} onChange={() => setHasAuthority('no')} /><span className="radio-dot" /><span>No — someone else needs to approve it</span></label>
                </div>
                {hasAuthority === 'no' && (
                  <div className="conditional-block">
                    <div className="field-grid">
                      <Field label="Who is the decision-maker?" name="dm_name" required />
                      <Field label="Their role / title" name="dm_role" required />
                      <Field label="Their email" name="dm_email" type="email" required wide />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 08 — Your information (data use) */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">07</span><div><h3>Your information</h3></div></div>
                <p className="privacy-note no-margin">We use the information you provide to review your application, create and manage your partner account, configure tracking, and operate the Careverse Partner Program. We may share relevant information with our partner, tracking, payment, and onboarding providers as needed to operate the program. We do not sell personal information.</p>
              </div>
            )}

            {/* 09 — Final details */}
            {partnerType && (
              <div className="form-block agreements-block">
                <div className="block-heading"><span className="number">08</span><div><h3>Final details</h3></div></div>
                <Checkbox name="confirm_accurate" text="I confirm that the information in this application is accurate." />
                <Checkbox name="no_guarantee" text="I understand that submitting an application does not guarantee acceptance or a particular commission rate." />
                <Checkbox name="terms" text={<>I agree to the <button type="button" className="inline-button" onClick={() => setIsTermsOpen(true)}>Careverse Partner Program Terms</button></>} />
              </div>
            )}

            {error && <div className="error-message" role="alert">{error}</div>}
            {partnerType && (
              <button className="button submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending application...' : 'Submit partner application'} {!isSubmitting && <ArrowRight size={18} />}
              </button>
            )}
          </form>
        </div>
      </section>

      <Footer />

      {isTermsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsTermsOpen(false); }}>
          <section className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
            <button className="modal-close" onClick={() => setIsTermsOpen(false)} aria-label="Close terms"><X /></button>
            <h2 id="terms-title">Partner Program Terms</h2>
            <p className="terms-intro">These Terms govern your participation in the Careverse Partner Program operated by Care Access PBC (&quot;Careverse&quot;, &quot;we&quot;, &quot;us&quot;). By applying to or participating in the Program, you agree to these Terms.</p>
            <div className="terms-list">
              {terms.map(([title, text], index) => (
                <div className={`term-row ${openTerm === index ? 'open' : ''}`} key={title}>
                  <button onClick={() => setOpenTerm(openTerm === index ? null : index)} aria-expanded={openTerm === index}><span>{title}</span>{openTerm === index ? <Minus size={17} /> : <Plus size={17} />}</button>
                  {openTerm === index && <p>{text}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Footer() {
  return <footer className="footer"><div className="footer-inner container"><a className="brand" href="#top"><img className="brand-logo" src="/careverse_wordmark.svg" alt="Careverse logo" /></a><span>Care, connected.</span></div></footer>;
}

function Field({ label, name, type = 'text', required = false, optional = false, wide = false }: { label: string; name: string; type?: string; required?: boolean; optional?: boolean; wide?: boolean }) {
  return <label className={wide ? 'wide-field' : ''}><span>{label} {required && <b>*</b>} {optional && <em>Optional</em>}</span><input name={name} type={type} required={required} /></label>;
}

function SelectField({ label, name, required = false, options, placeholder }: { label: string; name: string; required?: boolean; options: string[]; placeholder?: string }) {
  return <label><span>{label} {required && <b>*</b>}</span><select name={name} required={required} defaultValue=""><option value="">{placeholder ?? 'Select...'}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>;
}

function RadioGroup({ label, name, required, options }: { label: string; name: string; required?: boolean; options: RadioOption[] }) {
  return (
    <div className="radio-group">
      <span className="radio-group-label">{label} {required && <b>*</b>}</span>
      <div className="radio-pills">
        {options.map((opt) => (
          <label key={opt.value} className="radio-pill"><input type="radio" name={name} value={opt.value} required={required} /><span className="radio-dot" /><span>{opt.label}</span></label>
        ))}
      </div>
    </div>
  );
}

function Checkbox({ name, text }: { name: string; text: React.ReactNode }) {
  return <label className="checkbox-row"><input type="checkbox" name={name} required /><span className="checkbox-custom"><Check size={13} /></span><span>{text}</span></label>;
}

function CheckboxPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`check-pill ${checked ? 'checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-pill-box"><Check size={12} /></span>
      <span>{label}</span>
    </label>
  );
}

export default App;
