## BUG: 1 

# 'AllServicesView'

Editing OR removing a service from _AirportTransfer_ affects ALL other serivces.

That is:

Editing: Changes All services to be the same as the one that was edited.
Remmoving: Removes all services.

**Analysis Notes:**
This likely occurs due to cache isolation issues in the AllServicesView component. Possible causes:
1. **Reference Mutation**: All services may be sharing the same object reference instead of being properly cloned
2. **Cache Key Confusion**: The edit/remove operations might be updating the wrong cache key or affecting multiple cache keys simultaneously
3. **State Management Issue**: The unified services array in AllServicesView may not properly maintain separation between AT/ST/MBT service origins
4. **Date-specific Cache Problems**: Edit operations might be affecting the global cache instead of the date-specific cache, causing cross-contamination between service types
5. **Array Reference Issue**: The services array might be directly mutated rather than using immutable update patterns, causing all components to reflect the same changes

## BUG: 2

The 'detail' modal that can be accessed throught the <ServiceTable /> or even the editing service modal
in the AllServicesView appear below the header and bottombar. We need to make sure these modals absolute 
top positioning and anything else is disabled. This apparently cannot be fixed by simply adding more z-index.

**Analysis Notes:**
This is a CSS stacking context and positioning issue. Possible causes:
1. **Stacking Context Isolation**: The header/bottombar may create their own stacking contexts with high z-index values, preventing modals from appearing above them regardless of z-index
2. **Portal/Rendering Location**: Modals may be rendered within the main page flow instead of being portaled to document.body or a dedicated modal root
3. **Transform/Position Parent**: A parent element with transform, filter, or certain position values creates a new stacking context that traps the modal
4. **Fixed Position Conflicts**: Both header/bottombar and modals may be using fixed positioning, causing layering conflicts
5. **CSS Framework Interference**: Tailwind or other CSS frameworks may be applying conflicting positioning styles
6. **Overflow Hidden**: A parent container may have overflow: hidden that clips the modal
7. **Missing Modal Backdrop**: The modal may need a proper backdrop element to establish correct stacking order

**Recommended Solutions:**
- Use React Portal to render modals at document.body level
- Ensure modals use a z-index higher than header (typically 9999+)
- Check for parent elements with transform/filter properties that create stacking contexts
- Implement proper modal backdrop with pointer-events management

## FIX

I found a potential fix (it worked for the bottom bar, 50% through in the header). I removed the backdrop classes
they had and that was it. For some reason that was interfering, possibly because that class contiains some layering 
styling. The header still shows the text and search bar enabled though. 

## BUG: 1

# Styling Bug 

This component [@apps/mbt-app/components/compound/dateservices/components/Schedule.tsx]
Does not follow the accent color everywhere. It could also benefit from better styling. 

# Lacking Feature

It could benefit if we extended it adding a 'detail' button where when clicked, the current view
changed to a detailed calendar showing more details for the services of the day.

**What must be done**

Correcting the issues with the styling of the calendar and checking the implementation of the detailed calendar.
For an idea of more services-specific information to show, consider showing all three companies and the amount
of services per type, or other stats. 

## FEATURE: 1

The bottom bar populates with Itinerary | Webhooks | Settings -> apply tab logic and implement the settings section.
As settings as you consider, simple feature + checkboxes/switches.

## FEATURE: 2

In the itinerary main page, which I have already revered to as mainview [@apps/mbt-app/components/compound/dateservices/index.tsx]
could benefit if the right section had inner overflow or carousel-like navigation. I left some comments in the page.
------------------------------------------------



