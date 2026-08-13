import{j as e}from"./iframe-Bi9I78yM.js";import{g as S}from"./icons-CeCQNAbo.js";import{B as v}from"./Button-C4C_6sNN.js";import{R as a,a as l,H as c,I as s,B as o,b as i,c as m,A as b,S as d}from"./Profile-M61z9cYh.js";import{I as C}from"./Icon-C9gZmzG3.js";import{U as B}from"./UniverseProvider-SOV19ZBb.js";import{m as R}from"./Strings-C1h4ndsz.js";import{g as D}from"./Obj-SoxFuRAr.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-Bvj_EqVZ.js";import"./Optional-BNsUfA-0.js";import"./Fun-DfA6N4bS.js";const j=S(),k={checkmark:j.checkmark,close:j.close,feedback:j.feedback},J={getIcon:r=>D(k,r).getOr(`<svg id="${r}"></svg>`)},t='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%234A90E2"/%3E%3Ctext x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif"%3EJD%3C/text%3E%3C/svg%3E',F={title:"components/Profile",component:a,decorators:[r=>e.jsx(B,{resources:J,children:e.jsx("div",{className:"tox",children:e.jsx(r,{})})})],parameters:{layout:"centered",docs:{description:{component:`
The Profile component is a reusable compound component for displaying user information consistently across plugins.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Image, Body, Heading, and Subheading
- **Flexible Layouts**: Supports avatar, name, timestamp, and metadata
- **Works with Card**: Designed to integrate seamlessly with the Card component

## Usage Pattern

The component uses a compound component pattern with five parts:
- \`Profile.Root\`: Container for the profile
- \`Profile.Image\`: Avatar/profile image
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
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsx(o,{children:e.jsx(i,{children:"John Doe"})})]})})},p={parameters:{docs:{description:{story:`
**Profile without Avatar**

A minimal profile display showing only the name without an avatar image.
Useful when user images are not available or not needed.

Common use case: System-generated suggestions or when avatars are disabled.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsx(a,{children:e.jsx(o,{children:e.jsx(i,{children:"System"})})})})},u={parameters:{docs:{description:{story:`
**Profile with Timestamp**

Profile with avatar, name, and timestamp subheading.
This is the most common pattern for feedback and comment systems.

Common use case: Displaying when a user made a suggestion or left feedback.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsxs(o,{children:[e.jsx(i,{children:"John Doe"}),e.jsx(d,{children:"2 hours ago"})]})]})})},f={parameters:{docs:{description:{story:`
**Profile in Card Header**

Demonstrates how Profile integrates with the Card component header.
This shows a typical Suggested Edits card pattern with user attribution.

Common use case: Review cards, suggestion cards, and activity feeds.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Doe"}),e.jsx(o,{children:e.jsx(i,{children:"John Doe"})})]})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(b,{children:[e.jsxs(v,{variant:"outlined",children:[e.jsx(C,{icon:"close"}),"Skip"]}),e.jsxs(v,{variant:"outlined",children:[e.jsx(C,{icon:"checkmark"}),"Apply"]})]})]})})},g={parameters:{docs:{description:{story:`
**Profile with Timestamp in Card**

Shows Profile with timestamp metadata integrated into a Card.
This is the pattern used in feedback systems where both author and time are important.

Common use case: Comment cards, review feedback, revision history.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"Jane Smith"}),e.jsxs(o,{children:[e.jsx(i,{children:"Jane Smith"}),e.jsx(d,{children:"Yesterday at 3:45 PM"})]})]})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion looks good, but we should verify the facts about the 2008-2012 era."})}),e.jsxs(b,{children:[e.jsx(v,{variant:"outlined",children:"Edit"}),e.jsx(v,{variant:"outlined",children:"Delete"})]})]})})},y={parameters:{docs:{description:{story:`
**Multiple Profiles in Cards**

Demonstrates consistency across multiple cards with different users.
Shows how Profile maintains visual consistency in a list of items.

