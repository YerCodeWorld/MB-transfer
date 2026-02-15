The "Personal" section (this) needs to be updated to satisfy certain things.

- Rather than "Personnel" it should be renamed to something like "Control"; or something different that satisfies the usage of the section.

We should add the following tabs to the bottom bar:

1) Hotels (to add hotels, uses the 'Place' model from the database)

A form that could have:

- Location picker using Google Maps
- kind (airport/hotel/other)
- name
- iata if an airport 
- extra based on the model from the database

2) Zone (to add zones, uses the 'Zone' & 'ZonePrice' models from the database)

- Instead of location we could draw the vectors of the zone on a map, although showing these visuals could be skipped completely 
- name
- list of prices
- any other field essential from the database model

3) Route (to add routes, which are combinations of zones, uses the 'Route' model from the database)

- Select two already existing zones
- Add price, notes, etc 

Fix: 

If accessing a detail (user/vehicle detail or any other), returning to the main view should be set to the last active tab, not the default first tab
