import{j as e}from"./iframe-DB_OZP4i.js";import{g as S}from"./icons-BH388hKR.js";import{U as M}from"./UniverseProvider-Dh5Q69c-.js";import{B as w}from"./Button-BWmegRwO.js";import{R as a,a as l,H as c,I as s,B as r,b as o,c as m,A as R,S as d,d as I}from"./Card-BMV1hYqx.js";import{I as A}from"./Icon-DCA75aEp.js";import{m as B}from"./Strings-DwL7BECk.js";import{i as k}from"./Optional-CwIPeCD0.js";import{g as H}from"./Obj-BEXbhZhc.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-Du84Tdvq.js";import"./Universe-CwOugp-h.js";const b=S(),D={checkmark:b.checkmark,close:b.close,feedback:b.feedback},J={getIcon:i=>H(D,i).getOr(`<svg id="${i}"></svg>`),translate:k},t='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%234A90E2"/%3E%3Ctext x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif"%3EJD%3C/text%3E%3C/svg%3E',T=()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:[e.jsx("path",{d:"M12 0C13.4761 0 14.8892 0.268335 16.1953 0.755859C15.9718 1.01778 15.7746 1.30295 15.6084 1.60742C14.4779 1.21495 13.2641 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 10.7354 22.7843 9.52148 22.3916 8.39063C22.6962 8.22437 22.9812 8.02731 23.2432 7.80371C23.731 9.11013 24 10.5235 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M13.957 16.4551H12.0938L11.4668 14.4043H8.48438L7.85742 16.4551H6L8.93555 8H11.0156L13.957 16.4551ZM8.88867 13.0801H11.0625L10.0313 9.6875H9.92578L8.88867 13.0801Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("path",{d:"M17.1621 8.11621V16.4551H15.3926V8H17C17.0531 8.03992 17.1074 8.07839 17.1621 8.11621Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("path",{d:"M19.25 3.23145C19.4198 4.40128 20.3349 5.32067 21.5 5.49121C20.335 5.66177 19.4198 6.58019 19.25 7.75C19.0802 6.58019 18.165 5.66177 17 5.49121C18.1651 5.32067 19.0802 4.40128 19.25 3.23145Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("path",{d:"M22.0625 1.37695C22.0817 2.30455 22.8261 3.05227 23.75 3.07129C22.826 3.09032 22.0814 3.83783 22.0625 4.76563C22.0436 3.83783 21.299 3.09032 20.375 3.07129C21.2989 3.05227 22.0433 2.30455 22.0625 1.37695Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("path",{d:"M18.125 1C18.3179 1.52333 18.7288 1.93623 19.25 2.12988C18.729 2.3235 18.3179 2.73566 18.125 3.25879C17.9321 2.73566 17.521 2.3235 17 2.12988C17.5212 1.93623 17.9321 1.52333 18.125 1Z",fill:"url(#profile-story-ai-badge)"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"profile-story-ai-badge",x1:"21.4286",y1:"2.4",x2:"-0.158596",y2:"19.3857",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{stopColor:"#FFA95B"}),e.jsx("stop",{offset:"0.286612",stopColor:"#D139FF"}),e.jsx("stop",{offset:"0.689809",stopColor:"#476CFF"}),e.jsx("stop",{offset:"1",stopColor:"#8DFFF4"})]})})]}),O={title:"components/Profile",component:a,decorators:[i=>e.jsx(M,{resources:J,children:e.jsx("div",{className:"tox",children:e.jsx(i,{})})})],parameters:{layout:"centered",docs:{description:{component:`
The Profile component is a reusable compound component for displaying user information consistently across plugins.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Image, Body, Heading, and Subheading
- **Flexible Layouts**: Supports avatar, name, timestamp, and metadata
- **Works with Card**: Designed to integrate seamlessly with the Card component

## Usage Pattern

The component uses a compound component pattern:
- \`Profile.Root\`: Container for the profile
- \`Profile.Image\`: Avatar/profile image
- \`Profile.Badge\`: Optional overlay on the avatar, such as an AI attribution mark
- \`Profile.Body\`: Container for text content
- \`Profile.Heading\`: Main text (usually name)
- \`Profile.Subheading\`: Secondary text (usually timestamp or metadata)

## Integration

Works seamlessly with oxide-components:
- **Card**: For displaying user info in cards
- **Button**: For action buttons
- **Icon**: For badges and indicators
        `}}},tags:["autodocs"],args:{}},h={parameters:{docs:{description:{story:`
**Profile with Avatar**

A complete profile display with avatar image, name, and no additional metadata.
This demonstrates the basic usage pattern with all visual elements.

Common use case: Displaying the author of a suggested edit or comment.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsx(r,{children:e.jsx(o,{children:"John Doe"})})]})})},p={parameters:{docs:{description:{story:`
**Profile without Avatar**

A minimal profile display showing only the name without an avatar image.
Useful when user images are not available or not needed.

Common use case: System-generated suggestions or when avatars are disabled.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsx(a,{children:e.jsx(r,{children:e.jsx(o,{children:"System"})})})})},u={parameters:{docs:{description:{story:`
**Profile with AI badge**

Renders \`Profile.Badge\` as a child of \`Profile.Image\` so the mark overlaps the avatar.
The badge content is supplied by the consumer; this story uses the same AI attribution SVG as Suggested Edits.

Common use case: AI-assisted suggestions and revisions.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Mac Giolla Phádraig",children:e.jsx(I,{children:e.jsx(T,{})})}),e.jsxs(r,{children:[e.jsx(o,{children:"John Mac Giolla Phádraig"}),e.jsx(d,{children:"May 18, 9:12 AM"})]})]})})},f={parameters:{docs:{description:{story:`
**Profile with Timestamp**

Profile with avatar, name, and timestamp subheading.
This is the most common pattern for feedback and comment systems.

Common use case: Displaying when a user made a suggestion or left feedback.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsxs(r,{children:[e.jsx(o,{children:"John Doe"}),e.jsx(d,{children:"2 hours ago"})]})]})})},g={parameters:{docs:{description:{story:`
**Profile in Card Header**

Demonstrates how Profile integrates with the Card component header.
This shows a typical Suggested Edits card pattern with user attribution.

Common use case: Review cards, suggestion cards, and activity feeds.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsx(r,{children:e.jsx(o,{children:"John Doe"})})]})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(R,{children:[e.jsxs(w,{variant:"outlined",children:[e.jsx(A,{icon:"close"}),"Skip"]}),e.jsxs(w,{variant:"outlined",children:[e.jsx(A,{icon:"checkmark"}),"Apply"]})]})]})})},y={parameters:{docs:{description:{story:`
**Profile with Timestamp in Card**

Shows Profile with timestamp metadata integrated into a Card.
This is the pattern used in feedback systems where both author and time are important.

Common use case: Comment cards, review feedback, revision history.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"Jane Smith"}),e.jsxs(r,{children:[e.jsx(o,{children:"Jane Smith"}),e.jsx(d,{children:"Yesterday at 3:45 PM"})]})]})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion looks good, but we should verify the facts about the 2008-2012 era."})}),e.jsxs(R,{children:[e.jsx(w,{variant:"outlined",children:"Edit"}),e.jsx(w,{variant:"outlined",children:"Delete"})]})]})})},x={parameters:{docs:{description:{story:`
**Multiple Profiles in Cards**

