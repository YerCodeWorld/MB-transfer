# MBT PLATFORM

This platform belongs to 'MB Transfer', a DR-based, uber-like transportation company
that operates with pre-scheduled services with set routes hotel-airport, airport-hotel
and hotel-hotel, having overseas allies like AirportTransfer [https://airporttransfer.com]
(poland) and Sacbé Transfer (Mexico). 

## What's inside?

While we are using a monorepo architecture, that is thinking on the future. For the moment,
we only have a single app at @apps/mbt, which features a 'simple' frontend with first an
authorization bridge page, and then the single-source-of-truth platform (a single page with
a view section).

Possible additions would be the express API server that would work as a bridge to the database
and that would provide the endpoints that could be used by any frontend. 

### MBT App structure 

- `contexts`: shows the authorization and navigation context for our view-based app
- `components`: contains all the components used by the app
- `components/compound`: contains sections, which are components based off the stack of other components
- `public`: contains all the images, would also include future audio files and other media

### Tech Stack 

The whole thing is constructed using the following technologies:

- Reach as a frontend framework
- NextJS as build and routing system
- TSX + Tailwind based components 
- ESLINT 
- Turborepo as monorepo build tool 

Other main dependencies include:

- react-icons library
- framer-motion
- daisy-ui
- many other react/next-specific tools, like react-calendar

### Database

The monorepo does not have any hold of the express API yet, but as it's added, it will consist of the previously mentioned
features. It would also hold the prisma DB schema and a home index.html landing page to show status. 

An api-bridge package could be created within the packages folder so that any app created can make use of it and contact
the database without much trouble.

The core of the express api would only allow sources like [http://localhost:3000] or the test deployment [https://mb-transfer-mbt-app.vercel.app]

### Current ongoing development

Right now we are focusing on finishing development of the frontend to later connect with the whole backend and start a fully
functionable MVP. More specific details about these implementations should be communicated directly from the developer. Later
on the inner-notifications (probably using sonnet) or user context, and cybersecurity must also be implemented. 
