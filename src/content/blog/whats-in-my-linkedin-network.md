---
title: "My LinkedIn Network Breakdown"
description: 'I exported my 1k+ LinkedIn connections and analyzed them using AI, then rendered everything on a dashboard. You can do that too.'
pubDate: 'Apr 23 2026'
tags: linkedin network-analysis marketing data-analysis
heroImage: /images/linkedin-network-dashboard.png
---

I recently got curious about the actual structure of my LinkedIn network. Who am I really connected to? What industries do they work in? Instead of just wondering, I decided to pull the data and see the breakdown for myself. 

Here is how I built this dashboard, the tools I used, and how you can replicate the process!


## Getting the Raw Data

There are two main ways to get your hands on your connection data: the native route and the shortcut.

**Method 1: The Native LinkedIn Export**

LinkedIn actually has a built-in option to export your data, including your connections. You can find this in your settings under `Profile / Settings & privacy / Data privacy / Download your data`. 

When you request it, LinkedIn sends the data in two parts:

- Part 1 (Fast): Basic data like articles, invitations, profile info, and recommendations. This usually arrives within 10 minutes.

- Part 2 (Slow): The part we actually care about—the connections. This can take up to 24 hours to generate.


**Method 2: The SaaS Route (What I did)**

Instead of waiting, I used a SaaS tool called [LeadDelta](https://leaddelta.com). They offer a web app with a browser extension that automatically scrapes your connections. It is a paid app, but they offer a free trial period—which is more than enough time to fetch your data and export it as a CSV. 

*Note: LeadDelta can also enrich your data with contact info and other metrics, but that sits behind a paywall and I haven't tested it yet. For this project, the basic CSV export was perfect.*


## Data Analysis: Letting AI Do the Heavy Lifting

You might think analyzing a massive CSV file would be the hardest part of this project, but it was actually the easiest. 

I skipped the complex spreadsheet formulas and simply uploaded the entire CSV file directly to Claude Cowork. I prompted the AI to give me a complete breakdown of the demographics, industries, and roles. Within seconds, it generated a comprehensive markdown report and even produced a basic, functional dashboard layout.


## Dashboard Polish: **gpt-image-2** in Action

This week, OpenAI launched a new image generation model called gpt-image-2. After seeing some of the incredible infographics people were creating with it, I knew this was the perfect test case.

Rather than feeding the model my raw markdown report, I utilized its image-editing capabilities. I uploaded the basic dashboard that Claude had generated, provided gpt-image-2 with some specific design guidelines in the prompt, and let it handle the visual polish. The result is the clean, professional dashboard you see at the top of this post.


## What's Next?

I am at the very beginning of my journey into understanding social media networking, lead generation, and marketing strategies. This dashboard was an incredible first step in understanding exactly who is in my audience. I'm hungry to learn and build more.

Stay tuned for next chapters in my journey!