Demonstrates consistency across multiple cards with different users.
Shows how Profile maintains visual consistency in a list of items.

Common use case: Activity feed, comment thread, suggestion list.
        `}}},render:()=>{const i=[{name:"John Doe",time:"2 hours ago",avatar:t},{name:"Jane Smith",time:"Yesterday",avatar:t.replace("JD","JS").replace("4A90E2","E24A90")},{name:"Bob Wilson",time:"Last week",avatar:t.replace("JD","BW").replace("4A90E2","90E24A")}];return e.jsx("div",{style:{width:"316px",display:"flex",flexDirection:"column",gap:"12px"},children:B(i,(n,j)=>e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:n.avatar,alt:n.name}),e.jsxs(r,{children:[e.jsx(o,{children:n.name}),e.jsx(d,{children:n.time})]})]})}),e.jsx(m,{children:e.jsxs("p",{style:{margin:0},children:["Review comment from ",n.name]})})]},j))})}},P={parameters:{docs:{description:{story:`
**Profile with Custom Content**

Shows flexibility of the compound component pattern.
You can add custom elements like badges, icons, or status indicators.

Common use case: AI attribution badges, verified user indicators, role labels.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"AI Assistant"}),e.jsxs(r,{children:[e.jsxs(o,{children:["AI Assistant",e.jsx("span",{style:{marginLeft:"8px",fontSize:"12px",color:"#666"},children:"🤖"})]}),e.jsx(d,{children:"Generated just now"})]})]})})},C={parameters:{docs:{description:{story:`
**Profile with Metadata and Count**

Profile with avatar, name, timestamp, and a count indicator.
Useful for displaying user activity with associated metrics (comments, reactions, etc.).

Common use case: Activity feeds, comment threads, revision history.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Mac Giolla Phádraig"}),e.jsxs(r,{children:[e.jsx(o,{children:"John Mac Giolla Phádraig"}),e.jsxs(d,{children:["May 18, 9:12 AM"," • ",2," ",e.jsx(A,{icon:"feedback","aria-label":"comments"})]})]})]})}),e.jsx(m,{children:e.jsxs("div",{children:[e.jsx("p",{style:{margin:"0 0 8px 0",fontWeight:"bold"},children:"Deleted text"}),e.jsx("p",{style:{margin:0},children:"In many ways"})]})})]})})},v={parameters:{docs:{description:{story:`
**Multiple Profiles with Counts**

Multiple cards showing different count states:
- Profile in header with user info
- Timestamp with optional count indicator
- Shows count and icon when present
- Shows only timestamp when count is zero

Demonstrates consistent layout across multiple items.
        `}}},render:()=>{const i=[{user:"John Mac Giolla Phádraig",avatar:t,timestamp:"May 18, 9:12 AM",count:2,title:"Deleted text",content:"In many ways"},{user:"Jane Smith",avatar:t.replace("JD","JS").replace("4A90E2","E24A90"),timestamp:"May 18, 10:30 AM",count:5,title:"Modified paragraph",content:"Changed wording for clarity"},{user:"Bob Wilson",avatar:t.replace("JD","BW").replace("4A90E2","90E24A"),timestamp:"May 18, 2:45 PM",count:0,title:"Added heading",content:"New section header"}];return e.jsx("div",{style:{width:"316px",display:"flex",flexDirection:"column",gap:"12px"},children:B(i,(n,j)=>e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:n.avatar,alt:n.user}),e.jsxs(r,{children:[e.jsx(o,{children:n.user}),e.jsxs(d,{children:[n.count>0?`${n.timestamp} • ${n.count} `:n.timestamp,n.count>0&&e.jsx(A,{icon:"feedback","aria-label":"comments"})]})]})]})}),e.jsx(m,{children:e.jsxs("div",{children:[e.jsx("p",{style:{margin:"0 0 8px 0",fontWeight:"bold"},children:n.title}),e.jsx("p",{style:{margin:0},children:n.content})]})})]},j))})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with Avatar**

A complete profile display with avatar image, name, and no additional metadata.
This demonstrates the basic usage pattern with all visual elements.

Common use case: Displaying the author of a suggested edit or comment.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
          <Profile.Body>
            <Profile.Heading>John Doe</Profile.Heading>
          </Profile.Body>
        </Profile.Root>
      </div>;
  }
}`,...h.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile without Avatar**

A minimal profile display showing only the name without an avatar image.
Useful when user images are not available or not needed.

Common use case: System-generated suggestions or when avatars are disabled.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}>
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>System</Profile.Heading>
          </Profile.Body>
        </Profile.Root>
      </div>;
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with AI badge**

Renders \\\`Profile.Badge\\\` as a child of \\\`Profile.Image\\\` so the mark overlaps the avatar.
The badge content is supplied by the consumer; this story uses the same AI attribution SVG as Suggested Edits.

Common use case: AI-assisted suggestions and revisions.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Mac Giolla Phádraig">
            <Profile.Badge>
              <AiBadgeIcon />
            </Profile.Badge>
          </Profile.Image>
          <Profile.Body>
            <Profile.Heading>John Mac Giolla Phádraig</Profile.Heading>
            <Profile.Subheading>May 18, 9:12 AM</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>;
  }
}`,...u.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with Timestamp**

Profile with avatar, name, and timestamp subheading.
This is the most common pattern for feedback and comment systems.

Common use case: Displaying when a user made a suggestion or left feedback.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
          <Profile.Body>
            <Profile.Heading>John Doe</Profile.Heading>
            <Profile.Subheading>2 hours ago</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>;
  }
}`,...f.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile in Card Header**

Demonstrates how Profile integrates with the Card component header.
This shows a typical Suggested Edits card pattern with user attribution.

Common use case: Review cards, suggestion cards, and activity feeds.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px'
    }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Doe" />
              <Profile.Body>
                <Profile.Heading>John Doe</Profile.Heading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance.
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with Timestamp in Card**

Shows Profile with timestamp metadata integrated into a Card.
This is the pattern used in feedback systems where both author and time are important.

Common use case: Comment cards, review feedback, revision history.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px'
    }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="Jane Smith" />
              <Profile.Body>
                <Profile.Heading>Jane Smith</Profile.Heading>
                <Profile.Subheading>Yesterday at 3:45 PM</Profile.Subheading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              This suggestion looks good, but we should verify the facts about the 2008-2012 era.
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">Edit</Button>
            <Button variant="outlined">Delete</Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...y.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Multiple Profiles in Cards**

Demonstrates consistency across multiple cards with different users.
Shows how Profile maintains visual consistency in a list of items.

Common use case: Activity feed, comment thread, suggestion list.
        \`
      }
    }
  },
  render: () => {
    const users = [{
      name: 'John Doe',
      time: '2 hours ago',
      avatar: AVATAR_URL
    }, {
      name: 'Jane Smith',
      time: 'Yesterday',
      avatar: AVATAR_URL.replace('JD', 'JS').replace('4A90E2', 'E24A90')
    }, {
      name: 'Bob Wilson',
      time: 'Last week',
      avatar: AVATAR_URL.replace('JD', 'BW').replace('4A90E2', '90E24A')
    }];
    return <div style={{
      width: '316px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
        {Arr.map(users, (user, index) => <Card.Root key={index}>
            <Card.Header>
              <Profile.Root>
                <Profile.Image src={user.avatar} alt={user.name} />
                <Profile.Body>
                  <Profile.Heading>{user.name}</Profile.Heading>
                  <Profile.Subheading>{user.time}</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.Header>
            <Card.Body>
              <p style={{
            margin: 0
          }}>
                Review comment from {user.name}
              </p>
            </Card.Body>
          </Card.Root>)}
      </div>;
  }
}`,...x.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with Custom Content**

Shows flexibility of the compound component pattern.
You can add custom elements like badges, icons, or status indicators.

Common use case: AI attribution badges, verified user indicators, role labels.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '316px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="AI Assistant" />
          <Profile.Body>
            <Profile.Heading>
              AI Assistant
              <span style={{
              marginLeft: '8px',
              fontSize: '12px',
              color: '#666'
            }}>🤖</span>
            </Profile.Heading>
            <Profile.Subheading>Generated just now</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>;
  }
}`,...P.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Profile with Metadata and Count**

Profile with avatar, name, timestamp, and a count indicator.
Useful for displaying user activity with associated metrics (comments, reactions, etc.).

Common use case: Activity feeds, comment threads, revision history.
        \`
      }
    }
  },
  render: () => {
    const count = 2;
    const timestamp = 'May 18, 9:12 AM';
    return <div style={{
      width: '316px'
    }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla Phádraig" />
              <Profile.Body>
                <Profile.Heading>John Mac Giolla Phádraig</Profile.Heading>
                <Profile.Subheading>
                  {timestamp} • {count} <Icon icon="feedback" aria-label="comments" />
                </Profile.Subheading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
          <Card.Body>
            <div>
              <p style={{
              margin: '0 0 8px 0',
              fontWeight: 'bold'
            }}>Deleted text</p>
              <p style={{
              margin: 0
            }}>In many ways</p>
            </div>
          </Card.Body>
        </Card.Root>
      </div>;
  }
}`,...C.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Multiple Profiles with Counts**

