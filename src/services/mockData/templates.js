const mockTemplates = [
  {
    Id: 1,
    name: "Tech Tutorial",
    description: "Step-by-step technical tutorial template with code examples",
    category: "Tutorial",
    content: `# How to [Tutorial Title]

## Overview
Brief introduction explaining what readers will learn and why it's important.

## Prerequisites
- Requirement 1
- Requirement 2
- Requirement 3

## Step 1: Getting Started
Explanation of the first step with detailed instructions.

\`\`\`javascript
// Code example
function example() {
  console.log("Hello World");
}
\`\`\`

## Step 2: Implementation
Continue with the next major step.

## Step 3: Testing
How to verify everything works correctly.

## Conclusion
Summary of what was accomplished and next steps.

## Additional Resources
- [Link 1](https://example.com)
- [Link 2](https://example.com)`,
    excerpt: "A comprehensive template for creating step-by-step technical tutorials with code examples and clear structure.",
    keywords: ["tutorial", "programming", "guide", "development"],
    metaTitle: "[Tutorial Title] - Complete Guide",
    metaDescription: "Learn [skill/technology] with this comprehensive step-by-step tutorial including code examples and best practices.",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    usageCount: 15,
    lastUsedAt: "2024-01-20T14:30:00Z"
  },
  {
    Id: 2,
    name: "Product Review",
    description: "Comprehensive product review template with pros, cons, and ratings",
    category: "Review",
    content: `# [Product Name] Review: [Brief Opinion]

![Product Image](https://via.placeholder.com/800x400?text=Product+Image)

## Quick Summary
**Rating:** ⭐⭐⭐⭐⭐ (X/5 stars)
**Price:** $XX.XX
**Best For:** [Target audience]

## What We Liked
✅ Feature 1 - Why it's great
✅ Feature 2 - Why it's great  
✅ Feature 3 - Why it's great

## What Could Be Better
❌ Issue 1 - Why it's problematic
❌ Issue 2 - Why it's problematic

## Key Features
- **Feature 1:** Detailed explanation
- **Feature 2:** Detailed explanation
- **Feature 3:** Detailed explanation

## Performance
Detailed analysis of how the product performs in real-world scenarios.

## Value for Money
Is it worth the price? Comparison with alternatives.

## Final Verdict
Overall recommendation and who should/shouldn't buy this product.

**Bottom Line:** [One sentence summary of your recommendation]`,
    excerpt: "An honest and comprehensive review template covering all aspects from features to value for money.",
    keywords: ["review", "product", "recommendation", "buying guide"],
    metaTitle: "[Product Name] Review - Honest Opinion & Rating",
    metaDescription: "Read our comprehensive [Product Name] review including pros, cons, performance analysis and final verdict to help you decide.",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    usageCount: 8,
    lastUsedAt: "2024-01-18T11:20:00Z"
  },
  {
    Id: 3,
    name: "Industry News",
    description: "Breaking news template for industry updates and announcements",
    category: "News",
    content: `# [Compelling Headline About the News]

**[City, Date]** - [Lead paragraph summarizing the most important information - who, what, when, where, why]

## Key Details
- **What Happened:** Brief description
- **When:** Specific date/time
- **Who's Involved:** Key players/companies
- **Impact:** Who this affects

## Background Context
Provide necessary background information to help readers understand the significance of this news.

## What This Means
Analysis of the implications and potential consequences:
- For consumers
- For the industry  
- For competitors
- For the market

## Expert Opinions
> "Quote from industry expert or stakeholder"
> - **Name, Title, Company**

## What's Next
Expected developments, timeline, and what to watch for.

## Related Coverage
- [Previous related story](link)
- [Background article](link)

---
*This is a developing story. We'll update this article as more information becomes available.*`,
    excerpt: "Breaking news template designed for timely industry updates with proper structure and context.",
    keywords: ["news", "industry", "update", "breaking"],
    metaTitle: "[News Headline] - Latest Industry Update",
    metaDescription: "Breaking: [Brief description of the news] - Get the latest details, analysis, and expert opinions on this developing story.",
    createdAt: "2024-01-08T07:30:00Z",
    updatedAt: "2024-01-08T07:30:00Z",
    usageCount: 12,
    lastUsedAt: "2024-01-19T09:15:00Z"
  },
  {
    Id: 4,
    name: "How-To Guide",
    description: "Simple how-to guide template for practical instructions",
    category: "Tutorial",
    content: `# How to [Accomplish the Goal]

*Estimated time: X minutes | Difficulty: Beginner/Intermediate/Advanced*

## What You'll Need
- Item 1
- Item 2  
- Item 3
- Tool 1
- Tool 2

## Before You Start
Important considerations, safety notes, or preparations.

## Step-by-Step Instructions

### Step 1: [Action]
Clear, specific instruction with any important details or warnings.

**Tip:** Helpful advice to make this step easier or more effective.

### Step 2: [Action]  
Continue with the next step.

### Step 3: [Action]
And so on...

## Troubleshooting
**Problem:** Common issue that might occur
**Solution:** How to fix it

**Problem:** Another common issue
**Solution:** How to resolve it

## Wrapping Up
What the end result should look like and any final tips.

## Related Guides
- [Related How-To 1](link)
- [Related How-To 2](link)`,
    excerpt: "A straightforward template for creating clear, actionable how-to guides with troubleshooting tips.",
    keywords: ["how-to", "guide", "tutorial", "instructions"],
    metaTitle: "How to [Goal] - Simple Step-by-Step Guide",
    metaDescription: "Learn how to [accomplish goal] with this easy-to-follow guide including step-by-step instructions and troubleshooting tips.",
    createdAt: "2024-01-05T14:20:00Z",
    updatedAt: "2024-01-07T10:15:00Z",
    usageCount: 22,
    lastUsedAt: "2024-01-21T16:45:00Z"
  },
  {
    Id: 5,
    name: "Opinion Piece",
    description: "Editorial template for sharing opinions and perspectives on topics",
    category: "Opinion",
    content: `# [Strong, Opinion-Driven Headline]

*[Subtitle that clarifies your position or adds context]*

## The Issue at Hand
Present the topic, situation, or debate you're addressing. Provide enough context for readers to understand the background.

## My Take
**Here's where I stand:** [Clear statement of your position]

The reason I feel strongly about this is [explanation of your reasoning].

## Why This Matters
This isn't just another opinion piece. Here's why this topic deserves attention:
- Point 1: Impact on society/industry/readers
- Point 2: Long-term consequences  
- Point 3: Personal relevance

## The Other Side
I understand that others might argue [acknowledge opposing viewpoints]. And they have valid points about [give credit where due].

However, I believe [explain why your position is stronger].

## What We Should Do
Here's what I think needs to happen:
1. Action item 1
2. Action item 2
3. Action item 3

## Final Thoughts
[Powerful closing that reinforces your main point and calls readers to action or reflection]

---
*What do you think? Share your perspective in the comments below.*`,
    excerpt: "A balanced opinion piece template that presents strong viewpoints while acknowledging different perspectives.",
    keywords: ["opinion", "editorial", "perspective", "commentary"],
    metaTitle: "[Opinion Topic] - My Take on [Issue]",
    metaDescription: "My perspective on [topic/issue] and why I think [brief summary of position]. Read the full argument and share your thoughts.",
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-03T11:00:00Z",
    usageCount: 6,
    lastUsedAt: "2024-01-17T13:30:00Z"
  }
]

export default mockTemplates