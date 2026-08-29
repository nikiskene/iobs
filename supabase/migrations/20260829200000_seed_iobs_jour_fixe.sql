-- Seed: IOBS Jour Fixe held on 2026-08-29.
-- Safe to rerun: source_key is unique and every row uses ON CONFLICT DO NOTHING.
-- Aborts without inserting anything unless Niki, Dietmar and Silje each resolve
-- to exactly one active public.profiles row by full_name.

begin;

do $$
declare
  niki_id uuid;
  dietmar_id uuid;
  silje_id uuid;
  match_count integer;
  meeting_at timestamptz := timestamptz '2026-08-29 12:00:00+02';
begin
  select count(*), min(id) into match_count, niki_id
  from public.profiles where lower(btrim(full_name)) = lower('Niki Skene') and coalesce(is_active, true);
  if match_count <> 1 then raise exception 'Expected exactly one active profile for Niki Skene; found %.', match_count; end if;

  select count(*), min(id) into match_count, dietmar_id
  from public.profiles where lower(btrim(full_name)) = lower('Dietmar Dahmen') and coalesce(is_active, true);
  if match_count <> 1 then raise exception 'Expected exactly one active profile for Dietmar Dahmen; found %.', match_count; end if;

  select count(*), min(id) into match_count, silje_id
  from public.profiles where lower(btrim(full_name)) = lower('Silje Høegmark') and coalesce(is_active, true);
  if match_count <> 1 then raise exception 'Expected exactly one active profile for Silje Høegmark; found %.', match_count; end if;

  insert into public.momentum_items (
    source_key, title, description, owner_user_id, status, priority, category,
    next_move, waiting_on, desired_output, definition_of_done, dependency_note,
    target_period, requires_document, document_requirement_note, fact_summary,
    created_by, completed_by, created_at, completed_at
  ) values
  (
    'jour-fixe-2026-08-29-fact-silje-joined',
    'Silje joined the IOBS working team',
    'Silje met Dietmar, received the initial IOBS / Beautiful Success / WorldOS briefing and agreed that the collaboration and mission fit her interests. The initial working period runs through approximately the end of November, with substantially more project availability from October.',
    niki_id, 'fact', 'normal', 'Operations', null, null, null, null, null, null, false, null,
    'Silje Høegmark agreed to begin working with the Institute of Beautiful Success as its first Explorer and joined the working collaboration with Niki and Dietmar.',
    niki_id, niki_id, meeting_at, meeting_at
  ),
  (
    'jour-fixe-2026-08-29-fact-weekly-rhythm',
    'Weekly IOBS working rhythm agreed',
    'The working model is deliberately lightweight: weekly alignment plus fast interaction between meetings, with an emphasis on creating tangible outputs instead of administrating the project.',
    niki_id, 'fact', 'normal', 'Operations', null, null, null, null, null, null, false, null,
    'The team agreed to establish a weekly working call, provisionally Sunday at 16:00.',
    niki_id, niki_id, meeting_at, meeting_at
  ),
  (
    'jour-fixe-2026-08-29-fact-create-facts-principle',
    'IOBS execution principle defined: Create Facts',
    'The explicit operating principle is “create facts.” Examples include confirmed interviews, partners, events, stages, published cases, institutional commitments and other tangible evidence that Beautiful Success is becoming real.',
    niki_id, 'fact', 'normal', 'Operations', null, null, null, null, null, null, false, null,
    'The team aligned that the next phase of IOBS must be measured by realities created rather than work performed.',
    niki_id, niki_id, meeting_at, meeting_at
  ),
  (
    'jour-fixe-2026-08-29-fact-dietmar-china-availability',
    'Dietmar tentatively available for China Nov 23–28',
    'Dietmar confirmed that he currently has no conflicting engagement between approximately November 23 and November 28, 2026, and agreed to tentatively protect the period for a possible Beautiful Success activation in Shenzhen / Hong Kong. This is not yet a confirmed trip or event.',
    dietmar_id, 'fact', 'normal', 'China', null, null, null, null, null, 'November 23–28, 2026', false, null,
    'Dietmar confirmed his current availability and tentative hold for the November Shenzhen / Hong Kong period.',
    niki_id, dietmar_id, meeting_at, meeting_at
  ),
  (
    'jour-fixe-2026-08-29-fact-huawei-outreach',
    'Huawei Shenzhen contact approached',
    'Niki contacted his Huawei relationship during the meeting to explore whether Huawei could become part of a Beautiful Success activation during the November Shenzhen / Hong Kong period. The outreach has been sent; a response has not yet been received.',
    niki_id, 'fact', 'normal', 'China', null, null, null, null, null, null, false, null,
    'Niki contacted his Huawei relationship to explore a Beautiful Success activation during the November Shenzhen / Hong Kong period.',
    niki_id, niki_id, meeting_at, meeting_at
  ),
  (
    'jour-fixe-2026-08-29-work-dubai-future-accelerators',
    'Secure Dubai Future Accelerators meeting',
    'Niki wants to meet Dubai Future Accelerators in September and present Beautiful Success / IOBS for the first time, with the ambition of exploring Dubai as the inaugural host city of the Beautiful Success Award.',
    niki_id, 'waiting', 'high', 'Dubai',
    'Follow up with Omar and secure the introduction / meeting date with Dubai Future Accelerators.',
    'Omar / Dubai Future Accelerators introduction and scheduling', null,
    'A meeting date with Dubai Future Accelerators is confirmed.', null,
    'September 2026', false, null, null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-award-criteria-v01',
    'Create Beautiful Success Award criteria V0.1',
    'A key question for the Dubai pitch is: how do we identify Beautiful Success? The framework needs enough structure to explain why something qualifies while preserving meaningful human jury judgment rather than turning the Award into a mechanical score.',
    silje_id, 'pushing', 'high', 'Award',
    'Research how the Nobel Prize and other respected human-judged awards define excellence, nomination criteria and jury judgment; translate useful principles into a first Beautiful Success criteria framework.',
    null, 'Beautiful Success Award Criteria V0.1',
    'A reviewable V0.1 criteria framework is uploaded to the Work repository.', null,
    null, true, 'Upload the Beautiful Success Award Criteria V0.1 document.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-interview-format-v01',
    'Define the Beautiful Success interview format',
    'Previous informal tests generated interesting but overly broad answers. The methodology should produce specific, transferable and publishable insights while making the conversation enjoyable enough for increasingly prominent people to participate. Reference: School of Hard Knocks interview approach.',
    silje_id, 'pushing', 'high', 'Interviews',
    'Develop the first repeatable interview/question structure that turns “What does Beautiful Success mean to you?” into a useful conversation.',
    null, 'Interview Format V0.1',
    'A repeatable interview structure and question set is uploaded to the Work repository.', null,
    null, true, 'Upload the Interview Format V0.1 document.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-nordic-interview-target-list',
    'Build first Nordic interview target list',
    'Create a credibility ladder of 10–20 recognized but realistically reachable Nordic professors, business leaders, city or institutional leaders, cultural figures and other voices.',
    silje_id, 'pushing', 'high', 'Interviews',
    'Identify the first 10–20 credible and realistically reachable Nordic people who could answer the Beautiful Success question.',
    null, 'First Nordic interview target list',
    'A prioritized list of 10–20 credible, reachable targets with enough context for outreach is uploaded.', null,
    null, true, 'Upload the prioritized Nordic interview target list.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-first-interview',
    'Secure first Beautiful Success interview',
    'The objective is not merely to conduct a conversation but to create usable material that can eventually appear in IOBS communication.',
    silje_id, 'pushing', 'high', 'Interviews',
    'Use the first target list and interview methodology to secure the first credible Nordic Beautiful Success conversation.',
    null, null,
    'A credible interviewee agrees to participate and a date or completed interview exists.',
    'The first target list and interview methodology materially support this outreach.',
    null, false, null, null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-media-release-waiver',
    'Prepare Beautiful Success media release waiver',
    'Interviews have little value if IOBS cannot legally publish the resulting material. The mechanism should be easy enough to use with every participant.',
    niki_id, 'pushing', 'high', 'Operations',
    'Create a simple release covering permission to use an interviewee’s name, quote, photograph, audio and/or video for IOBS / Beautiful Success Award communication.',
    null, 'Beautiful Success media release waiver',
    'A reusable release or waiver is uploaded and ready for participant use.', null,
    null, true, 'Upload the approved media release or waiver document.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-nordic-salon-concepts',
    'Explore Nordic Beautiful Success salon',
    'Identify 3–5 realistic Nordic host concepts, venues or institutional partners for an exceptional gathering of approximately 12–20 business, public, academic and cultural leaders in Aarhus, Copenhagen, Stockholm or Helsinki.',
    silje_id, 'pushing', 'high', 'Events',
    'Identify 3–5 realistic Nordic host concepts / venues / institutional partners for a small, high-level Beautiful Success evening.',
    null, 'Nordic salon host concepts',
    'A documented shortlist of 3–5 credible concepts with setting, people and documentation potential is uploaded.', null,
    null, true, 'Upload the Nordic salon concepts shortlist.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-nordic-salon-sponsor',
    'Find sponsor/host for first Nordic salon',
    'The first salon should preferably not require meaningful IOBS cash expenditure. The partner should improve the credibility and quality of the event rather than represent generic fundraising.',
    silje_id, 'pushing', 'normal', 'Partnerships',
    'Approach potential host or sponsoring organizations able to provide the setting and ideally cover venue, travel, accommodation and/or production.',
    null, null,
    'A credible host or sponsor agrees to materially support the first Nordic salon.',
    'The Nordic salon concept shortlist should guide partner selection.',
    null, false, null, null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-new-cases',
    'Develop new Beautiful Success cases',
    'Existing WorldOS work contains approximately 12–13 conceptual cases. More are needed to make the seven perspective levels immediately understandable. The purpose is explanatory, not client consulting.',
    niki_id, 'pushing', 'normal', 'Cases',
    'Identify current questions or topics that can be reframed as strong virtual Beautiful Success / WorldOS cases.',
    null, 'New Beautiful Success case set',
    'A reviewable set of new cases covering useful perspective levels is uploaded.', null,
    null, true, 'Upload the new case set or case drafts.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-dubai-pitch',
    'Prepare Dubai Beautiful Success pitch',
    'Prepare the strongest first institutional presentation connecting IOBS, WorldOS, the Beautiful Success Award, its purpose and criteria, tangible cases, the inaugural host-city opportunity and why Dubai could credibly become the first host.',
    niki_id, 'pushing', 'high', 'Dubai',
    'Prepare the strongest first institutional presentation of IOBS / Beautiful Success for Dubai Future Accelerators once the meeting is secured.',
    null, 'Dubai Beautiful Success pitch deck',
    'A presentation-ready pitch deck is uploaded to the Work repository.',
    'Beautiful Success Award Criteria V0.1 materially strengthens this pitch.',
    null, true, 'Upload the Dubai pitch deck.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-high-level-stages',
    'Get Beautiful Success onto high-level stages',
    'Dietmar already intends to present Beautiful Success at the Austrian Innovation Forum. Additional credible conference opportunities can create visibility, video material and institutional proof; the format can range from approximately 15 minutes to a full keynote.',
    dietmar_id, 'pushing', 'normal', 'Content',
    'Use suitable upcoming speaking and conference opportunities to introduce Beautiful Success as a keynote or topic where program flexibility exists.',
    null, null,
    'Beautiful Success is confirmed in at least one additional credible stage program.', null,
    null, false, null, null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-austrian-forum-capture',
    'Capture Austrian Innovation Forum Beautiful Success keynote',
    'The German-language keynote can create important proof that Beautiful Success already exists as a public-stage idea.',
    dietmar_id, 'pushing', 'normal', 'Content',
    'Ensure the presentation is professionally captured and that IOBS can obtain usable video/photo material.',
    null, 'Usable Austrian Innovation Forum keynote documentation',
    'Usable documentation exists in the Work repository and permission for IOBS usage is clear.', null,
    null, true, 'Upload usable video, photography or a rights/asset package documenting the keynote.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-huawei-activation',
    'Explore Huawei Beautiful Success activation',
    'Explore whether Huawei could host, participate in or support a small, visually and institutionally strong event during the November Shenzhen program.',
    niki_id, 'waiting', 'normal', 'China',
    'Follow up when appropriate and explore whether Huawei could host, participate in or support a small Beautiful Success event.',
    'Huawei contact response', null,
    'Huawei responds and a concrete activation conversation or decision exists.', null,
    'November 23–28, 2026', false, null, null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-shenzhen-hong-kong-salon',
    'Explore Shenzhen / Hong Kong Beautiful Success salon',
    'Identify credible host opportunities beyond Huawei, including private business clubs, trade organizations, diplomatic trade offices, corporate locations, institutional hosts and premium hospitality venues. Approximately 12 strong participants is sufficient.',
    niki_id, 'pushing', 'normal', 'China',
    'Identify additional credible host opportunities beyond Huawei for a November Beautiful Success salon.',
    null, 'Shenzhen / Hong Kong salon host shortlist',
    'A documented shortlist of credible alternative hosts and next contacts is uploaded.', null,
    'November 23–28, 2026', true, 'Upload the Shenzhen / Hong Kong host shortlist.', null, niki_id, null, meeting_at, null
  ),
  (
    'jour-fixe-2026-08-29-work-whatsapp-channel',
    'Create fast IOBS team communication channel',
    'WhatsApp is intended for fast questions, uncertainty resolution and coordination between weekly calls so the team can resolve uncertainty immediately.',
    niki_id, 'pushing', 'high', 'Operations',
    'Create a WhatsApp group for Niki, Dietmar and Silje.',
    null, null,
    'The WhatsApp group exists and all three team members have joined.', null,
    null, false, null, null, niki_id, null, meeting_at, null
  )
  on conflict do nothing;

  -- SQL Editor has no end-user auth.uid(), so attribute trigger-created seed
  -- activity to the meeting importer recorded in created_by.
  update public.momentum_activity activity
  set actor_user_id = item.created_by
  from public.momentum_items item
  where activity.momentum_item_id = item.id
    and activity.actor_user_id is null
    and item.source_key like 'jour-fixe-2026-08-29-%';

  raise notice 'Resolved Niki %, Dietmar %, Silje %.', niki_id, dietmar_id, silje_id;
end;
$$;

commit;
