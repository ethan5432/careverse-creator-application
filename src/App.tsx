import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Minus, Plus, Trash2, X } from 'lucide-react';

const FORM_ENDPOINT = 'FORM_ENDPOINT';

type PartnerType = 'creator' | 'business' | '';

const platforms = ['Instagram', 'TikTok', 'YouTube', 'X', 'Facebook', 'LinkedIn', 'Other'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Other'];
const acquisitionChannels = ['Organic social', 'Your website', 'Email', 'Paid advertising', 'Direct sales', 'Client / member distribution', 'Other'];
const adPlatforms = ['Meta', 'Google', 'TikTok', 'YouTube', 'Other'];

type SocialAccount = { platform: string; handle: string; followers: string };

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
  const [acquisitionOther, setAcquisitionOther] = useState('');
  const [adPlatformOther, setAdPlatformOther] = useState('');
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
    const fullName = String(data.get('full_name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const country = String(data.get('country') ?? '').trim();
    const stateProvince = String(data.get('state_province') ?? '').trim();

    if (!partnerType || !fullName || !email || !country) {
      setError('Please complete the required fields.');
      return;
    }

    if (partnerType === 'creator') {
      const validAccounts = socialAccounts.filter((a) => a.platform && a.handle.trim() && a.followers.trim());
      if (validAccounts.length === 0) {
        setError('Please add at least one social account.');
        return;
      }
    }

    if (partnerType === 'business') {
      const legalName = String(data.get('legal_business_name') ?? '').trim();
      const website = String(data.get('business_website') ?? '').trim();
      if (!legalName || !website) {
        setError('Please complete the required fields.');
        return;
      }
    }

    if (hasAuthority === 'no') {
      const dmName = String(data.get('dm_name') ?? '').trim();
      const dmRole = String(data.get('dm_role') ?? '').trim();
      const dmEmail = String(data.get('dm_email') ?? '').trim();
      if (!dmName || !dmRole || !dmEmail) {
        setError('Please provide the decision-maker\u2019s information.');
        return;
      }
    }

    const payload = {
      partner_type: partnerType,
      full_name: fullName,
      email,
      phone: String(data.get('phone') ?? '').trim(),
      country,
      state_province: stateProvince,
      source: 'partner-application',
      ...buildTypeSpecificPayload(partnerType, data, socialAccounts),
      expected_performance: String(data.get('expected_performance') ?? '').trim(),
      acquisition_channels: acquisition,
      acquisition_other: acquisition.includes('Other') ? acquisitionOther.trim() : '',
      purchases_ads: purchasesAds,
      ad_platforms: purchasesAds === 'yes' ? adPlatformSelections : [],
      ad_platform_other: purchasesAds === 'yes' && adPlatformSelections.includes('Other') ? adPlatformOther.trim() : '',
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
        social_accounts: accounts.filter((a) => a.platform && a.handle.trim() && a.followers.trim()),
      };
    }
    if (type === 'business') {
      return {
        legal_business_name: String(data.get('legal_business_name') ?? '').trim(),
        brand_name: String(data.get('brand_name') ?? '').trim(),
        business_website: String(data.get('business_website') ?? '').trim(),
        business_description: String(data.get('business_description') ?? '').trim(),
        business_category: String(data.get('business_category') ?? '').trim(),
        entity_type: String(data.get('entity_type') ?? '').trim(),
        registration_number: String(data.get('registration_number') ?? '').trim(),
        registration_location: String(data.get('registration_location') ?? '').trim(),
        mailing_address: String(data.get('mailing_address') ?? '').trim(),
        business_duration: String(data.get('business_duration') ?? '').trim(),
        public_links: String(data.get('public_links') ?? '').trim(),
        book_of_business: String(data.get('book_of_business') ?? '').trim(),
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
              <p>We’ll review your application and reach out by email. If approved, you’ll receive an invitation to activate your partner account and set your password.</p>
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
            <h1>Partner Program Application</h1>
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
              </div>
            </div>

            {/* 02 — Basic information */}
            <div className="form-block">
              <div className="block-heading"><span className="number">02</span><div><h3>Your information</h3></div></div>
              <div className="field-grid">
                <Field label="Full name" name="full_name" required wide />
                <Field label="Email address" name="email" type="email" required />
                <Field label="Phone number" name="phone" optional />
                <SelectField label="Country" name="country" required options={countries} placeholder="Select a country" />
                <Field label="State / Province" name="state_province" required />
              </div>
              <p className="field-note">Your partner account will be created after approval. You’ll receive an email to set your password and access the partner portal.</p>
            </div>

            {/* 03 — Creator details */}
            {partnerType === 'creator' && (
              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Creator details</h3></div></div>
                <div className="field-grid">
                  <Field label="Creator / public name" name="creator_name" required />
                  <Field label="Website" name="website" type="url" optional />
                </div>
                <div className="subsection-label">Your social accounts</div>
                <p className="field-support">Add at least one social account. <b>*</b></p>
                <div className="channels-list">
                  {socialAccounts.map((account, index) => (
                    <div key={index}>
                      <div className="channel-row">
                        <label><span>Platform <b>*</b></span><select required value={account.platform} onChange={(e) => updateSocialAccount(index, 'platform', e.target.value)}><option value="">Select a platform</option>{platforms.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
                        <label className="handle-field"><span>Handle or profile URL <b>*</b></span><input required value={account.handle} onChange={(e) => updateSocialAccount(index, 'handle', e.target.value)} placeholder="@yourhandle or URL" /></label>
                        <label className="followers-field"><span>Approximate followers <b>*</b></span><input required value={account.followers} onChange={(e) => updateSocialAccount(index, 'followers', e.target.value)} placeholder="e.g. 15,000" /></label>
                        {index > 0 && <button type="button" className="icon-button" aria-label="Remove account" onClick={() => removeSocialAccount(index)}><Trash2 size={17} /></button>}
                      </div>
                      {account.platform === 'Other' && (
                        <div className="other-specify">
                          <label><span>Please specify <b>*</b></span><input required placeholder="Platform name" /></label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="text-button" onClick={addSocialAccount}><Plus size={16} /> Add another account</button>
              </div>
            )}

            {/* 03 — Business details */}
            {partnerType === 'business' && (
              <div className="form-block">
                <div className="block-heading"><span className="number">03</span><div><h3>Business / Agency details</h3></div></div>
                <div className="field-grid">
                  <Field label="Legal business name" name="legal_business_name" required />
                  <Field label="Brand / company name" name="brand_name" required />
                  <Field label="Website" name="business_website" type="url" required />
                  <Field label="What does your business primarily do?" name="business_description" required />
                  <Field label="Business category" name="business_category" required />
                  <Field label="Entity type" name="entity_type" required />
                  <Field label="Registration number" name="registration_number" required />
                  <Field label="Registration location" name="registration_location" required />
                  <Field label="Mailing address" name="mailing_address" required wide />
                  <Field label="How long has the business operated?" name="business_duration" required />
                </div>
                <div className="subsection-label">Public business / profile links</div>
                <label className="textarea-label">
                  <span>Public business / profile links <em>Optional</em></span>
                  <textarea name="public_links" placeholder="Share any relevant links to your business profiles, listings, or portfolios." />
                </label>
                <div className="subsection-label">Book of business</div>
                <label className="textarea-label">
                  <span>Tell us about the approximate size of your current book of business. <b>*</b></span>
                  <textarea name="book_of_business" required placeholder="Describe the size and scope of your current book of business." />
                </label>
                <div className="subsection-label">Expected Careverse membership volume</div>
                <label className="textarea-label">
                  <span>What level of monthly Careverse membership volume do you believe you could realistically generate? <b>*</b></span>
                  <textarea name="expected_volume" required placeholder="Describe the monthly membership volume you believe is realistic." />
                </label>
              </div>
            )}

            {/* 04 — Partnership expectations */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">04</span><div><h3>Partnership expectations</h3></div></div>
                <label className="textarea-label">
                  <span>How do you expect to perform with Careverse? <b>*</b></span>
                  <textarea name="expected_performance" required placeholder="Tell us briefly how you expect to generate Careverse memberships and what level of volume you believe is realistic." />
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
                {acquisition.includes('Other') && (
                  <div className="other-specify">
                    <label><span>Please specify <b>*</b></span><input required value={acquisitionOther} onChange={(e) => setAcquisitionOther(e.target.value)} placeholder="How customers will reach Careverse" /></label>
                  </div>
                )}
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
                    {adPlatformSelections.includes('Other') && (
                      <div className="other-specify">
                        <label><span>Please specify <b>*</b></span><input required value={adPlatformOther} onChange={(e) => setAdPlatformOther(e.target.value)} placeholder="Advertising platform" /></label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 07 — Decision-making authority */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">06</span><div><h3>Decision-making authority</h3></div></div>
                <p className="field-support">Are you authorized to make decisions about this partnership on behalf of yourself or your organization? <b>*</b></p>
                <div className="inline-radios">
                  <label className={`inline-radio ${hasAuthority === 'yes' ? 'selected' : ''}`}><input type="radio" name="has_authority" value="yes" checked={hasAuthority === 'yes'} onChange={() => setHasAuthority('yes')} /><span className="radio-dot" /><span>Yes — I can approve and enter into this partnership</span></label>
                  <label className={`inline-radio ${hasAuthority === 'no' ? 'selected' : ''}`}><input type="radio" name="has_authority" value="no" checked={hasAuthority === 'no'} onChange={() => setHasAuthority('no')} /><span className="radio-dot" /><span>No — someone else needs to approve it</span></label>
                </div>
                {hasAuthority === 'no' && (
                  <div className="conditional-block">
                    <div className="field-grid">
                      <Field label="Decision-maker name" name="dm_name" required />
                      <Field label="Decision-maker role" name="dm_role" required />
                      <Field label="Decision-maker email" name="dm_email" type="email" required wide />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 08 — Data notice */}
            {partnerType && (
              <div className="form-block">
                <div className="block-heading"><span className="number">07</span><div><h3>Your information</h3></div></div>
                <p className="privacy-note no-margin">We use the information you provide to review your application, create and manage your partner account, configure tracking, and determine the appropriate partner relationship and commission structure.</p>
              </div>
            )}

            {/* 09 — Final confirmations */}
            {partnerType && (
              <div className="form-block agreements-block">
                <div className="block-heading"><span className="number">08</span><div><h3>Final details</h3></div></div>
                <Checkbox name="confirm_accurate" text="I confirm that the information in this application is accurate." />
                <Checkbox name="no_guarantee" text="I understand that submitting an application does not guarantee acceptance or a particular commission rate." />
                <Checkbox name="terms" text={<>I agree to the <button type="button" className="inline-button" onClick={() => setIsTermsOpen(true)}>Careverse Partner Terms</button></>} />
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
