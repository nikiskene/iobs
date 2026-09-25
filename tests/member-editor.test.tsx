import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MemberEditor from '../src/pages/admin/MemberEditor';
import { memberMatches, type ManagedMember } from '../src/lib/memberAdmin';

const member: ManagedMember = {
  id: 'person', full_name: 'Example Member', category: 'founders', status: 'published',
  title: 'Co-Founder', description: 'One biography', photo_url: '', linkedin_url: '', substack_url: '',
  sort_order: 0, location: 'Vienna', directory_public: true, primary_profile_id: 'first', updated_at: '2026-09-24',
  accounts: [
    { id: 'first', email: 'first@example.invalid', profile_name: 'example', role: 'explorer', is_team_member: false, is_active: true },
    { id: 'second', email: 'second@example.invalid', profile_name: 'example2', role: 'admin', is_team_member: true, is_active: true },
  ],
};
const html = renderToStaticMarkup(<MemberEditor member={member} members={[member]} onCancel={() => {}} onSaved={async () => {}} onCombined={async () => {}} />);
assert.equal((html.match(/>Save member</g) || []).length, 1, 'one save action');
assert.match(html, /Founders/);
assert.match(html, /first@example.invalid/);
assert.match(html, /second@example.invalid/);
assert.match(html, />Member details</);
assert.match(html, />Public presentation</);
assert.match(html, />Login &amp; workspace access</);
assert.ok(!html.includes('Profiles &amp; workspace access'));
assert.ok(memberMatches(member, 'SECOND@example.invalid'), 'secondary account is searchable');
assert.ok(memberMatches(member, 'founders'));
assert.ok(!memberMatches(member, 'unrelated'));
const noLogin = renderToStaticMarkup(<MemberEditor member={{ ...member, accounts: [], primary_profile_id: null }} members={[]} onCancel={() => {}} onSaved={async () => {}} onCombined={async () => {}} />);
assert.match(noLogin, /This member has no login account/);
assert.ok(!noLogin.includes('>Access role<'), 'a public-only person has no invented access controls');
console.log('Member editor rendering and search checks passed.');