Multiple cards showing different count states:
- Profile in header with user info
- Timestamp with optional count indicator
- Shows count and icon when present
- Shows only timestamp when count is zero

Demonstrates consistent layout across multiple items.
        \`
      }
    }
  },
  render: () => {
    const cards = [{
      user: 'John Mac Giolla Phádraig',
      avatar: AVATAR_URL,
      timestamp: 'May 18, 9:12 AM',
      count: 2,
      title: 'Deleted text',
      content: 'In many ways'
    }, {
      user: 'Jane Smith',
      avatar: AVATAR_URL.replace('JD', 'JS').replace('4A90E2', 'E24A90'),
      timestamp: 'May 18, 10:30 AM',
      count: 5,
      title: 'Modified paragraph',
      content: 'Changed wording for clarity'
    }, {
      user: 'Bob Wilson',
      avatar: AVATAR_URL.replace('JD', 'BW').replace('4A90E2', '90E24A'),
      timestamp: 'May 18, 2:45 PM',
      count: 0,
      title: 'Added heading',
      content: 'New section header'
    }];
    return <div style={{
      width: '316px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
        {Arr.map(cards, (card, index) => <Card.Root key={index}>
            <Card.Header>
              <Profile.Root>
                <Profile.Image src={card.avatar} alt={card.user} />
                <Profile.Body>
                  <Profile.Heading>{card.user}</Profile.Heading>
                  <Profile.Subheading>
                    {card.count > 0 ? \`\${card.timestamp} • \${card.count} \` : card.timestamp}
                    {card.count > 0 && <Icon icon="feedback" aria-label="comments" />}
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.Header>
            <Card.Body>
              <div>
                <p style={{
              margin: '0 0 8px 0',
              fontWeight: 'bold'
            }}>{card.title}</p>
                <p style={{
              margin: 0
            }}>{card.content}</p>
              </div>
            </Card.Body>
          </Card.Root>)}
      </div>;
  }
}`,...v.parameters?.docs?.source}}};const N=["WithAvatar","WithoutAvatar","WithAiBadge","WithTimestamp","InCardHeader","InCardWithTimestamp","MultipleProfilesInCards","WithCustomContent","WithMetadataAndCount","MultipleWithCounts"];export{g as InCardHeader,y as InCardWithTimestamp,x as MultipleProfilesInCards,v as MultipleWithCounts,u as WithAiBadge,h as WithAvatar,P as WithCustomContent,C as WithMetadataAndCount,f as WithTimestamp,p as WithoutAvatar,N as __namedExportsOrder,O as default};