Common use case: Activity feed, comment thread, suggestion list.
        `}}},render:()=>{const r=[{name:"John Doe",time:"2 hours ago",avatar:t},{name:"Jane Smith",time:"Yesterday",avatar:t.replace("JD","JS").replace("4A90E2","E24A90")},{name:"Bob Wilson",time:"Last week",avatar:t.replace("JD","BW").replace("4A90E2","90E24A")}];return e.jsx("div",{style:{width:"316px",display:"flex",flexDirection:"column",gap:"12px"},children:R(r,(n,A)=>e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:n.avatar,alt:n.name}),e.jsxs(o,{children:[e.jsx(i,{children:n.name}),e.jsx(d,{children:n.time})]})]})}),e.jsx(m,{children:e.jsxs("p",{style:{margin:0},children:["Review comment from ",n.name]})})]},A))})}},x={parameters:{docs:{description:{story:`
**Profile with Custom Content**

Shows flexibility of the compound component pattern.
You can add custom elements like badges, icons, or status indicators.

Common use case: AI attribution badges, verified user indicators, role labels.
        `}}},render:()=>e.jsx("div",{style:{width:"316px",padding:"12px",backgroundColor:"#f9f9f9"},children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"AI Assistant"}),e.jsxs(o,{children:[e.jsxs(i,{children:["AI Assistant",e.jsx("span",{style:{marginLeft:"8px",fontSize:"12px",color:"#666"},children:"🤖"})]}),e.jsx(d,{children:"Generated just now"})]})]})})},P={parameters:{docs:{description:{story:`
**Profile with Metadata and Count**

Profile with avatar, name, timestamp, and a count indicator.
Useful for displaying user activity with associated metrics (comments, reactions, etc.).

Common use case: Activity feeds, comment threads, revision history.
        `}}},render:()=>e.jsx("div",{style:{width:"316px"},children:e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:t,alt:"John Mac Giolla Phádraig"}),e.jsxs(o,{children:[e.jsx(i,{children:"John Mac Giolla Phádraig"}),e.jsxs(d,{children:["May 18, 9:12 AM"," • ",2," ",e.jsx(C,{icon:"feedback","aria-label":"comments"})]})]})]})}),e.jsx(m,{children:e.jsxs("div",{children:[e.jsx("p",{style:{margin:"0 0 8px 0",fontWeight:"bold"},children:"Deleted text"}),e.jsx("p",{style:{margin:0},children:"In many ways"})]})})]})})},w={parameters:{docs:{description:{story:`
**Multiple Profiles with Counts**

Multiple cards showing different count states:
- Profile in header with user info
- Timestamp with optional count indicator
- Shows count and icon when present
- Shows only timestamp when count is zero

Demonstrates consistent layout across multiple items.
        `}}},render:()=>{const r=[{user:"John Mac Giolla Phádraig",avatar:t,timestamp:"May 18, 9:12 AM",count:2,title:"Deleted text",content:"In many ways"},{user:"Jane Smith",avatar:t.replace("JD","JS").replace("4A90E2","E24A90"),timestamp:"May 18, 10:30 AM",count:5,title:"Modified paragraph",content:"Changed wording for clarity"},{user:"Bob Wilson",avatar:t.replace("JD","BW").replace("4A90E2","90E24A"),timestamp:"May 18, 2:45 PM",count:0,title:"Added heading",content:"New section header"}];return e.jsx("div",{style:{width:"316px",display:"flex",flexDirection:"column",gap:"12px"},children:R(r,(n,A)=>e.jsxs(l,{children:[e.jsx(c,{children:e.jsxs(a,{children:[e.jsx(s,{src:n.avatar,alt:n.user}),e.jsxs(o,{children:[e.jsx(i,{children:n.user}),e.jsxs(d,{children:[n.count>0?`${n.timestamp} • ${n.count} `:n.timestamp,n.count>0&&e.jsx(C,{icon:"feedback","aria-label":"comments"})]})]})]})}),e.jsx(m,{children:e.jsxs("div",{children:[e.jsx("p",{style:{margin:"0 0 8px 0",fontWeight:"bold"},children:n.title}),e.jsx("p",{style:{margin:0},children:n.content})]})})]},A))})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};const Y=["WithAvatar","WithoutAvatar","WithTimestamp","InCardHeader","InCardWithTimestamp","MultipleProfilesInCards","WithCustomContent","WithMetadataAndCount","MultipleWithCounts"];export{f as InCardHeader,g as InCardWithTimestamp,y as MultipleProfilesInCards,w as MultipleWithCounts,h as WithAvatar,x as WithCustomContent,P as WithMetadataAndCount,u as WithTimestamp,p as WithoutAvatar,Y as __namedExportsOrder,F as default};
